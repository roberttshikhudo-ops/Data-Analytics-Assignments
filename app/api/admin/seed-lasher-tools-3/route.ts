import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get or create Tools & Hardware category
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Tools & Hardware")
    .single()

  const categoryId = category?.id

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const productsData = [
    // Grass Cutting Tools
    {
      name: "Lasher Slasher Grass Curved 2300",
      description: "Heavy-duty curved grass slasher for clearing thick grass and brush. Ergonomic design for efficient cutting.",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20SLASHER%20GRASS%20CURVED%202300-UdsbOnXxJXIiOYdu5DBzeFh4E8JW3E.jpg",
      category_id: categoryId,
      stock_quantity: 30,
      supplier: "Lasher",
    },
    // Tool Handles
    {
      name: "Lasher Universal Poly Pick Handle",
      description: "Universal polypropylene replacement handle for picks and mattocks. Durable and weather-resistant.",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UNIVERSAL%20POLY%20PICK%20HANDLE-nfXYOcWQNZsImFGW8GOtNKmiMJFots.jpg",
      category_id: categoryId,
      stock_quantity: 40,
      supplier: "Lasher",
    },
    // Shovels
    {
      name: "Lasher Square Mouth Shovel 350 Black",
      description: "Professional square mouth shovel with steel D-handle. Ideal for moving sand, gravel and loose materials.",
      price: 295,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20SQUARE%20MOUTH%20SHOVEL%20350%20BLK-AtCoGlNqxMMHylG7H7qqvQMJ9ptjml.jpg",
      category_id: categoryId,
      stock_quantity: 25,
      supplier: "Lasher",
    },
    {
      name: "Lasher Round Nose Shovel MB2",
      description: "Professional round nose shovel with steel D-handle. Perfect for digging in hard or rocky soil.",
      price: 285,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shovel-round-nose-s-s-mb2-fg00415-lasher.JPG-yweHzOO0iiJumXtN4lrpygZcPxbKjg.jpeg",
      category_id: categoryId,
      stock_quantity: 25,
      supplier: "Lasher",
    },
  ]

  // Add slug to each product
  const products = productsData.map(p => ({
    ...p,
    slug: generateSlug(p.name)
  }))

  const { data, error } = await supabase
    .from("products")
    .insert(products)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    message: `Added ${data.length} Lasher tools (batch 3)`,
    products: data 
  })
}
