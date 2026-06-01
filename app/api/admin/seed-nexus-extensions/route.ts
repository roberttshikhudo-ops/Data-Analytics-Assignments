import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get Electrical category ID
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")

  const electricalCategory = categories?.find(c => c.name === "Electrical")

  if (!electricalCategory) {
    return NextResponse.json({ error: "Electrical category not found" }, { status: 400 })
  }

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const productsData = [
    // Extension Reels
    {
      name: "Nexus Extension Reel 30m 10A (16A) 3-Way",
      description: "Heavy duty extension reel with metal stand, 30m cable length, 3-way outlet with thermal cut-out protection",
      price: 595,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20EXTENSION%20REEL%2030M%2010A%20%2816A%29%203WAY-auF4NbUpHkRtLtLvgfr5HaG5k1GTH0.jpg",
      stock_quantity: 15,
      supplier: "Nexus"
    },
    {
      name: "Nexus Extension Reel Plastic 16A 25m",
      description: "Light duty plastic extension reel, 25m cable length, safety shuttered outlets with overload protection",
      price: 495,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20EXTENSION%20REEL%20PLASTIC%2016A%2025M-9IDaT9ai634kdJY1NYXqG7YSllkw2L.jpg",
      stock_quantity: 20,
      supplier: "Nexus"
    },
    {
      name: "Nexus Cassette Reel 10A 10m",
      description: "Compact cassette extension reel with carry handle, 10m cable length, light duty use",
      price: 295,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20CASETTE%20REEL%2010A%2010M-u2XMKwTVxnqGxJs1JnysUQ2odRO2Vl.jpg",
      stock_quantity: 25,
      supplier: "Nexus"
    },
    // Extension Cords
    {
      name: "Nexus Extension Cord Double 3m 10A",
      description: "White double extension cord with Janus coupler, 3m length, 10A rated",
      price: 65,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20EXTENSION%20CORD%20DBL%203M%2010A-btf6pMHKi3OfPVnQ99Gd12mbwb36lo.jpg",
      stock_quantity: 50,
      supplier: "Nexus"
    },
    {
      name: "Nexus Extension Cord Double 5m 10A",
      description: "White double extension cord with Janus coupler, 5m length, 10A rated",
      price: 85,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20EXTENSION%20CORD%20DBL%205M%2010A-pIinizrZrR5Iejsin2lJ9AXrZiJH9J.jpg",
      stock_quantity: 50,
      supplier: "Nexus"
    },
    {
      name: "Nexus Extension Cord Double 10m 10A",
      description: "White double extension cord with Janus coupler, 10m length, 10A rated",
      price: 125,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20EXTENSION%20CORD%20DBL%2010M%2010A-qPqy7lpcwRVMnzHlW14poTdTHX4UTQ.jpg",
      stock_quantity: 40,
      supplier: "Nexus"
    },
    {
      name: "Nexus Extension Cord Double 20m 10A",
      description: "White double extension cord with Janus coupler, 20m length, 10A rated",
      price: 195,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20EXTENSION%20CORD%20DBL%2020M%2010A-i5rUSEg8m5uFmTWi1D1hKHdSgQI6zV.jpg",
      stock_quantity: 30,
      supplier: "Nexus"
    },
    // Janus Couplers
    {
      name: "Nexus Janus Coupler Double PVC 16A White",
      description: "White PVC double-sided Janus coupler, 16A rated for joining extension cords",
      price: 35,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20JANUS%20COUPLER%20DBL%20PVC%2016A%20WHT%20PP-1vIxsBP7tq13hGPlloRBDbywXZ4r45.jpg",
      stock_quantity: 100,
      supplier: "Nexus"
    },
    {
      name: "Nexus Janus Coupler Double PVC 16A Black",
      description: "Black PVC double-sided Janus coupler, 16A rated for joining extension cords",
      price: 35,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20JANUS%20COUPLER%20DBL%20PVC%2016A%20BLK%20PP-GVU8lx0iEfh0qouu2yRw3xN6ryMZP4.jpg",
      stock_quantity: 100,
      supplier: "Nexus"
    },
    {
      name: "Nexus Janus Coupler Double Rubber 16A Black",
      description: "Black rubber double-sided Janus coupler, 16A rated, heavy duty for outdoor use",
      price: 45,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20JANUS%20COUPLER%20DBL%20RUBBER%2016A%20BLK%20PP-VoOqXMOmocMl4u2LjGhaGfXn9nng1P.jpg",
      stock_quantity: 80,
      supplier: "Nexus"
    },
    // Conduit Boxes
    {
      name: "Nexus Conduit Box 3-Way SABS 20mm 5-Pack",
      description: "White PVC 3-way conduit junction box, SABS approved, 20mm, pack of 5",
      price: 55,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20CONDUIT%20BOX%203%20WAY%20SABS%2020MM%205PACK-WS3QUG3FhRZxbcSjPkNHPfGJrVTkS9.jpg",
      stock_quantity: 60,
      supplier: "Nexus"
    },
    {
      name: "Nexus Conduit Box 4-Way SABS 20mm 5-Pack",
      description: "White PVC 4-way conduit junction box, SABS approved, 20mm, pack of 5",
      price: 65,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20CONDUIT%20BOX%204%20WAY%20SABS%2020MM%205PA-zBlou2jaBs5UvTBPB28WGcSXRkXP4B.jpg",
      stock_quantity: 60,
      supplier: "Nexus"
    },
    {
      name: "Nexus Conduit Box Round Y 20mm PVC 5-Pack",
      description: "White PVC Y-shaped conduit junction box, 20mm, pack of 5",
      price: 55,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20CONDUIT%20BOX%20ROUND%20Y%2020MM%20PVC%205PACK-dLWAJRpXuA447ApoFL6mkVom6wSwX6.jpg",
      stock_quantity: 60,
      supplier: "Nexus"
    },
    {
      name: "Nexus Conduit Inspection T Piece SABS 20mm 5-Pack",
      description: "White PVC T-piece conduit fitting with inspection access, SABS approved, 20mm, pack of 5",
      price: 45,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20CONDUIT%20INSPECTION%20T%20PIECE%20SABS%2020MM%205PACK-qr4CBA1iazx8HDXXQdOm79uZerYNub.jpg",
      stock_quantity: 80,
      supplier: "Nexus"
    },
    // Adaptors
    {
      name: "Nexus Adaptor Schuko Round",
      description: "White round Schuko adaptor for European appliances, converts SA plug to Schuko socket",
      price: 45,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%20SCHUKO%20ROUND%20PP-XHLb8dkWp9t5moICE3xYEtpTvM04Bt.jpg",
      stock_quantity: 80,
      supplier: "Nexus"
    },
    {
      name: "Nexus Adaptor Euro Top Entry 5A",
      description: "White euro adaptor with top entry socket, 5A rated for small appliances",
      price: 25,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%20EURO%20TOP%20ENTRY%205A%20PP-sAGZXgT47bTTN2Nu4XM1ngEh9KnfsU.jpg",
      stock_quantity: 100,
      supplier: "Nexus"
    }
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
    message: `Added ${data.length} Nexus extension products`,
    products: data 
  })
}
