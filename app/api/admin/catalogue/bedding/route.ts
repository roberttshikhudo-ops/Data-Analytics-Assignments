import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import {
  BeddingCatalogue,
  type CatalogueProduct,
} from "@/lib/bedding-catalogue-pdf"

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
  phone: "079 109 9490",
  altPhone: "083 306 1529",
  email: "info@agrihubsa.co.za",
  website: "www.agrihubsa.co.za",
  address: "The Parks Lifestyle Apartments, Block 38 Unit 2F, Midrand, Gauteng 1685",
}

// Banking details — kept in sync with the invoice (lib/invoice.ts).
const BANKING_INFO = {
  bank: "First National Bank (FNB)",
  accountName: "Agri Hub SA",
  accountNumber: "63014180606",
  branchCode: "250655",
}

const DELIVERY_INFO = {
  standardFee: "R80",
  freeThreshold: "R1000",
}

const BEDDING_KEYWORDS = [
  "comforter",
  "bedspread",
  "bedding",
  "blanket",
  "throw",
  "quilt",
  "duvet",
  "pillow",
  "sheet",
  "linen",
  "fleece",
  "corduroy",
]

const EXCLUDE_KEYWORDS = ["bag", "travel", "curtain only", "towel"]

function mimeFromExt(filePath: string): string {
  const ext = filePath.toLowerCase().split(".").pop()
  if (ext === "png") return "image/png"
  if (ext === "webp") return "image/webp"
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

  // 1. External absolute URL — fetch directly.
  if (cleanPath.startsWith("http")) {
    try {
      const res = await fetch(cleanPath)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        return `data:${mimeFromExt(cleanPath)};base64,${buf.toString("base64")}`
      }
    } catch {
      return null
    }
    return null
  }

  // 2. Local /public asset — try filesystem first (fast in dev), then HTTP
  //    fetch from the deployment origin (works on Vercel serverless).
  try {
    const filePath = path.join(process.cwd(), "public", cleanPath)
    const buf = await readFile(filePath)
    return `data:${mimeFromExt(cleanPath)};base64,${buf.toString("base64")}`
  } catch {
    // fall through to HTTP fetch
  }

  try {
    const absolute = `${origin}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`
    const res = await fetch(absolute)
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer())
      return `data:${mimeFromExt(cleanPath)};base64,${buf.toString("base64")}`
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
    .order("price", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }

  const bedding = (products || []).filter((p: any) => {
    const name = (p.name || "").toLowerCase()
    const inHomeLiving = p.categories?.slug === "home-living"
    const nameMatch = BEDDING_KEYWORDS.some((k) => name.includes(k))
    const excluded = EXCLUDE_KEYWORDS.some((k) => name.includes(k))
    return inHomeLiving && nameMatch && !excluded
  })

  const catalogueProducts: CatalogueProduct[] = await Promise.all(
    bedding.map(async (p: any) => ({
      name: p.name,
      price: p.price,
      compareAtPrice: p.compare_at_price,
      description: p.short_description ?? null,
      imageDataUri: await imageToDataUri(p.image_url, origin),
    })),
  )

  const generatedDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const logoDataUri = await imageToDataUri("/agri-hub-logo.png", origin)

  const buffer = await renderToBuffer(
    createElement(BeddingCatalogue, {
      products: catalogueProducts,
      business: BUSINESS_INFO,
      banking: BANKING_INFO,
      delivery: DELIVERY_INFO,
      logoDataUri,
      generatedDate,
    }) as ReactElement<DocumentProps>,
  )

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Agri-Hub-SA-Bedding-Catalogue.pdf"',
      "Cache-Control": "no-store",
    },
  })
}
