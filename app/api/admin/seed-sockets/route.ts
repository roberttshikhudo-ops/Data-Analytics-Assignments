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
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")

  const electricalCategory = categories?.find(c => c.slug === "electrical")

  if (!electricalCategory) {
    return NextResponse.json({ error: "Electrical category not found" }, { status: 400 })
  }

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const productsData = [
    // Nexus Wall Sockets
    {
      name: "Nexus Socket Switch Single 4x4",
      description: "Single wall socket with switch in 4x4 format. Standard SA 3-pin outlet with indicator light on switch. Suitable for domestic and light commercial use.",
      price: 65,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20SOCKET%20SWITCH%20SNGL%204X4-rWmAvsBQneQU4ZD78RFlz2QUHlOB39.jpg",
      stock_quantity: 100,
      
      supplier: "Nexus",
      is_featured: false,
      is_active: true,
    },
    {
      name: "Nexus Socket Switch Double 4x4",
      description: "Double wall socket with individual switches in 4x4 format. Two standard SA 3-pin outlets with indicator lights. Suitable for domestic and light commercial use.",
      price: 95,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20SOCKET%20SWITCH%20DBL%204X4-UkKGbLKh2ESOVYvPHnI7xuhE2VHyTe.jpg",
      stock_quantity: 100,
      
      supplier: "Nexus",
      is_featured: false,
      is_active: true,
    },
    // Zap Industrial Light Switches (Ausma)
    {
      name: "Zap Switch Light Industrial 1 Lever",
      description: "Industrial-grade single lever light switch. Metal mounting plate with surface mount design. Durable construction for workshops and industrial environments.",
      price: 45,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ZAP%20SWITCH%20LIGHT%20INDUSTRIAL%201L-sPUWwlXxjFONY69d9iNjb34yPI223c.jpg",
      stock_quantity: 100,
      
      supplier: "Ausma",
      is_featured: false,
      is_active: true,
    },
    {
      name: "Zap Switch Light Industrial 2 Lever",
      description: "Industrial-grade 2 lever light switch. Metal mounting plate with surface mount design. One switch with indicator. Durable construction for workshops and industrial environments.",
      price: 55,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ZAP%20SWITCH%20LIGHT%20INDUSTRIAL%202L-ofCQTmLSSx9TALFqNGrqgBVg2x5qUr.jpg",
      stock_quantity: 100,
      
      supplier: "Ausma",
      is_featured: false,
      is_active: true,
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
    message: `Added ${data.length} socket and switch products`,
    products: data 
  })
}
