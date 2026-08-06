import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import sharp from "sharp"
import {
  KitchenwareCatalogue,
  type CatalogueProduct,
  type CatalogueSeriesGroup,
} from "@/lib/kitchenware-catalogue-pdf"

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
// twice. Products that match NO series are left out entirely — this is how the
// kitchenware catalogue automatically excludes bedding, blankets, carpets,
// furniture and other non-kitchen Home & Living items.
//
// The requested order starts with Cookware Sets & Pots, followed by Bread
// Bins, then the remaining kitchen groups.
interface SeriesDef {
  title: string
  match: (name: string, description: string) => boolean
}

const SERIES: SeriesDef[] = [
  // 1. Cookware sets & pots (matched first so the Dolphin "Pot ... & Utensil
  //    Set" names land here, not in the utensil group below).
  {
    title: "Cookware Sets & Pots",
    match: (n) => n.includes("cookware") || n.includes("pot"),
  },

  // 2. Bread bins & canister sets.
  {
    title: "Bread Bins & Canister Sets",
    match: (n) => n.includes("bread bin") || n.includes("breadbin") || n.includes("canister"),
  },

  // 3. Bakeware.
  { title: "Bakeware", match: (n) => n.includes("bakeware") },

  // 4. Knives & cutlery.
  {
    title: "Knives & Cutlery",
    match: (n) => n.includes("knife") || n.includes("cutlery"),
  },

  // 5. Utensil sets — silicone kitchen sets and spoon sets.
  {
    title: "Kitchen Utensil Sets",
    match: (n) => n.includes("silicon") || n.includes("spoon") || n.includes("utensil"),
  },

  // 6. Food warmers & chafing dishes (caught before Serving & Tableware so the
  //    chafing/chaffing dishes group here rather than under "dish").
  {
    title: "Food Warmers & Chafing Dishes",
    match: (n) => n.includes("food warmer") || n.includes("chafing") || n.includes("chaffing"),
  },

  // 7. Food storage & organisers — spice racks, dispensers, containers, racks.
  {
    title: "Food Storage & Organisers",
    match: (n) =>
      n.includes("spice jar") ||
      n.includes("cereal dispenser") ||
      n.includes("rice container") ||
      n.includes("eggs holder") ||
      n.includes("egg holder") ||
      n.includes("kitchen storage") ||
      n.includes("vegetable rack") ||
      n.includes("fruit basket"),
  },

  // 8. Kitchen appliances — electric & gas.
  {
    title: "Kitchen Appliances",
    match: (n) =>
      n.includes("air fryer") ||
      n.includes("kettle") ||
      n.includes("pressure cooker") ||
      n.includes("gas stove") ||
      n.includes("gas cylinder"),
  },

  // 9. Gadgets & accessories (matched before Serving so "Dish Rack" groups
  //    here instead of under "dish").
  {
    title: "Kitchen Gadgets & Accessories",
    match: (n) => n.includes("dish rack") || n.includes("cutter") || n.includes("easy spin"),
  },

  // 10. Serving & tableware — bowls, dishes, trays, ice buckets.
  {
    title: "Serving & Tableware",
    match: (n) =>
      n.includes("bowl") ||
      n.includes("dish") ||
      n.includes("tray") ||
      n.includes("ice bucket"),
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

  // Only classify active Home & Living products. Non-kitchen items (bedding,
  // blankets, carpets, furniture, etc.) match no series below and are omitted.
  const homeLiving = (products || []).filter((p: any) => p.categories?.slug === "home-living")

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

    // Within each sub-category, list product families first (items that share
    // the same name across 2+ colour/variant rows), keeping each family's rows
    // adjacent, then the individual standalone products. Sort is stable:
    //   1. families (name count > 1) before individuals
    //   2. name A→Z (keeps same-name rows together and orders the families)
    //   3. price low→high within an identical name
    const nameCounts = new Map<string, number>()
    for (const p of matched) {
      const key = (p.name || "").trim().toLowerCase()
      nameCounts.set(key, (nameCounts.get(key) || 0) + 1)
    }
    matched.sort((a: any, b: any) => {
      const aKey = (a.name || "").trim().toLowerCase()
      const bKey = (b.name || "").trim().toLowerCase()
      const aFamily = (nameCounts.get(aKey) || 0) > 1
      const bFamily = (nameCounts.get(bKey) || 0) > 1
      if (aFamily !== bFamily) return aFamily ? -1 : 1
      if (aKey !== bKey) return aKey < bKey ? -1 : 1
      return Number(a.price) - Number(b.price)
    })

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
    createElement(KitchenwareCatalogue, {
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
      "Content-Disposition": `attachment; filename="Agri-Hub-SA-Kitchenware-Catalogue.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
