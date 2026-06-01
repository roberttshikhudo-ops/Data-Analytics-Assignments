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

  const electricalCat = categories?.find((c) => c.slug === "electrical")

  if (!electricalCat) {
    return NextResponse.json({ error: "Electrical category not found" }, { status: 400 })
  }

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const productsData = [
    // Electrical - Light Fittings
    {
      name: "Bayonet Cap Holder B22",
      description: "Black plastic bayonet cap light bulb holder with mounting holes. Standard B22 fitting for bayonet cap bulbs.",
      price: 25,
      category_id: electricalCat.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bayonet%20cap%20holder-KzrOJjaLNhSBr5L8CjBRWmesZn7uVF.jpg",
      stock_quantity: 200,
      supplier: "Generic",
    },
    // Electronics - Phone Cables & Chargers
    {
      name: "Samsung USB-C Cable Black",
      description: "Original Samsung USB-A to USB-C charging and data cable. Fast charging compatible. Black color.",
      price: 95,
      category_id: electricalCat.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Samsung%20Cable%20C%20type-My4TtVP2dC8l4E6nQwanm2c2AinMcT.jpg",
      stock_quantity: 50,
      supplier: "Samsung",
    },
    {
      name: "Samsung Micro-USB Cable White",
      description: "Original Samsung USB-A to Micro-USB charging and data cable. Best quality original. White color.",
      price: 75,
      category_id: electricalCat.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Samsung%20Cable%20B%20type-dRcs2QLLmIeVmucgUdPek2IV095C5P.jpg",
      stock_quantity: 50,
      supplier: "Samsung",
    },
    {
      name: "iPhone Lightning Cable White",
      description: "Lightning to USB-A cable for Apple iPhone devices. Charging and data sync. White color.",
      price: 125,
      category_id: electricalCat.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cable%20Iphone-ChOu43q0OifNcwu03CyEEwqfwLnF5Z.jpg",
      stock_quantity: 50,
      supplier: "Apple",
    },
    {
      name: "USB Charger Head 20W White",
      description: "USB power adapter with euro 2-pin plug. 20W fast charging support. White color.",
      price: 145,
      category_id: electricalCat.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Charger%20head-Fxk2fUAggGbEQp4vgdUd6jBzNcSwhO.jpg",
      stock_quantity: 50,
      supplier: "Generic",
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
    message: `Added ${data.length} electronics products`,
    products: data 
  })
}
