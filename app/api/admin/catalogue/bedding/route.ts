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
]

const EXCLUDE_KEYWORDS = ["bag", "travel", "curtain only", "towel"]

function mimeFromExt(filePath: string): string {
  const ext = filePath.toLowerCase().split(".").pop()
  if (ext === "png") return "image/png"
  if (ext === "webp") return "image/webp"
  return "image/jpeg"
}

// Reads a /public image and returns a base64 data URI, or null if unavailable
async function imageToDataUri(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl) return null
  try {
    if (imageUrl.startsWith("http")) {
      const res = await fetch(imageUrl)
      if (!res.ok) return null
      const buf = Buffer.from(await res.arrayBuffer())
      return `data:${mimeFromExt(imageUrl)};base64,${buf.toString("base64")}`
    }
    const cleanPath = imageUrl.split("?")[0]
    const filePath = path.join(process.cwd(), "public", cleanPath)
    const buf = await readFile(filePath)
    return `data:${mimeFromExt(cleanPath)};base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}

export async function GET() {
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
      imageDataUri: await imageToDataUri(p.image_url),
    })),
  )

  const generatedDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const buffer = await renderToBuffer(
    createElement(BeddingCatalogue, {
      products: catalogueProducts,
      business: BUSINESS_INFO,
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
