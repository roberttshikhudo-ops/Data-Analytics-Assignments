import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get Animal Feeds category ID
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")

  const animalFeedsCategory = categories?.find((c) => c.slug === "animal-feeds")

  if (!animalFeedsCategory) {
    return NextResponse.json({ error: "Animal Feeds category not found" }, { status: 404 })
  }

  const products = [
    // Water Fountains/Drinkers
    {
      name: "Poltek Poultry Water Fountain 12L",
      slug: "poltek-poultry-water-fountain-12l",
      description: "Large 12 litre poultry water fountain with white dome reservoir and red base. Features carry handle for easy transport and refilling. Ideal for medium to large flocks.",
      price: 145,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Poltek%20poultry%20Water%20fountain%2012L-3bFJ4N396SLwG55l4BAj4SNSAlTIkN.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Poultry Water Fountain 8L",
      slug: "poltek-poultry-water-fountain-8l",
      description: "8 litre poultry water fountain with white dome reservoir and red base. Features carry handle and hanging rope for versatile placement. Perfect for small to medium flocks.",
      price: 115,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20POULTRY%20WATER%20FOUNTAIN%208L-hsPZ9xmJ1Y1UI7W42hZuozPauot343.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Water Fount Complete 3L",
      slug: "poltek-water-fount-complete-3l",
      description: "Compact 3 litre water fountain for chicks and small poultry. White reservoir with red base. Easy to clean and refill.",
      price: 65,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20WATER%20FOUNT%20COMPLETE%203L%20-%20Copy-xGKMoQn2mFZXYITfHZA5oq5IuWV82w.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Water Fount Complete 750ml",
      slug: "poltek-water-fount-complete-750ml",
      description: "Small 750ml water fountain ideal for day-old chicks and small birds. Compact white reservoir with red base. Perfect starter drinker.",
      price: 35,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20WATER%20FOUNT%20COMPLETE%20750ML%20-%20Copy-8vIignOW9rqetBK7WXMDPMGX58G8GG.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Water Fountain S-Hook",
      slug: "poltek-water-fountain-s-hook",
      description: "Stainless steel S-hook for hanging poultry water fountains and feeders. Heavy duty construction for reliable support.",
      price: 15,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20WATER%20FOUNTAIN%20S-HOOK%20-%20Copy-PlbsMhKOUdF1t9nlckYiIu8CYWqyeO.jpg",
      supplier: "Poltek",
    },
    // Feeders
    {
      name: "Poltek Feeder Tube Complete",
      slug: "poltek-feeder-tube-complete",
      description: "Complete tube feeder with red cylinder hopper and black base. Features carry handle and anti-waste design. Suitable for growing and adult poultry.",
      price: 125,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20TUBE%20COMPLETE-WPCRbYWJhPJVcoJbVfMzS08IH8KT2b.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Feeder Tube Ribbed Complete",
      slug: "poltek-feeder-tube-ribbed-complete",
      description: "Complete ribbed tube feeder with red cylinder hopper and black base. Ribbed design prevents feed bridging. Features sturdy carry handle.",
      price: 135,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20TUBE%20RIBBED%20COMPLETE-OXCLpuVmo1dDzpVLpRT2gk7EhRiUhY.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Feeder Tube Base Only Ribbed",
      slug: "poltek-feeder-tube-base-only-ribbed",
      description: "Replacement ribbed base for Poltek tube feeders. Black plastic construction with center cone for even feed distribution.",
      price: 55,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20TUBE%20BASE%20ONLY%20RIBBED-UdsNqyv3beNfGN9VFP4gf1v5sRvcuE.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Feeder Tube Anti Waste Ring",
      slug: "poltek-feeder-tube-anti-waste-ring",
      description: "Red anti-waste ring for tube feeders. Reduces feed spillage and waste. Easy to install on existing feeders.",
      price: 25,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20FEEDER%20TUBE%20ANTI%20WASTE%20RING%20ONLY-KpBniNIFlCgGsyKLkSLUb7cdin3C9z.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Poultry Hinged Feedsaver",
      slug: "poltek-poultry-hinged-feedsaver",
      description: "Red rectangular trough feeder with hinged anti-waste grill. Prevents birds from scratching and wasting feed. Easy to clean.",
      price: 75,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POLTEK%20POULTRY%20HINGED%20FEEDSAVER-CPiLUVJkkWGT8ukXCLJs7NbRf9jnNa.jpg",
      supplier: "Poltek",
    },
    {
      name: "Poltek Round Tray Black",
      slug: "poltek-round-tray-black",
      description: "Black round gridded tray for chick feeders. Non-slip surface prevents feed waste. Durable plastic construction.",
      price: 35,
      category_id: animalFeedsCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Poltek%20round%20tray%20black-IQbD0ZiXkNQGBsaD1zhfWAIrPWI2BO.jpg",
      supplier: "Poltek",
    },
  ]

  const results = []
  for (const product of products) {
    const { data, error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "slug" })
      .select()

    if (error) {
      results.push({ name: product.name, error: error.message })
    } else {
      results.push({ name: product.name, success: true })
    }
  }

  return NextResponse.json({
    message: "Poltek poultry equipment seeded",
    count: products.length,
    results,
  })
}
