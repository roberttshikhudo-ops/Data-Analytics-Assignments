import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const PRICE = 530

const DESCRIPTION =
  "Luxurious 9-piece diamond-quilted comforter set. Each set includes 1 comforter, " +
  "2 continental pillowcases, 2 standard pillowcases, 2 cushion cases and 2 neck pillows. " +
  "Soft, durable microfibre with an elegant diamond-stitch finish that adds warmth and " +
  "style to any bedroom."

const SHORT_DESCRIPTION =
  "9pcs set: 1 comforter, 2 continental & 2 standard pillowcases, 2 cushion cases, 2 neck pillows."

// colour -> local image path (saved under /public/products/comforter-9pcs)
const COLOURS = [
  { colour: "Navy Blue", img: "img-02.png" },
  { colour: "Coral", img: "img-03.png" },
  { colour: "Purple", img: "img-04.png" },
  { colour: "White", img: "img-05.png" },
  { colour: "Lilac", img: "img-06.png" },
  { colour: "Grey", img: "img-07.png" },
  { colour: "Maroon", img: "img-08.png" },
  { colour: "Light Blue", img: "img-09.png" },
  { colour: "Mustard", img: "img-10.png" },
  { colour: "Camel", img: "img-11.png" },
  { colour: "Chocolate Brown", img: "img-12.png" },
  { colour: "Green", img: "img-13.png" },
  { colour: "Black", img: "img-14.png" },
]

async function main() {
  // Resolve the Home & Living category id.
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name, slug")

  if (catError) {
    console.error("[v0] Failed to load categories:", catError.message)
    process.exit(1)
  }

  const homeLiving = categories.find(
    (c) =>
      c.slug === "home-living" ||
      c.name?.toLowerCase().includes("home") ||
      c.name?.toLowerCase().includes("living"),
  )

  if (!homeLiving) {
    console.error(
      "[v0] Could not find a Home & Living category. Available:",
      categories.map((c) => `${c.name} (${c.slug})`).join(", "),
    )
    process.exit(1)
  }

  console.log(`[v0] Using category: ${homeLiving.name} (${homeLiving.slug})`)

  const results = []

  for (let i = 0; i < COLOURS.length; i++) {
    const { colour, img } = COLOURS[i]
    const name = `9pcs Comforter Set-${colour}`
    const slug = generateSlug(name)
    const image_url = `/products/comforter-9pcs/${img}`
    const sku = `HL-9PCS-COMF-${String(i + 1).padStart(2, "0")}`

    // Skip if a product with this slug already exists.
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      results.push({ name, status: "skipped (already exists)" })
      continue
    }

    const { error } = await supabase.from("products").insert({
      name,
      slug,
      description: DESCRIPTION,
      short_description: SHORT_DESCRIPTION,
      price: PRICE,
      sku,
      stock_quantity: 100,
      low_stock_threshold: 5,
      is_active: true,
      is_new: true,
      image_url,
      category_id: homeLiving.id,
      brand: "Agri Hub SA",
    })

    if (error) {
      results.push({ name, status: `error: ${error.message}` })
    } else {
      results.push({ name, status: "inserted" })
    }
  }

  console.log("[v0] Seed results:")
  for (const r of results) {
    console.log(`  - ${r.name}: ${r.status}`)
  }

  const inserted = results.filter((r) => r.status === "inserted").length
  console.log(`[v0] Done. ${inserted} product(s) inserted.`)
}

main()
