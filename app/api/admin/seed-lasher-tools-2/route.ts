import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get or create the Tools & Hardware category
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
    {
      name: "Lasher Deluxe Hedge Shear FG02135",
      description: "Deluxe hedge shears with yellow poly handles and grey steel blades. Ideal for trimming hedges and shrubs with precision cutting.",
      price: 295,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20DELUXE%20HEADGE%20SHEAR%20FG02135-rWmAPXm73XkIplnyFZbILO6bGQb9pj.jpg",
      category_id: categoryId,
      stock_quantity: 25,
      supplier: "Lasher",
    },
    {
      name: "Lasher Hedge Shear FG02134",
      description: "Standard hedge shears with green poly handles and black steel blades. Durable construction for regular garden maintenance.",
      price: 225,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20HEDGE%20SHEAR%20FG02134-b83j4cHb402wzF2j2qUQGaXExT4qqO.jpg",
      category_id: categoryId,
      stock_quantity: 30,
      supplier: "Lasher",
    },
    {
      name: "Lasher Hoe Head Sunken Eye 900g",
      description: "Heavy-duty hoe head with sunken eye design for secure handle fitting. 900g weight ideal for general garden hoeing.",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20HOE%20HEAD%20SUNKEN%20EYE%20900G%205920-5TwqYIyCy3ob0ceWiPl2l39V3UKWvh.jpg",
      category_id: categoryId,
      stock_quantity: 50,
      supplier: "Lasher",
    },
    {
      name: "Lasher Hoe Head Sunken Eye 1100g",
      description: "Heavy-duty hoe head with sunken eye design. Larger 1100g weight for tougher soil conditions and heavy-duty work.",
      price: 95,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20HOE%20HEAD%20SUNKEN%20EYE%201100G%205925-R3s404R7OiEvTmYXQqmhfZx11S2FyR.jpg",
      category_id: categoryId,
      stock_quantity: 40,
      supplier: "Lasher",
    },
    {
      name: "Lasher Falcon 4 Prong Fork Welded",
      description: "Heavy-duty 4 prong garden fork with welded steel construction and D-handle grip. Perfect for digging and turning soil.",
      price: 345,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20FALCON%204%20PRONG%20FORK%20WELDED-9YHZCGkfD1pCw75g4JT71ZeyOSF2rs.jpg",
      category_id: categoryId,
      stock_quantity: 20,
      supplier: "Lasher",
    },
    {
      name: "Lasher Hatchet Steel Handle 900g",
      description: "Professional hatchet with polished steel head and chrome steel handle with rubber grip. 900g weight for versatile chopping tasks.",
      price: 295,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20HATCHET%20STEEL%20HANDLE%205301%20900G-P2B4cvmWXyxEnK6YN06bYu2C7tZqcQ.jpg",
      category_id: categoryId,
      stock_quantity: 25,
      supplier: "Lasher",
    },
    {
      name: "Lasher Corn Knife 2260",
      description: "Heavy-duty corn knife with wide black steel blade and poly handle. Ideal for cutting corn stalks and heavy vegetation.",
      price: 165,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20CORN%20KNIFE%202260-miw70TSNzN0THHhvyNzLRrq97ntv9C.jpg",
      category_id: categoryId,
      stock_quantity: 35,
      supplier: "Lasher",
    },
    {
      name: "Lasher Machete Panga Knife 2265",
      description: "Traditional panga machete with black steel blade and ergonomic poly handle. Essential tool for bush clearing and farm work.",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20MACHETE%20PANGA%20KNIFE%202265-oHSogCyl13TVI1ncI9SpEYtcVs7FdT.jpg",
      category_id: categoryId,
      stock_quantity: 45,
      supplier: "Lasher",
    },
    {
      name: "Lasher Hand Saw 899 550x11P",
      description: "Quality handyman saw with 550mm blade and green poly handle. 11 points per inch for smooth cutting of wood.",
      price: 175,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20HAND%20SAW%20899%20550X11P%201725-61lw6HYdTeUAQBNAXJE4OqASRk8BuG.jpg",
      category_id: categoryId,
      stock_quantity: 30,
      supplier: "Lasher",
    },
    {
      name: "Lasher Hacksaw 225",
      description: "Professional hacksaw with green steel frame and yellow blade guard. Includes HSS blade for cutting metal and plastic.",
      price: 195,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20HACKSAW%20225-UO8c2ANKZcP1i1L8epwWnKPVzDg32R.jpg",
      category_id: categoryId,
      stock_quantity: 25,
      supplier: "Lasher",
    },
    {
      name: "Lasher Fan Leaf Rake Combination Poly",
      description: "Large combination fan leaf rake with green poly tines. Double-sided design for raking leaves and debris efficiently.",
      price: 165,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20FAN%20LEAF%20RAKE%20COMBINATION%20POLY%20FG00019-HAhAAzWzgdDkqJMwbIfyNdlUC9MdrF.jpg",
      category_id: categoryId,
      stock_quantity: 30,
      supplier: "Lasher",
    },
    {
      name: "Lasher Mattock Head Cutter 2.25kg",
      description: "Heavy-duty mattock head with cutter and pick ends. 2.25kg weight for breaking hard ground and removing roots.",
      price: 195,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20MATTOCK%20HEAD%20CUTTER%20305%202.25KG-DU9x8jOVd8b2dlp7KDPCqjywOs9I3v.jpg",
      category_id: categoryId,
      stock_quantity: 25,
      supplier: "Lasher",
    },
    {
      name: "Lasher Pick Head C&D 3.1kg",
      description: "Heavy-duty pick head with chisel and point ends. 3.1kg weight for breaking through hard surfaces and rocky ground.",
      price: 225,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20PICK%20HEADS%20C%20%26%20D%20250%203.1KG-HRiqwJr29sEUIhTfLUs4llRsibGCO9.jpg",
      category_id: categoryId,
      stock_quantity: 20,
      supplier: "Lasher",
    },
    {
      name: "Lasher Scutch Hammer Suregrip",
      description: "Professional scutch hammer with green steel head and yellow/black suregrip poly handle. For masonry and brickwork.",
      price: 245,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20SCUTCH%20HAMMER%20SUREGRIP-uqaatWgqJIJnN0DVsVEiSqHaIoOVzh.jpg",
      category_id: categoryId,
      stock_quantity: 20,
      supplier: "Lasher",
    },
    {
      name: "Lasher Hoe Poly Handle",
      description: "Replacement poly handle for hoes. Durable black poly construction with reinforced grip end.",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20HOE%20POLY%20HANDLE-ECj19aDFeuhf9VV4BY4zZ0vdbL1DrR.jpg",
      category_id: categoryId,
      stock_quantity: 60,
      supplier: "Lasher",
    },
    {
      name: "Lasher Digging Spade Black 500",
      description: "Heavy-duty digging spade with square black steel blade and steel D-handle. Built for tough digging conditions.",
      price: 325,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20DIGGING%20SPADE%20BLK%20500-tbeR9VpQhSCWYz8qpwUNIMJyLPe3Dg.jpg",
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
    message: `Added ${data.length} Lasher tools (batch 2)`,
    products: data 
  })
}
