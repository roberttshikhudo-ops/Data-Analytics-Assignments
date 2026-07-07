import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import sharp from "sharp"
import {
  BeddingCatalogueFive,
  type CatalogueProduct,
  type CatalogueSeriesGroup,
} from "@/lib/bedding-catalogue-pdf-5"

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

// The exact series order, listed start to finish. Each product is assigned to
// the FIRST series it matches, so ordering matters and a product never appears
// twice. Catalogue 5 applies NO exclusions and uses a catch-all "Other Bedding"
// group so every active Home & Living item is included and classified.
interface SeriesDef {
  title: string
  match: (name: string, description: string) => boolean
}

const SERIES: SeriesDef[] = [
  // 1. Branded comforter / quilt series.
  { title: "Moffy Comforter Sets", match: (n) => n.includes("moffy") },
  { title: "MoMo Quilt Sets", match: (n) => n.includes("momo") },
  { title: "Rara Quilt Sets", match: (n) => n.includes("rara") },

  // 2. Reversible ranges.
  {
    title: "Reversible Flowers Comforters",
    match: (n) => n.includes("flower reversible"),
  },
  {
    title: "Generic Reversible Comforters",
    match: (n) => n.includes("generic reversible"),
  },

  // 3. All corduroy products — comforters and corduroy fleece blankets alike.
  {
    title: "Corduroy",
    match: (n) => n.includes("corduroy"),
  },

  // 4. Everything else in the comforter / quilt / bedspread family.
  {
    title: "Other Quilts & Comforters",
    match: (n) =>
      n.includes("comforter") ||
      n.includes("quilt") ||
      n.includes("bedspread") ||
      n.includes("bed spread") ||
      n.includes("combo bedding"),
  },

  // 5. Flat / fitted sheet sets.
  {
    title: "Bedsheets",
    match: (n) =>
      n.includes("bed sheet") ||
      n.includes("bedsheet") ||
      n.includes("frilled combo sheet") ||
      n.includes("sheet set"),
  },

  // 6. Throws and fleece throw blankets (corduroy fleece is grouped under Corduroy).
  {
    title: "Throws & Fleece Blankets",
    match: (n) =>
      n.includes("throw") || (n.includes("fleece") && n.includes("blanket")),
  },

  // 7. Winter mink / 2-ply blankets ("etc.").
  {
    title: "Winter Blankets",
    match: (n) =>
      n.includes("winter blanket") ||
      n.includes("jia jia") ||
      n.includes("2ply") ||
      n.includes("2 ply") ||
      (n.includes("blanket") && n.includes("winter")),
  },

  // 8. Any remaining blankets not caught above.
  {
    title: "Other Blankets",
    match: (n) => n.includes("blanket"),
  },

  // 9. Catch-all so nothing is dropped. Always matches.
  {
    title: "Other Bedding",
    match: () => true,
  },
]

// Detects the real image format from the file's magic bytes. This is more
// reliable than trusting the file extension, because some assets are mislabeled.
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
// Product cards render at roughly 250px wide, so a 520px-wide JPEG keeps the
// print crisp while shrinking each embedded image to ~30-60KB. The logo is
// kept as a small PNG.
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
    // If sharp fails for any reason, fall back to the original bytes.
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

  // Catalogue 5: every active Home & Living bedding item, NO exclusions.
  const homeLiving = (products || []).filter(
    (p: any) => p.categories?.slug === "home-living",
  )

  // Assign each product to the first series it matches. The final catch-all
  // series guarantees nothing is dropped.
  const assigned = new Set<any>()
  const groups: CatalogueSeriesGroup[] = []

  for (const series of SERIES) {
    const matched = homeLiving.filter((p: any) => {
      if (assigned.has(p)) return false
      const name = (p.name || "").toLowerCase()
      const description = (p.short_description || "").toLowerCase()
      return series.match(name, description)
    })

    if (matched.length === 0) continue
    matched.forEach((p: any) => assigned.add(p))

    const seriesProducts: CatalogueProduct[] = await Promise.all(
      matched.map(async (p: any) => ({
        name: p.name,
        price: p.price,
        compareAtPrice: p.compare_at_price,
        description: p.short_description ?? null,
        imageDataUri: await imageToDataUri(p.image_url, origin),
      })),
    )

    groups.push({ title: series.title, products: seriesProducts })
  }

  const generatedDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const logoDataUri = await imageToDataUri("/agri-hub-logo.png", origin, "logo")

  const buffer = await renderToBuffer(
    createElement(BeddingCatalogueFive, {
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
      "Content-Disposition": 'attachment; filename="Agri-Hub-SA-Bedding-Catalogue-5.pdf"',
      "Cache-Control": "no-store",
    },
  })
}
