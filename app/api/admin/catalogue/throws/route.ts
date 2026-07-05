import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import sharp from "sharp"
import {
  ThrowsCatalogue,
  type ThrowsCatalogueProduct,
  type ThrowsCatalogueSeriesGroup,
} from "@/lib/throws-catalogue-pdf"

// @react-pdf/renderer and fs require the Node.js runtime, and the PDF must be
// generated fresh on each request.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BUSINESS_INFO = {
  name: "Agri Hub SA",
  tagline: "Your Agricultural, Hardware and Lifestyle Innovation Partner",
  phone: "083 306 1529",
  altPhone: "060 839 1874",
  email: "robert.tshikhudo@gmail.com",
  website: "www.agrihubsa.co.za",
  address: "The Parks, Riversands, Midrand, Johannesburg, SA",
}

// Banking details — kept in sync with the invoice (lib/invoice.ts).
const BANKING_INFO = {
  bank: "First National Bank (FNB)",
  accountName: "Agri Hub SA",
  accountNumber: "63014180606",
  branchCode: "250655",
}

// Only throws and fleece products from the Home & Living category are eligible.
// A product must match this gate before it can be placed in any series.
function isThrowOrFleece(name: string): boolean {
  return (
    name.includes("throw") ||
    name.includes("fleece") ||
    name.includes("flee") ||
    name.includes("corduroy")
  )
}

// Professionalised series. Each product is assigned to the FIRST series it
// matches, so ordering matters and a product never appears twice.
interface SeriesDef {
  title: string
  subtitle?: string
  match: (name: string) => boolean
}

const SERIES: SeriesDef[] = [
  // Premium ribbed faux-fur throws (the "Gen, Throw Fleece" range, R195).
  {
    title: "Ribbed Faux-Fur Throws",
    subtitle: "Plush ribbed faux-fur - 180cm x 200cm",
    match: (n) => n.includes("gen, throw fleece") || n.startsWith("gen,"),
  },

  // Embossed / textured fleece throws (the "Throw Flee" range, R195).
  {
    title: "Embossed Fleece Throws",
    subtitle: "Soft embossed fleece - 180cm x 200cm",
    match: (n) => n.includes("throw flee-") || n.includes("throw flee ("),
  },

  // Corduroy fleece throws (R180). Corduroy comforters (e.g. the
  // "5pcs Corduroy Comforter" sets) are explicitly excluded.
  {
    title: "Corduroy Fleece Throws",
    subtitle: "Ribbed corduroy fleece - 180cm x 200cm",
    match: (n) => n.includes("corduroy") && !n.includes("comforter"),
  },

  // Premium plain fleece throws — "Fleece Throw 180cm X 200cm" (R255).
  {
    title: "Premium Fleece Throws",
    subtitle: "Luxuriously soft fleece - 180cm x 200cm",
    match: (n) => n.includes("fleece throw 180cm"),
  },

  // Value fleece throws — "Throw fleece, 180cm X 200cm" (R160).
  {
    title: "Value Fleece Throws",
    subtitle: "Everyday cosy fleece - 180cm x 200cm",
    match: (n) => n.includes("throw fleece, 180cm"),
  },

  // Reversible / large fleece throws — "Throw Fleece 200cm x 230cm" (R255).
  {
    title: "Reversible Fleece Throws",
    subtitle: "Two-tone reversible fleece - 200cm x 230cm",
    match: (n) => n.includes("throw fleece 200cm"),
  },

  // Soft throw blankets — everything else that is a throw.
  {
    title: "Soft Throw Blankets",
    subtitle: "Lightweight, versatile throw blankets",
    match: (n) => n.includes("soft throw blanket") || n.includes("throw blanket") || n.includes("throw"),
  },
]

// Detects the real image format from the file's magic bytes rather than trusting
// the extension, because @react-pdf/renderer silently drops images whose declared
// MIME type doesn't match the actual bytes.
function mimeFromBuffer(buf: Buffer): string {
  if (buf.length >= 8 && buf.toString("hex", 0, 8) === "89504e470d0a1a0a") {
    return "image/png"
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg"
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp"
  }
  return "image/jpeg"
}

// Downscales and re-encodes an image so the catalogue stays email-friendly.
async function compressImage(
  buf: Buffer,
  variant: "product" | "logo",
): Promise<{ data: Buffer; mime: string }> {
  try {
    if (variant === "logo") {
      const data = await sharp(buf)
        .resize({ width: 360, withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer()
      return { data, mime: "image/png" }
    }

    const data = await sharp(buf)
      .resize({ width: 520, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer()
    return { data, mime: "image/jpeg" }
  } catch {
    return { data: buf, mime: mimeFromBuffer(buf) }
  }
}

// Converts a product image into a base64 data URI so it can be embedded in the
// PDF. Works both locally (filesystem) and on Vercel (HTTP fetch).
async function imageToDataUri(
  imageUrl: string | null,
  origin: string,
  variant: "product" | "logo" = "product",
): Promise<string | null> {
  if (!imageUrl) return null

  const cleanPath = imageUrl.split("?")[0]

  const encode = async (buf: Buffer) => {
    const { data, mime } = await compressImage(buf, variant)
    return `data:${mime};base64,${data.toString("base64")}`
  }

  if (cleanPath.startsWith("http")) {
    try {
      const res = await fetch(cleanPath)
      if (res.ok) {
        return await encode(Buffer.from(await res.arrayBuffer()))
      }
    } catch {
      return null
    }
    return null
  }

  try {
    const filePath = path.join(process.cwd(), "public", cleanPath)
    const buf = await readFile(filePath)
    return await encode(buf)
  } catch {
    // fall through to HTTP fetch
  }

  try {
    const absolute = `${origin}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`
    const res = await fetch(absolute)
    if (res.ok) {
      return await encode(Buffer.from(await res.arrayBuffer()))
    }
  } catch {
    return null
  }

  return null
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("name, price, compare_at_price, image_url, short_description, categories(slug)")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }

  // Only throws & fleece products in the Home & Living category.
  const eligible = (products || []).filter(
    (p: any) =>
      p.categories?.slug === "home-living" && isThrowOrFleece((p.name || "").toLowerCase()),
  )

  // Build the groups in the exact requested order. Each product is assigned to
  // the first series it matches, so it never appears twice.
  const groups: ThrowsCatalogueSeriesGroup[] = []

  for (const series of SERIES) {
    const matched = eligible.filter((p: any) => series.match((p.name || "").toLowerCase()))

    if (matched.length === 0) continue

    // Remove assigned products from the pool so later series don't re-match them.
    for (const m of matched) {
      const idx = eligible.indexOf(m)
      if (idx !== -1) eligible.splice(idx, 1)
    }

    const seriesProducts: ThrowsCatalogueProduct[] = await Promise.all(
      matched.map(async (p: any) => ({
        name: p.name,
        price: p.price,
        compareAtPrice: p.compare_at_price,
        description: p.short_description ?? null,
        imageDataUri: await imageToDataUri(p.image_url, origin),
      })),
    )

    groups.push({ title: series.title, subtitle: series.subtitle, products: seriesProducts })
  }

  const generatedDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const logoDataUri = await imageToDataUri("/agri-hub-logo.png", origin, "logo")

  const buffer = await renderToBuffer(
    createElement(ThrowsCatalogue, {
      groups,
      business: BUSINESS_INFO,
      banking: BANKING_INFO,
      logoDataUri,
      generatedDate,
    }) as ReactElement<DocumentProps>,
  )

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Agri-Hub-Throws-and-Flees.pdf"',
      "Cache-Control": "no-store",
    },
  })
}
