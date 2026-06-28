import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import {
  BeddingCatalogueThree,
  type CatalogueProduct,
  type CatalogueSeriesGroup,
} from "@/lib/bedding-catalogue-pdf-3"

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

// Products explicitly excluded from Catalogue 3 (matched by exact name,
// case-insensitive).
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

// The exact series order requested for Catalogue 3, listed start to finish.
// Each product is assigned to the FIRST series it matches, so ordering matters
// and a product never appears twice.
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
]

// Detects the real image format from the file's magic bytes. This is more
// reliable than trusting the file extension, because some assets are mislabeled
// (e.g. agri-hub-logo.png is actually JPEG data). @react-pdf/renderer silently
// drops images whose declared MIME type doesn't match the actual bytes, so the
// correct type is essential for the logo to render.
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

// Converts a product image into a base64 data URI so it can be embedded in the
// PDF. Works both locally (filesystem) and on Vercel (HTTP fetch), since
// /public assets are not readable via fs in serverless functions.
async function imageToDataUri(
  imageUrl: string | null,
  origin: string,
): Promise<string | null> {
  if (!imageUrl) return null

  const cleanPath = imageUrl.split("?")[0]

  if (cleanPath.startsWith("http")) {
    try {
      const res = await fetch(cleanPath)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        return `data:${mimeFromBuffer(buf)};base64,${buf.toString("base64")}`
      }
    } catch {
      return null
    }
    return null
  }

  try {
    const filePath = path.join(process.cwd(), "public", cleanPath)
    const buf = await readFile(filePath)
    return `data:${mimeFromBuffer(buf)};base64,${buf.toString("base64")}`
  } catch {
    // fall through to HTTP fetch
  }

  try {
    const absolute = `${origin}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`
    const res = await fetch(absolute)
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer())
      return `data:${mimeFromBuffer(buf)};base64,${buf.toString("base64")}`
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

  const homeLiving = (products || []).filter(
    (p: any) =>
      p.categories?.slug === "home-living" &&
      !EXCLUDED_PRODUCTS.has((p.name || "").toLowerCase()),
  )

  // Build the groups in the exact requested order. Each product is assigned to
  // the first series it matches, so it never appears twice.
  const groups: CatalogueSeriesGroup[] = []

  for (const series of SERIES) {
    const matched = homeLiving.filter((p: any) => {
      const name = (p.name || "").toLowerCase()
      const description = (p.short_description || "").toLowerCase()
      return series.match(name, description)
    })

    if (matched.length === 0) continue

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

  const logoDataUri = await imageToDataUri("/agri-hub-logo.png", origin)

  const buffer = await renderToBuffer(
    createElement(BeddingCatalogueThree, {
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
      "Content-Disposition": 'attachment; filename="Agri-Hub-SA-Bedding-Catalogue-3.pdf"',
      "Cache-Control": "no-store",
    },
  })
}
