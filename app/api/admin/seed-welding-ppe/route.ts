import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

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

  // Get category IDs
  const { data: categories } = await supabase.from("categories").select("id, name")
  const getCategoryId = (name: string) => categories?.find((c) => c.name.toLowerCase().includes(name.toLowerCase()))?.id

  const ppeCategory = getCategoryId("PPE") || getCategoryId("Safety")
  const toolsCategory = getCategoryId("Tools") || getCategoryId("Hardware")
  const gardeningCategory = getCategoryId("Gardening")
  const cleaningCategory = getCategoryId("Cleaning") || getCategoryId("Home")

  const products = [
    // PPE - Skudo Overalls
    {
      name: "Skudo Overall 2PC Royal Blue Size 44 (112)",
      description: "Professional 2-piece royal blue overall. Size 44 (112cm chest). Durable workwear for industrial use.",
      price: 245,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20OVERALL%202PC%20ROYAL%20BLUE%2044%20%28112%29-tMlHYJbc5QunGyVBvZZsr3ZHufU7bK.jpg",
      stock_quantity: 20,
      supplier: "Skudo"
    },
    {
      name: "Skudo Overall 2PC Royal Blue Size 46 (117)",
      description: "Professional 2-piece royal blue overall. Size 46 (117cm chest). Durable workwear for industrial use.",
      price: 245,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20OVERALL%202PC%20ROYAL%20BLUE%2046%20%28117%29-svrXouXxAASwZzb5RBd6ZYUY1bklgw.jpg",
      stock_quantity: 20,
      supplier: "Skudo"
    },
    {
      name: "Skudo Overall 2PC Royal Blue Size 48 (122)",
      description: "Professional 2-piece royal blue overall. Size 48 (122cm chest). Durable workwear for industrial use.",
      price: 255,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20OVERALL%202PC%20ROYAL%20BLUE%2048%20%28122%29-y3f35E17ga5ZRHqZpEkfuejSjynttw.jpg",
      stock_quantity: 20,
      supplier: "Skudo"
    },
    {
      name: "Skudo Overall 2PC Royal Blue Size 50 (127)",
      description: "Professional 2-piece royal blue overall. Size 50 (127cm chest). Durable workwear for industrial use.",
      price: 265,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20OVERALL%202PC%20ROYAL%20BLUE%2050%20%28127%29-XZq6XqIpbadQ3RxuqkHntboDcCCtKQ.jpg",
      stock_quantity: 20,
      supplier: "Skudo"
    },
    // PPE - Eye Protection
    {
      name: "Strike-Arc Spectacle Welding Safety Green Shade 1.7",
      description: "Professional welding safety spectacles with green shade 1.7 lens. Provides eye protection during welding operations.",
      price: 45,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STRIKE-ARC%20SPECTACLE%20WELDING%20SAFETY%20GRN%20SHADE%201.7-R3YD9JGEkMX4OVSbWkZACSTTBGh8I0.jpg",
      stock_quantity: 30,
      supplier: "Strike-Arc"
    },
    {
      name: "Strike-Arc Welding Goggles Flip Front",
      description: "Professional flip-front welding goggles with adjustable strap. Dual lens system for versatile protection.",
      price: 65,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STRIKE-ARC%20WELDING%20GOGGLES%20FLIP%20FRONT-jDCHtuNCoGRe1HDbgnExCqA7G5fOPX.jpg",
      stock_quantity: 25,
      supplier: "Strike-Arc"
    },
    {
      name: "Spectacle Wrap Around Green",
      description: "Wrap-around safety spectacles with green tinted lenses. Side ventilation and full coverage protection.",
      price: 35,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SPECTACLE%20WRAP%20AROUND%20GRN-q0TOMoVTOS7Ck3CuuyS6Z32MsUGSqf.jpg",
      stock_quantity: 40,
      supplier: null
    },
    {
      name: "Safety Spectacles Sporty Cool Clear Lime",
      description: "Sporty style safety spectacles with clear lenses and lime green arms. Lightweight and comfortable fit.",
      price: 35,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20SPECTACLES%20SPORTY%20COOL%20CLEAR%20LIME-bwbIi2GzIl5kHwjd9v2bip3oqagS7L.jpg",
      stock_quantity: 40,
      supplier: null
    },
    // Tools - Welding Rods
    {
      name: "Strike-Arc Welding Rod Dissimilar ST 312 2.50mm 6-Pack",
      description: "Dissimilar metals welding electrodes ST 312. 2.50mm diameter, 6 pieces per pack. For joining different metal types.",
      price: 85,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STRIKE-ARC%20WELDING%20ROD%20DISSIMILAR%20ST%20312%202.50MM%206P-4148mYQ1LcxOa4DgJTO5BhgRzWm2aI.jpg",
      stock_quantity: 30,
      supplier: "Strike-Arc"
    },
    {
      name: "Strike-Arc Welding Rod Stainless ST 316L 2.50mm 8-Pack",
      description: "Stainless steel welding electrodes ST 316L. 2.50mm diameter, 8 pieces per pack. For stainless steel applications.",
      price: 95,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STRIKE-ARC%20WELDING%20ROD%20STAINLESS%20ST%20316L%202.50MM%208P-cvtULEFLJrpbpsGeDtFFuLKxUc5mcO.jpg",
      stock_quantity: 30,
      supplier: "Strike-Arc"
    },
    {
      name: "Strike-Arc Welding Rod Cast Iron 3.15mm 2-Pack",
      description: "Cast iron welding electrodes. 3.15mm diameter, 2 pieces per pack. For cast iron repair and joining.",
      price: 65,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STRIKE-ARC%20WELDING%20ROD%20CAST%20IRON%203.15MM%202PK-ZESvKpOjgbM84KgAhTki1hymQXnIZU.jpg",
      stock_quantity: 25,
      supplier: "Strike-Arc"
    },
    {
      name: "Strike-Arc Brazing Rod Alu Braze 4047 3.20mm 14-Pack",
      description: "Aluminium brazing rods 4047 alloy. 3.20mm diameter, 14 pieces per pack. For aluminium brazing applications.",
      price: 115,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/STRIKE-ARC%20BRAZING%20ROD%20ALU%20BRAZE%204047%203.20MM%2014PK-9S2Iz3ES2rCl7OSPulSL3XhF825XHt.jpg",
      stock_quantity: 20,
      supplier: "Strike-Arc"
    },
    // Tools - Cutting Discs
    {
      name: "Superflex Cutting Disc 2in1 Flat 115x1.6mm",
      description: "Reinforced cutting wheel for stainless steel, inox, metal and steel. 115mm diameter, 1.6mm thick. Made in RSA.",
      price: 25,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20CUTTING%20DISC%202IN1%20FLAT%20115X1.6MM%201A46T-xiZLLbgvRNj0RAI1Br6o7ipnEsMi35.jpg",
      stock_quantity: 50,
      supplier: "Superflex"
    },
    {
      name: "Superflex Cutting Disc 2in1 Flat 230x1.9mm",
      description: "Reinforced cutting wheel for stainless steel, inox, metal and steel. 230mm diameter, 1.9mm thick. Made in RSA.",
      price: 45,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20CUTTING%20DISC%202IN1%20FLAT%20230X1.9MM%201A36T-5r5O9QmfLzXWhXa7xqNxQWFFeTddMu.jpg",
      stock_quantity: 40,
      supplier: "Superflex"
    },
    // Gardening
    {
      name: "Sebor Watering Can 1L Teal",
      description: "Stylish 1 litre watering can in teal colour. Long spout for precise watering. Made in South Africa since 1976.",
      price: 45,
      category_id: gardeningCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SEBOR%20WATERING%20CAN%201L%20TEAL-rGYFv0HremV0TyX0XXVDwyinkvtK9t.jpg",
      stock_quantity: 25,
      supplier: "Sebor"
    },
    // Cleaning
    {
      name: "Spring Valley Hand Soap 1L Silk",
      description: "Hand dispensing soap in wild rose/silk fragrance. 1 litre bottle. Made in South Africa.",
      price: 35,
      category_id: cleaningCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SPRING%20VALLEY%20HAND%20SOAP%201L%20SILK-lMk0iz9veBO9KUXdpKPYRdnanJQBiM.jpg",
      stock_quantity: 30,
      supplier: "Spring Valley"
    }
  ]

  const results = []
  for (const product of products) {
    const productWithSlug = {
      ...product,
      slug: generateSlug(product.name)
    }
    const { data, error } = await supabase
      .from("products")
      .insert(productWithSlug)
      .select("id, name")
      .single()

    if (error) {
      results.push({ name: product.name, error: error.message })
    } else {
      results.push({ name: product.name, id: data.id, success: true })
    }
  }

  return NextResponse.json({
    message: "Welding & PPE products seeded",
    total: products.length,
    results
  })
}
