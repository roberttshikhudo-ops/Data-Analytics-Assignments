import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import sharp from "sharp"
import {
  KidsBeddingCatalogue,
  type KidsBeddingCatalogueProduct,
  type KidsBeddingCatalogueSeriesGroup,
} from "@/lib/kids-bedding-catalogue-pdf"

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

// Only the "Agri Hub Kids Bedding" range is eligible for this catalogue.
function isKidsBedding(name: string): boolean {
  return name.includes("kids bedding")
}

// Character series so the kids sets are clearly categorised. Each product is
// assigned to the FIRST series it matches, so ordering matters and a product
// never appears twice. A catch-all guarantees nothing is dropped.
interface SeriesDef {
  title: string
  subtitle?: string
  match: (name: string) => boolean
}

const SERIES: SeriesDef[] = [
  {
    title: "Mickey & Minnie Mouse",
    subtitle: "Disney Mickey and Minnie Mouse character sets",
    match: (n) => n.includes("mickey") || n.includes("minnie"),
  },
  {
    title: "Spider-Man",
    subtitle: "Marvel Spider-Man action character sets",
    match: (n) => n.includes("spider-man") || n.includes("spiderman"),
  },
  {
    title: "Hello Kitty",
    subtitle: "Hello Kitty character sets",
    match: (n) => n.includes("hello kitty"),
  },
  {
    title: "Lilo & Stitch",
    subtitle: "Disney Stitch character sets",
    match: (n) => n.includes("stitch"),
  },
  {
    title: "Disney Frozen",
    subtitle: "Frozen Elsa and Anna character sets",
    match: (n) => n.includes("frozen"),
  },
  {
    title: "More Kids Designs",
    subtitle: "Additional character bedding",
    match: () => true,
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

  // Only the Kids Bedding range in the Home & Living category.
  const eligible = (products || []).filter(
    (p: any) =>
      p.categories?.slug === "home-living" && isKidsBedding((p.name || "").toLowerCase()),
  )

  // Build the groups in the requested order. Each product is assigned to the
  // first series it matches, so it never appears twice.
  const groups: KidsBeddingCatalogueSeriesGroup[] = []

  for (const series of SERIES) {
    const matched = eligible.filter((p: any) => series.match((p.name || "").toLowerCase()))

    if (matched.length === 0) continue

    // Remove assigned products from the pool so later series don't re-match them.
    for (const m of matched) {
      const idx = eligible.indexOf(m)
      if (idx !== -1) eligible.splice(idx, 1)
    }

    const seriesProducts: KidsBeddingCatalogueProduct[] = await Promise.all(
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
    createElement(KidsBeddingCatalogue, {
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
      "Content-Disposition": 'attachment; filename="Agri-Hub-Kids-Bedding-Catalogue.pdf"',
      "Cache-Control": "no-store",
    },
  })
}
