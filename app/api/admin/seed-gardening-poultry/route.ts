import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get category IDs
  const { data: categories } = await supabase.from("categories").select("id, slug")
  const categoryMap = new Map(categories?.map((c) => [c.slug, c.id]) || [])

  const gardeningId = categoryMap.get("gardening-tools")
  const animalFeedsId = categoryMap.get("animal-feeds")
  const electricalId = categoryMap.get("electrical")

  const products = [
    // Kaufmann Sprayers - Gardening Tools
    {
      name: "Kaufmann Knapsack Sprayer 16L",
      slug: "kaufmann-knapsack-sprayer-16l",
      description: "Professional 16 litre backpack knapsack sprayer with brass lance and adjustable nozzle. Ideal for pesticide and fertilizer application.",
      price: 495,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%20KNAPSACK%20SPRAYER%2016LT-DhJdu8japlJE6pVQZuzE2meStjw2ZZ.jpg",
      supplier: "Kaufmann",
    },
    {
      name: "Kaufmann Pressure Sprayer 4L",
      slug: "kaufmann-pressure-sprayer-4l",
      description: "Compact 4 litre pump pressure sprayer with fully adjustable nozzle and shoulder strap. Perfect for small garden applications.",
      price: 195,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Kaufmann%20pressure%20spray%204L-nWGUOFwCFbBTySZTq2viKmEOKUFHuq.jpg",
      supplier: "Kaufmann",
    },
    {
      name: "Kaufmann Adjustable Pressure Sprayer 8L",
      slug: "kaufmann-adjustable-pressure-sprayer-8l",
      description: "General purpose 8 litre pressure sprayer with fully adjustable nozzle and trigger lock. Suitable for cleaning and garden use.",
      price: 275,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%20ADJUSTABLE%20PRESSURE%20SPRAYER%208L-MdmBmIrt0b3l8zERClwowDZBc026H7.jpg",
      supplier: "Kaufmann",
    },
    // Gardena Hoses & Connectors
    {
      name: "Gardena Comfort HighFlex Hose 13mm x 20m",
      slug: "gardena-highflex-hose-13mm-20m",
      description: "Premium quality 13mm (1/2 inch) garden hose, 20 metres long. Features Power Grip technology, frost resistant, and 30 bar burst pressure. 25 year warranty.",
      price: 695,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GARD%20COMF%20HIGHFLEX%20HOSE%2013MMX20M%20WO%20FIT-GIznn3JXr2wOOtLbWuiPyQ8BnYbZEg.jpg",
      supplier: "Gardena",
    },
    {
      name: "Gardena Comfort HighFlex Hose 13mm x 30m",
      slug: "gardena-highflex-hose-13mm-30m",
      description: "Premium quality 13mm (1/2 inch) garden hose, 30 metres long. Features Power Grip technology, frost resistant, and 30 bar burst pressure. 25 year warranty.",
      price: 995,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GARD%20COMF%20HIGHFLEX%20HOSE%2013MM%20X30M%20WO%20FITT-qpd7cgTJMQutENzjayEb9tzn61D7pX.jpg",
      supplier: "Gardena",
    },
    {
      name: "Gardena Hose Connector 13mm",
      slug: "gardena-hose-connector-13mm",
      description: "Quick connect hose connector for 13mm (1/2 inch) hoses. Premium quality with secure grip design.",
      price: 85,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gardena%20connector-kAjHzAyMzTpGSAPQBjGe5GLnvjfLUW.jpg",
      supplier: "Gardena",
    },
    // Armadillo Hoses
    {
      name: "Armadillo Garden Hose with Fittings 20mm 20m",
      slug: "armadillo-garden-hose-fittings-20mm-20m",
      description: "Standard duty 20mm garden hose, 20 metres with fittings included. Complete with tap connector, hose connectors and spray nozzle.",
      price: 295,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARMADILLO%20HOSE%20GARDEN%2BFITTINGS%20STD%2020MM%2020M%201%20ROLL-PXJdGxhKqKeQ2BFNnC738SgLN8Tdby.jpg",
      supplier: "Armadillo",
    },
    {
      name: "Armadillo Garden Hose with Fittings 20mm 30m",
      slug: "armadillo-garden-hose-fittings-20mm-30m",
      description: "Standard duty 20mm garden hose, 30 metres with fittings included. Complete with tap connector, hose connectors and spray nozzle.",
      price: 395,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARMADILLO%20HOSE%20GARDEN%2BFITTINGS%20STD%2020MM%2030M%201%20ROLL-88s8kEBzXktpnNGJGVqlEFCbC7p1uP.jpg",
      supplier: "Armadillo",
    },
    // Poltek Poultry Equipment - Animal Feeds
    {
      name: "Poltek Feeder Chick Tray Round Black",
      slug: "poltek-feeder-chick-tray-round-black",
      description: "Round black plastic chick feeding tray with grid pattern to prevent waste. Durable and easy to clean.",
      price: 45,
      category_id: animalFeedsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20CHICK%20TRAY%20ROUND%20BLACK-VRJhgeDMzXNmimKpVTRsjLmUS2FovA.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Feeder Chick Tray Round Red",
      slug: "poltek-feeder-chick-tray-round-red",
      description: "Round red plastic chick feeding tray with grid pattern to prevent waste. High visibility colour attracts chicks.",
      price: 45,
      category_id: animalFeedsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20CHICK%20TRAY%20ROUND%20RED-L9vJb668iOyaRZXZf6wEP4F8HWKzsz.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Feeder Chick Tray Rectangle Red",
      slug: "poltek-feeder-chick-tray-rectangle-red",
      description: "Rectangular red plastic chick feeding tray with divided sections. Ideal for multiple feed types or supplements.",
      price: 55,
      category_id: animalFeedsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20CHICK%20TRAY%20RECTANGLE%20RED-WQRMCU5e4Cl96zivwUODuHwFGoZcWU.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Feeder Feedsaver Oval Hole",
      slug: "poltek-feeder-feedsaver-oval-hole",
      description: "Red and black feed saver trough feeder with oval feeding holes. Reduces feed waste and keeps feed clean.",
      price: 85,
      category_id: animalFeedsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20FEEDSAVER%20OVAL%20HOLE-k0TevdPQsIjZsdGdAwOhs3Tswa9djd.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Feeder Chick Bulk",
      slug: "poltek-feeder-chick-bulk",
      description: "Red conical bulk chick feeder with black base tray. Gravity-fed design ensures constant feed availability.",
      price: 75,
      category_id: animalFeedsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20CHICK%20BULK-J5qi0hSAxdNf0PpJFGCjd9EImEDQRE.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Poultry Drinker 3L",
      slug: "poltek-poultry-drinker-3l",
      description: "White dome drinker with red base and carry handle. Vacuum-operated for clean water supply. Suitable for chicks and small poultry.",
      price: 65,
      category_id: animalFeedsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6361006_56b1f588b30f4372e3223cb9ed90e0b2-NQNjjjtY8JimGOer5aoK5mzL6ZGLek.jpg",
      supplier: "Poltek",
    },
    // Eurolux Heat Lamp - Electrical
    {
      name: "Eurolux Infrared Heat Lamp 175W",
      slug: "eurolux-infrared-heat-lamp-175w",
      description: "Red infrared heat lamp bulb 175W for poultry brooding and animal heating. E27 screw fitting. Provides warmth for chicks and livestock.",
      price: 95,
      category_id: electricalId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Euro%20lux%20lamp%20175W-bE6aiJpYaIkGDuajOGQwBbGs8UZFPR.jpg",
      supplier: "Eurolux",
    },
    // Citrus Bags - Gardening
    {
      name: "Citrus Bag Bale 2000pcs",
      slug: "citrus-bag-bale-2000pcs",
      description: "Red mesh citrus bags, bale of 2000 pieces. Ideal for packaging and selling citrus fruits, onions, and vegetables.",
      price: 1250,
      category_id: gardeningId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BAG%20CITRUS%201%20BALE%202000PCS%20RANGE-krglhTKeOH5DfLNoxuZmldddtuR4sG.jpg",
      supplier: null,
    },
  ]

  const results = { added: 0, skipped: 0, errors: [] as string[] }

  for (const product of products) {
    const { error } = await supabase.from("products").upsert(product, { onConflict: "slug" })

    if (error) {
      results.errors.push(`${product.name}: ${error.message}`)
    } else {
      results.added++
    }
  }

  return NextResponse.json({
    message: `Added ${results.added} products`,
    results,
  })
}
