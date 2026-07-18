import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import sharp from "sharp"
import {
  BeddingCatalogueSix,
  type CatalogueProduct,
  type CatalogueSeriesGroup,
} from "@/lib/bedding-catalogue-pdf-6"

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
// twice. Products that match no series (and the excluded items) are left out,
// so only genuine bedding is classified and shown.
//
// Edition 6 additions over Edition 5:
//   - Molly Comforter Sets get their own branded series.
//   - Mattress Protectors & Covers (corduroy, waterproof and velvet) are
//     classified as a dedicated series instead of being excluded.
interface SeriesDef {
  title: string
  match: (name: string, description: string) => boolean
}

const SERIES: SeriesDef[] = [
  // 1. Branded comforter / quilt series (matched first so they never fall into
  //    the generic comforter/quilt groups below).
  { title: "Moffy Comforter Sets", match: (n) => n.includes("moffy") },
  { title: "Molly Comforter Sets", match: (n) => n.includes("molly") },
  { title: "MoMo Quilt Sets", match: (n) => n.includes("momo") },
  { title: "Rara Quilt Sets", match: (n) => n.includes("rara") },

  // 2. Mattress protectors & covers — corduroy, waterproof and velvet sets.
  //    Placed before the sheet/comforter groups so the "winter bedsheet"
  //    velvet protector and corduroy protector are grouped here as covers.
  {
    title: "Mattress Protectors & Covers",
    match: (n) => n.includes("mattress protector") || n.includes("protector"),
  },

  // 3. Reversible ranges.
  {
    title: "Reversible Flowers Comforters",
    match: (n) => n.includes("flower reversible"),
  },
  {
    title: "Generic Reversible Comforters",
    match: (n) => n.includes("generic reversible"),
  },

  // 4. Geometric comforter range.
  {
    title: "Geometric Comforters",
    match: (n) => n.includes("geometric comforter"),
  },

  // 5. All corduroy products — comforters and corduroy fleece blankets alike.
  {
    title: "Corduroy Range",
    match: (n) => n.includes("corduroy") || n.includes("cordury"),
  },

  // 6. Everything else in the comforter family (5pcs / 9pcs / kids, etc.).
  {
    title: "Comforter Sets",
    match: (n) => n.includes("comforter"),
  },

  // 7. Quilt sets and bedspreads.
  {
    title: "Quilts & Bedspreads",
    match: (n) =>
      n.includes("quilt") ||
      n.includes("bedspread") ||
      n.includes("bed spread") ||
      n.includes("combo bedding"),
  },

  // 8. Flat / fitted sheet sets.
  {
    title: "Bedsheets",
    match: (n) =>
      n.includes("bed sheet") ||
      n.includes("bedsheet") ||
      n.includes("frilled combo sheet") ||
      n.includes("sheet set"),
  },

  // 9. Throws and fleece throw blankets.
  {
    title: "Throws & Fleece Blankets",
    match: (n) =>
      n.includes("throw") || (n.includes("fleece") && n.includes("blanket")),
  },

  // 10. Winter mink / 2-ply / patterned winter blankets.
  {
    title: "Winter Blankets",
    match: (n) =>
      n.includes("winter blanket") ||
      n.includes("jia jia") ||
      n.includes("little sheep") ||
      n.includes("quality winter blanket") ||
      n.includes("2ply") ||
      n.includes("2 ply") ||
      (n.includes("blanket") && n.includes("winter")),
  },

  // 11. Any remaining blankets not caught above.
  {
    title: "Other Blankets",
    match: (n) => n.includes("blanket"),
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
      .resize({ width: 480, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
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
  const url = new URL(request.url)
  const origin = url.origin

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("name, price, compare_at_price, image_url, short_description, categories(slug)")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }

  // Catalogue 6: active Home & Living bedding. Non-bedding items (e.g. the
  // Quilted Weekender Travel Bag) are explicitly excluded.
  const EXCLUDED = ["quilted weekender travel bag"]
  const homeLiving = (products || []).filter((p: any) => {
    if (p.categories?.slug !== "home-living") return false
    const name = (p.name || "").toLowerCase()
    return !EXCLUDED.some((ex) => name.includes(ex))
  })

  const groups: CatalogueSeriesGroup[] = []

  // Full catalogue: assign each product to the first series it matches.
  const assigned = new Set<any>()

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
    createElement(BeddingCatalogueSix, {
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
      "Content-Disposition": `attachment; filename="Agri-Hub-SA-Bedding-Catalogue-6.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
