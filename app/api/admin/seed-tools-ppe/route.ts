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
  const getCategoryId = (name: string) => categories?.find(c => c.name === name)?.id

  const toolsCategory = getCategoryId("Tools & Hardware")
  const ppeCategory = getCategoryId("PPE & Safety")
  const homeCategory = getCategoryId("Home & Living")

  const products = [
    // Rockworth Cutting Discs - Tools & Hardware
    {
      name: "Rockworth Diamond Wheel 115mm Continuous Rim",
      description: "Diamond cutting wheel for ceramic tiles. 115mm x 22.23mm. Continuous rim for smooth cuts.",
      price: 85,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ROCKWORTH%20DIAMOND%20WHEEL%20115MM%20CONTINUOUS%20RIM-lIhelAdooauwnRr7nJuCGiPCL3hQ8C.jpg",
      stock_quantity: 30,
      supplier: "Rockworth"
    },
    {
      name: "Rockworth Diamond Wheel 230mm Continuous Rim",
      description: "Large diamond cutting wheel for ceramic tiles. 230mm x 22.23mm. Continuous rim for smooth cuts.",
      price: 165,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ROCKWORTH%20DIAMOND%20WHEEL%20230MM%20CONTINUOUS%20RIM-P4Z0xNtPykfY5zC9diDMQUBblL19kj.jpg",
      stock_quantity: 25,
      supplier: "Rockworth"
    },
    {
      name: "Rockworth Diamond Wheel 115mm Segmented Rim",
      description: "Diamond cutting wheel for masonry and cement. 115mm x 22.23mm. Segmented rim for fast cutting.",
      price: 75,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ROCKWORTH%20DIAMOND%20WHEEL%20115MM%20SEGMENTED%20RIM-vUzKtYm1KZE5hhXSJUfE3x3aUtFRvr.jpg",
      stock_quantity: 30,
      supplier: "Rockworth"
    },
    {
      name: "Rockworth Diamond Wheel 230mm Segmented Rim",
      description: "Large diamond cutting wheel for masonry and cement. 230mm x 22.23mm. Segmented rim for fast cutting.",
      price: 145,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ROCKWORTH%20DIAMOND%20WHEEL%20230MM%20SEGMENTED%20RIM-zvvV2LbKcZ223NeSDYR0TPh2EazZiP.jpg",
      stock_quantity: 25,
      supplier: "Rockworth"
    },
    {
      name: "Rockworth Cutting Disc Slimline Steel 115x1.0 5-Pack",
      description: "Abrasive cutting disc for metal and stainless steel. 115mm x 1.0mm x 22.23mm. Bulk pack of 5.",
      price: 65,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ROCKWORTH%20CUTTING%20DISC%20SLIMLINE%20STEEL%20115X1.0%205PAC-ERAkdFrYbxmfqVHLpLNb7I2iPsiRFp.jpg",
      stock_quantity: 40,
      supplier: "Rockworth"
    },
    {
      name: "Rockworth Cutting Disc Slimline Steel 230x2.0 5-Pack",
      description: "Large abrasive cutting disc for metal and stainless steel. 230mm x 2.0mm x 22.23mm. Bulk pack of 5.",
      price: 125,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ROCKWORTH%20CUTTING%20DISC%20SLIMLINE%20STEEL%20230X2.0%205PAC-uqIVseppwb05AgAQp8ZXIhXusUbATC.jpg",
      stock_quantity: 35,
      supplier: "Rockworth"
    },
    // PPE & Safety - Rainsuits
    {
      name: "Rainsuit Rubberised Nylon Medium Yellow",
      description: "Waterproof rubberised nylon rainsuit with hood. 2-piece jacket and pants. Size Medium.",
      price: 135,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAINSUIT%20RUBBERISED%20NYLON%20MED%20YEL-cVP5y1SqsJi01TuAHxuEEKSsDuOdk8.jpg",
      stock_quantity: 20
    },
    {
      name: "Rainsuit Rubberised Nylon XL Yellow",
      description: "Waterproof rubberised nylon rainsuit with hood. 2-piece jacket and pants. Size XL.",
      price: 145,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAINSUIT%20RUBBERISED%20NYLON%20XL%20YEL-NSSmYNQXKs8Ffqkycy9UyUxDImXYGf.jpg",
      stock_quantity: 20
    },
    {
      name: "Rainsuit Rubberised Nylon XXL Yellow",
      description: "Waterproof rubberised nylon rainsuit with hood. 2-piece jacket and pants. Size XXL.",
      price: 155,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAINSUIT%20RUBBERISED%20NYLON%20XXL%20YEL-7YnYUFeBoQwBM3rVvL7E77BwsiZkVy.jpg",
      stock_quantity: 15
    },
    {
      name: "Rainsuit Rubberised Nylon XXXL Yellow",
      description: "Waterproof rubberised nylon rainsuit with hood. 2-piece jacket and pants. Size XXXL.",
      price: 165,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAINSUIT%20RUBBERISED%20NYLON%20XXXL%20YEL-mUqkcqYs0sdDKNEDKrLqTi359tYSiL.jpg",
      stock_quantity: 15
    },
    // PPE - Safety Spectacles
    {
      name: "Safety Spectacle Sporty Silver",
      description: "Lightweight sporty safety spectacles with silver mirror lens and black temples. Anti-scratch coating.",
      price: 35,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20SPECTACLE%20SPORTY%20SILVER-Bn2yRFMeEKhPofWvxlf04PJkbbqrs3.jpg",
      stock_quantity: 50
    },
    {
      name: "Safety Spectacles Sporty Cool Clear Blue",
      description: "Lightweight sporty safety spectacles with clear lens and blue temples. Anti-scratch coating.",
      price: 35,
      category_id: ppeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20SPECTACLES%20SPORTY%20COOL%20CLEAR%20BLUE-tqSi9Bhxviwicqz2qIamcdNT1SgcKy.jpg",
      stock_quantity: 50
    },
    // Home & Living - Cleaning
    {
      name: "Revet Oven Clean 1L",
      description: "Grease removing oven cleaner. For use on ovens, braai equipment, and grillers. 1 litre bottle.",
      price: 55,
      category_id: homeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/REVET%20CLEANER%20OVEN%201L-bdeHIz4cBSuTBfRRYAc3TELT7TF3XE.jpg",
      stock_quantity: 30,
      supplier: "Revet"
    },
    {
      name: "Revet Mop & Shine 750ml",
      description: "Floor cleaner that shines while it cleans. Easy application. 750ml bottle.",
      price: 45,
      category_id: homeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/REVET%20MOP%20%26%20SHINE%20750ML-fKsbpq4MEPYn2bRAYeXpntl1WBIqY1.jpg",
      stock_quantity: 35,
      supplier: "Revet"
    },
    {
      name: "Refuse Bag Black 28mic 20-Pack",
      description: "Heavy duty black refuse bags. 750mm x 950mm. 28 micron thickness. Pack of 20 bags.",
      price: 35,
      category_id: homeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/REFUSE%20BAG%20BLK%2028MIC%2020%20P%20PK-eS02CojaTzq0hiKXdzRmfHbnZOzS7P.jpg",
      stock_quantity: 100
    },
    {
      name: "Refuse Bag Black 30mic 20-Pack",
      description: "Extra heavy duty black refuse bags. 30 micron thickness. Pack of 20 bags.",
      price: 45,
      category_id: homeCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/REFUSE%20BAG%20BLK%2030MIC%2020%20BAGS-Hn5MYJ2EcunqNy0ZCDdDDjAzZzO7Q7.jpg",
      stock_quantity: 100
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
    message: "Products seeded", 
    count: results.filter(r => r.success).length,
    results 
  })
}
