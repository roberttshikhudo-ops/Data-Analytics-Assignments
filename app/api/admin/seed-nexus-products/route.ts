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
    // Adaptors with USB
    {
      name: "Nexus Adaptor 1x16A 1x5A Schuko 2xUSB",
      description: "Multi-adaptor with 1x16A SA plug, 1x5A euro, 1x Schuko and 2 USB charging ports (2.1A total)",
      price: 125,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%201X16A%201X5A%20SCHUKO%202XUSB%20PP-5vTu2D7T7HCiRyorDgnaTMIkCn7mcl.jpg",
      supplier: "Nexus",
    },
    // Euro Adaptors
    {
      name: "Nexus Adaptor Euro 4x5A",
      description: "4-way euro adaptor with 4x5A outlets for small appliances",
      price: 35,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%20EURO%204X5A-IrSFeFufQmH49Nv9x1oj9eK1EwIc6g.jpg",
      supplier: "Nexus",
    },
    {
      name: "Nexus Adaptor 2x5A",
      description: "2-way euro adaptor with 2x5A outlets",
      price: 25,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%202X5A%20PP-qOoZehYbejgWdnYHhuRu84pIByZEwS.jpg",
      supplier: "Nexus",
    },
    {
      name: "Nexus Adaptor 3x5A",
      description: "3-way vertical euro adaptor with 3x5A outlets",
      price: 35,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%203X5A%20PP-UP5n9ZBt8xxoZfjDjkSMzqBqMeh0GJ.jpg",
      supplier: "Nexus",
    },
    // Mixed Adaptors
    {
      name: "Nexus Adaptor 1x16A 2x5A 1xSchuko",
      description: "Multi-adaptor with 1x16A SA plug, 2x5A euro and 1x Schuko outlet",
      price: 65,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%201X16A%202X5A%201XSCHUKO%20PP-ppvBg46DlQmmvoI5huWm6ozSHYmDHC.jpg",
      supplier: "Nexus",
    },
    {
      name: "Nexus Adaptor 1x16A 2x5A Long",
      description: "Multi-adaptor with 1x16A SA plug and 2x5A euro outlets, long design",
      price: 45,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%201X16A%202X5A%20LONG-FB9Sq9uwQnkft1Qh1dSWIAeLZCDiyv.jpg",
      supplier: "Nexus",
    },
    {
      name: "Nexus Adaptor 1x16A 2x5A Hex",
      description: "Hexagonal multi-adaptor with 1x16A SA plug and 2x5A euro outlets",
      price: 55,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%201X16A%202X5A%20HEX%20PP-XzYuuktWOQvA4WuWpMdWwZFre1pHDD.jpg",
      supplier: "Nexus",
    },
    {
      name: "Nexus Adaptor 2x16A 2x5A",
      description: "Multi-adaptor with 2x16A SA plugs and 2x5A euro outlets",
      price: 65,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%202X16A%202X5A%20PP-QIrFABXT8KanWxL4qCxQ2dNXZZRRmY.jpg",
      supplier: "Nexus",
    },
    {
      name: "Nexus Adaptor 3x16A 3x5A",
      description: "Large multi-adaptor with 3x16A SA plugs and 3x5A euro outlets",
      price: 85,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%203X16A%203X5A-Jz98HhMxMKRt3taJGeAW9GRalc4k4L.jpg",
      supplier: "Nexus",
    },
    // 16A Only Adaptors
    {
      name: "Nexus Adaptor 2x16A",
      description: "Double adaptor with 2x16A SA plug outlets",
      price: 45,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%202X16A%20PP-YFRBCRrqipIBdJiKJQtJsqdLh0kK6R.jpg",
      supplier: "Nexus",
    },
    {
      name: "Nexus Adaptor 3x16A",
      description: "Triple adaptor with 3x16A SA plug outlets",
      price: 55,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%203X16A%20PP-3bksQ9UbgeFCyaNmryjKu9X0cVj9Ag.jpg",
      supplier: "Nexus",
    },
    // Surge Protection Adaptors
    {
      name: "Nexus Adaptor 3x16A Surge",
      description: "Triple adaptor with 3x16A SA plug outlets and built-in surge protection",
      price: 85,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%203X16A%20SURGE-HCufhH80K27eW6JIJh11cl3etwZqXd.jpg",
      supplier: "Nexus",
    },
    {
      name: "Nexus Adaptor 1x16A 2x5A Surge",
      description: "Multi-adaptor with 1x16A SA plug, 2x5A euro outlets and surge protection",
      price: 75,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20ADAPTOR%201X16A%202X5A%20SURGE%20PP-2vczvArNQDNQLmu0m3dF5jzAYn4QUw.jpg",
      supplier: "Nexus",
    },
    // Multiplug
    {
      name: "Nexus Multiplug 8-Way Switched",
      description: "8-way multiplug extension lead with on/off switch, 1x Schuko, 3x16A SA and 4x5A euro outlets",
      price: 195,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXSUS%20MULTIPLUG%208%20WAY%20SWITCHED-QtN4sJJ9V4xcjJxv2KELgUj3eJMwqZ.jpg",
      supplier: "Nexus",
    },
    // Conduit Box
    {
      name: "Nexus Conduit Box 2-Way Through SABS 20mm 5-Pack",
      description: "PVC conduit junction box, 2-way through configuration, SABS approved, 20mm, pack of 5",
      price: 45,
      category_id: electricalCategory.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EXUS%20CONDUIT%20BOX%202-WAY%20THROUGH%20SABS%2020MM%205PACK-dwh0KDJp5tv6iT8sFYHag3LpukLQSh.jpg",
      supplier: "Nexus",
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
    message: `Successfully added ${data.length} Nexus products`,
    products: data 
  })
}
