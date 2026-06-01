import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get Chemicals & Fertilizers category
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "chemicals-fertilizers")
    .single()

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  const products = [
    // Herbicides
    {
      name: "Protek Triclon 50ml",
      slug: "protek-triclon-50ml",
      description: "Protek Triclon is a selective herbicide for the control of unwanted trees and shrubs. Ideal for clearing invasive alien vegetation and unwanted woody plants. Apply directly to cut stumps or as a foliar spray for effective results.",
      short_description: "Herbicide for unwanted trees & shrubs",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/triclon-50ml-wv8sLzXN8IQWAhFeYU3F9N6FnaVYYf.png",
      category_id: category.id,
      sku: "CHEM-TRICLON-50",
      stock_quantity: 40,
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Two-Step Advanced Weed Killer 500ml",
      slug: "protek-two-step-weed-killer-500ml",
      description: "Protek Two-Step is an advanced systemic weed killer that provides total vegetation control. Kills weeds down to the roots with long-lasting residual action. Ideal for pathways, driveways, fence lines, and areas where complete vegetation control is required.",
      short_description: "Advanced systemic weed killer 500ml",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Two-step-500ml-HJ2I8Mfs3fT9CczbQpSwvAiSSVrqSx.png",
      category_id: category.id,
      sku: "CHEM-TWOSTEP-500",
      stock_quantity: 30,
      is_active: true,
      is_featured: false
    },
    // Insecticides - Spray Kill range
    {
      name: "Protek Spray Kill 1 50ml",
      slug: "protek-spray-kill-1-50ml",
      description: "Protek Spray Kill 1 is an effective insecticide for control of ants, harvester termites, crickets, brown locusts, and cockroaches. Easy to mix and apply as a spray treatment. Provides quick knockdown and residual control of crawling insects.",
      short_description: "For ants, termites, crickets, locusts, cockroaches",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Spray%20Kill%201%2050ml-euvUs9W0igdi3NL0GSt4XPnprFu5XA.jpg",
      category_id: category.id,
      sku: "CHEM-SPRAYKILL1-50",
      stock_quantity: 50,
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Spray Kill 3 50ml",
      slug: "protek-spray-kill-3-50ml",
      description: "Protek Spray Kill 3 is a contact insecticide for control of aphids, beetles, moths, scale insects, thrips, and white fly. Ideal for protecting vegetables, flowers, and ornamental plants from sucking and chewing insects.",
      short_description: "For aphids, beetles, moths, scale, thrips, white fly",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/spray-kill-3-50ml-um6Zww00VJr9lLyE41PoRykXJDynTC.png",
      category_id: category.id,
      sku: "CHEM-SPRAYKILL3-50",
      stock_quantity: 50,
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Spray Kill 5 50ml",
      slug: "protek-spray-kill-5-50ml",
      description: "Protek Spray Kill 5 is specifically formulated for the control of fruit fly. Protects fruit trees and vegetable crops from fruit fly damage. Apply as a bait spray for effective attraction and control of fruit flies.",
      short_description: "Insecticide for fruit fly control",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/spray-kill-5-50ml-xVVSR1dcp7oMqbzk6kid6HIS0Eef2m.png",
      category_id: category.id,
      sku: "CHEM-SPRAYKILL5-50",
      stock_quantity: 45,
      is_active: true,
      is_featured: false
    },
    // Terminex - Termite control
    {
      name: "Protek Terminex 350 SC 50ml",
      slug: "protek-terminex-350sc-50ml",
      description: "Protek Terminex 350 SC is a professional-grade termiticide for pre and post-construction termite control. Creates a protective barrier against subterranean termites. Long-lasting residual protection for buildings and wooden structures.",
      short_description: "Termite control concentrate 50ml",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Terminex%20350%20SC%2050ml-gzg5bMMxuQN0o1S9MJmpiLOlzqRSFM.jpg",
      category_id: category.id,
      sku: "CHEM-TERMINEX-50",
      stock_quantity: 35,
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Terminex 350 SC 500ml",
      slug: "protek-terminex-350sc-500ml",
      description: "Protek Terminex 350 SC 500ml is a professional-grade termiticide for larger applications. Provides pre and post-construction termite control with long-lasting residual protection. Covers up to 130m² for effective barrier treatment against subterranean termites.",
      short_description: "Termite control concentrate 500ml",
      price: 385,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Terminex%20350%20SC%20500ml-dsbi2D4UbcarhzloxjzZgOgZ8ULmra.jpg",
      category_id: category.id,
      sku: "CHEM-TERMINEX-500",
      stock_quantity: 20,
      is_active: true,
      is_featured: true
    },
    // Rodenticide
    {
      name: "Protek Rodex Rat & Mouse Grain Bait 100g",
      slug: "protek-rodex-grain-bait-100g",
      description: "Protek Rodex Grain Bait is a highly palatable rodenticide for effective control of rats and mice. The grain-based formulation is attractive to rodents and provides quick results. Ideal for use in homes, farms, warehouses, and commercial premises.",
      short_description: "Rat & mouse grain bait 100g",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rodex%20Grain%20100g-wC706rhLww6Q2TtkV0vHe9ArLNrGpe.png",
      category_id: category.id,
      sku: "CHEM-RODEX-100",
      stock_quantity: 60,
      is_active: true,
      is_featured: false
    }
  ]

  const results = []

  for (const product of products) {
    const { data, error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "slug" })
      .select()
      .single()

    if (error) {
      results.push({ name: product.name, error: error.message })
    } else {
      results.push({ name: product.name, success: true })
    }
  }

  return NextResponse.json({
    message: "Chemicals batch 2 seeded",
    count: products.length,
    results
  })
}
