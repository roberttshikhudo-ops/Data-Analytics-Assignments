import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import sharp from "sharp"
import {
  BeddingCatalogueFour,
  type CatalogueFamily,
  type CatalogueSeriesGroup,
} from "@/lib/bedding-catalogue-pdf-4"

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

// Products explicitly excluded from the bedding catalogue (matched by exact
// name, case-insensitive). Kept in sync with Catalogue 3.
const EXCLUDED_PRODUCTS = new Set(
  [
    "Quilted Weekender Travel Bag",
    "1Ply Fleece Blanket 001 - Navy Plaid",
    "5pcs Combo Bedding Set",
  ].map((n) => n.toLowerCase()),
)

// Banking details — kept in sync with the invoice (lib/invoice.ts).
const BANKING_INFO = {
  bank: "First National Bank (FNB)",
  accountName: "Agri Hub SA",
  accountNumber: "63014180606",
  branchCode: "250655",
}

// The exact series order, identical to Catalogue 3. Each product is assigned to
// the FIRST series it matches, so a product never appears twice.
interface SeriesDef {
  title: string
  match: (name: string, description: string) => boolean
}

const SERIES: SeriesDef[] = [
  { title: "Moffy Comforter Sets", match: (n) => n.includes("moffy") },
  { title: "MoMo Quilt Sets", match: (n) => n.includes("momo") },
  { title: "Rara Quilt Sets", match: (n) => n.includes("rara") },
  {
    title: "Reversible Flowers Comforters",
    match: (n) => n.includes("flower reversible"),
  },
  {
    title: "Generic Reversible Comforters",
    match: (n) => n.includes("generic reversible"),
  },
  {
    title: "Corduroy",
    match: (n) => n.includes("corduroy"),
  },
  {
    title: "Other Quilts & Comforters",
    match: (n) =>
      n.includes("comforter") ||
      n.includes("quilt") ||
      n.includes("bedspread") ||
      n.includes("bed spread") ||
      n.includes("combo bedding"),
  },
  {
    title: "Bedsheets",
    match: (n) =>
      n.includes("bed sheet") ||
      n.includes("bedsheet") ||
      n.includes("frilled combo sheet") ||
      n.includes("sheet set"),
  },
  {
    title: "Throws & Fleece Blankets",
    match: (n) =>
      n.includes("throw") || (n.includes("fleece") && n.includes("blanket")),
  },
  {
    title: "Winter Blankets",
    match: (n) =>
      n.includes("winter blanket") ||
      n.includes("jia jia") ||
      n.includes("2ply") ||
      n.includes("2 ply") ||
      (n.includes("blanket") && n.includes("winter")),
  },
]

// Splits a product name into a base "range" name and its colour/design variant
// label. This lets us present one representative card per range with the full
// list of available colours, the way advanced retail catalogues do.
//
// Handles the common naming patterns in the catalogue, e.g.:
//   "5pcs Generic Reversible Comforters-Aqua"      -> base + "Aqua"
//   "4pcs Premium Bed Sheet Set - Beige Blue Floral"-> base + "Beige Blue Floral"
//   "MOMO-001 Super King Quilt Set"                 -> base + "001"
//   "Moffy 001, 7pcs, Super King Size"              -> base + "001"
//   "5pcs Comforter Set 001 - Light Grey"           -> base + "001 - Light Grey"
//   "5pcs Flower Reversible Comforter P3"           -> base + "P3"
function extractFamily(rawName: string): { family: string; variant: string } {
  let working = rawName.trim()
  const variantParts: string[] = []

  // 1. Colour/design suffix written as " - X" (space-dash-space).
  const dashSpace = working.match(/^(.*\S)\s-\s(.+)$/)
  if (dashSpace) {
    working = dashSpace[1].trim()
    variantParts.unshift(dashSpace[2].trim())
  } else {
    // Colour suffix joined directly by a hyphen, e.g. "...Comforters-Aqua".
    // Only treat the right side as a colour when it starts with a letter, so
    // codes like "MOMO-001" are left for the numeric step below.
    const dash = working.match(/^(.*[A-Za-z])-([A-Za-z][A-Za-z &]+)$/)
    if (dash) {
      working = dash[1].trim()
      variantParts.unshift(dash[2].trim())
    }
  }

  // 2. Numeric / code token: "001".."0xx", or "P1".."P9", joined by a space or
  //    hyphen anywhere in the remaining name.
  const code = working.match(/[-\s](0\d{2}|P\d+)\b,?/)
  if (code) {
    variantParts.unshift(code[1])
    working = (working.slice(0, code.index) + working.slice((code.index ?? 0) + code[0].length)).trim()
  }

  // Tidy up the leftover base name: collapse doubled/trailing commas, repeated
  // spaces and dangling separators introduced by removing the variant.
  working = working
    .replace(/\s*,\s*,/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/[,\-\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()

  const variant = variantParts.join(" - ") || working
  return { family: working, variant }
}

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
// print crisp while shrinking each embedded image from megabytes to ~30-60KB.
// The logo is kept as PNG (with transparency) at a small size.
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

interface RawProduct {
  name: string
  price: number
  image_url: string | null
  short_description: string | null
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("name, price, image_url, short_description, categories(slug)")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }

  const homeLiving = (products || []).filter(
    (p: any) =>
      p.categories?.slug === "home-living" &&
      !EXCLUDED_PRODUCTS.has((p.name || "").toLowerCase()),
  )

  const groups: CatalogueSeriesGroup[] = []

  for (const series of SERIES) {
    const matched: RawProduct[] = homeLiving.filter((p: any) => {
      const name = (p.name || "").toLowerCase()
      const description = (p.short_description || "").toLowerCase()
      return series.match(name, description)
    })

    if (matched.length === 0) continue

    // Group matched products into ranges/families keyed by the base name.
    const familyMap = new Map<
      string,
      { name: string; members: { variant: string; product: RawProduct }[] }
    >()

    for (const product of matched) {
      const { family, variant } = extractFamily(product.name)
      const key = family.toLowerCase()
      if (!familyMap.has(key)) {
        familyMap.set(key, { name: family, members: [] })
      }
      familyMap.get(key)!.members.push({ variant, product })
    }

    const families: CatalogueFamily[] = await Promise.all(
      Array.from(familyMap.values()).map(async (fam) => {
        // Representative product = the first (alphabetical) in the range.
        const rep = fam.members[0].product
        const prices = fam.members.map((m) => Number(m.product.price))
        const minPrice = Math.min(...prices)
        const priceFrom = prices.some((pr) => pr !== minPrice)

        return {
          name: fam.name,
          price: minPrice,
          priceFrom,
          imageDataUri: await imageToDataUri(rep.image_url, origin),
          description: rep.short_description ?? null,
          variants: fam.members.map((m) => m.variant),
        }
      }),
    )

    groups.push({ title: series.title, families })
  }

  const generatedDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const logoDataUri = await imageToDataUri("/agri-hub-logo.png", origin, "logo")

  const buffer = await renderToBuffer(
    createElement(BeddingCatalogueFour, {
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
      "Content-Disposition": 'attachment; filename="Agri-Hub-SA-Bedding-Catalogue-4.pdf"',
      "Cache-Control": "no-store",
    },
  })
}
