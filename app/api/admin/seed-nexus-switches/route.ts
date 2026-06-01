import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get the Electrical category ID
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Electrical")
    .single()

  if (!category) {
    return NextResponse.json({ error: "Electrical category not found" }, { status: 404 })
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const productsData = [
    // Multiplugs
    {
      name: "Nexus Multiplug 3-Way",
      price: 65,
      description: "3-way multiplug with overload protection. Compact design with short cord.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20MULTIPLUG%203%20WAY%20PP-iRObyKNg1ixinOmtX07eNGxwWnbQ2y.jpg",
      category_id: category.id,
      stock_quantity: 50,
      supplier: "Nexus"
    },
    {
      name: "Nexus Multiplug 6-Way",
      price: 95,
      description: "6-way multiplug with overload protection. Mixed SA and Euro sockets.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20MULTIPLUG%206%20WAY-wyhrMlE6JNmKXFmYrcDTaXRzyj0mQv.jpg",
      category_id: category.id,
      stock_quantity: 40,
      supplier: "Nexus"
    },
    {
      name: "Nexus Multiplug 6-Way 3m Cable",
      price: 145,
      description: "6-way multiplug with 3 meter cable. Mixed SA and Euro sockets with indicator light.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20MULTIPLUG%206%20WAY%203M%20CABLE-T8rotfpUBKHVk3DHqbJNN80QxJzb3E.jpg",
      category_id: category.id,
      stock_quantity: 35,
      supplier: "Nexus"
    },
    {
      name: "Nexus Multiplug 6-Way 5m Cable",
      price: 175,
      description: "6-way multiplug with 5 meter cable. Mixed SA and Euro sockets with indicator light.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20MULTIPLUG%206%20WAY%205M%20CABLE-fecjTUXoHzWfxpj85r4LfcNGYK5aHp.jpg",
      category_id: category.id,
      stock_quantity: 30,
      supplier: "Nexus"
    },
    {
      name: "Nexus Multiplug 6-Way Surge",
      price: 165,
      description: "6-way multiplug with surge protection. Red dedicated plug for safety.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20MULTI%20PLUG%206WAY%20SURGE-LkmMHWJCRBlCCWBBp3207vdn4T6W7A.jpg",
      category_id: category.id,
      stock_quantity: 25,
      supplier: "Nexus"
    },
    {
      name: "Nexus Multiplug 8-Way",
      price: 145,
      description: "8-way multiplug with overload protection. Mixed SA and Euro sockets.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20MULTIPLUG%208%20WAY-TnseH8weJ22imDhXKrimMb4Bcd0MBt.jpg",
      category_id: category.id,
      stock_quantity: 35,
      supplier: "Nexus"
    },
    {
      name: "Nexus Multiplug 8-Way Surge",
      price: 195,
      description: "8-way multiplug with surge protection. Red dedicated plug for safety.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20MULTI%20PLUG%208WAY%20SURGE-Eo9CAqB2ri299DKjMmxO9fhENtdXh7.jpg",
      category_id: category.id,
      stock_quantity: 25,
      supplier: "Nexus"
    },
    {
      name: "Nexus Multiplug 10-Way",
      price: 195,
      description: "10-way multiplug with surge protection. Large capacity for multiple devices.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20MULTIPLUG%2010%20WAY-t4QmAWI2DtqfJTDV1MyzdNo5KdnNTQ.jpg",
      category_id: category.id,
      stock_quantity: 20,
      supplier: "Nexus"
    },
    // Light Switches
    {
      name: "Nexus Light Switch + Cover 1 Lever",
      price: 35,
      description: "Single lever light switch with cover plate. White finish with indicator.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20LIGHT%20SWITCH%20%2B%20COVER%201L-OtjDMtaWudNFe1g8wZhGKHbS8XaQ2J.jpg",
      category_id: category.id,
      stock_quantity: 100,
      supplier: "Nexus"
    },
    {
      name: "Nexus Light Switch + Cover 2 Lever",
      price: 45,
      description: "Double lever light switch with cover plate. White finish with indicator.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20LIGHT%20SWITCH%20%2B%20COVER%202L-EpIvD2v5gMGP78yom6skIzOfC0cPw7.jpg",
      category_id: category.id,
      stock_quantity: 80,
      supplier: "Nexus"
    },
    {
      name: "Nexus Light Switch + Cover 3 Lever",
      price: 55,
      description: "Triple lever light switch with cover plate. White finish with indicators.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20LIGHT%20SWITCH%20%2B%20COVER%203L-jpq1dreAWXsk7vY3Ayp5lkEMVD4MIm.jpg",
      category_id: category.id,
      stock_quantity: 60,
      supplier: "Nexus"
    },
    {
      name: "Nexus Light Switch + Cover 4 Lever",
      price: 65,
      description: "Quad lever light switch with cover plate. White finish with indicators.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20LIGHT%20SWITCH%20%2B%20COVER%204L-0RXMYmWXpBapdaeg280uTflFSUbjSQ.jpg",
      category_id: category.id,
      stock_quantity: 50,
      supplier: "Nexus"
    },
    // Plug Tops
    {
      name: "Nexus Plugtop PVC White 16A",
      price: 25,
      description: "16A PVC plug top in white/clear. 3-pin South African standard.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20PLUGTOP%20PVC%20WHT%2016A%20PP-6opEbNr0R3CpjpLl9kgC6NSzw0LkNi.jpg",
      category_id: category.id,
      stock_quantity: 200,
      supplier: "Nexus"
    },
    {
      name: "Nexus Plugtop Hollow Pin White 16A",
      price: 25,
      description: "16A hollow pin plug top in white/clear. 3-pin South African standard.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20PLUGTOP%20HOLLOW%20PIN%20WHITE%2016A%20PP-peFn2eMGZSDkPAXPurA0yU6e9z0Xeu.png",
      category_id: category.id,
      stock_quantity: 150,
      supplier: "Nexus"
    },
    {
      name: "Nexus Plugtop Rubber Compound 16A Black",
      price: 35,
      description: "16A heavy-duty rubber compound plug top in black with gold pins. Industrial grade.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20PLUGTOP%20RUBBER%20COMPOUND%2016A%20PP-eR0cYcoH2a87BcFBuotnBwJNqvBIoB.jpg",
      category_id: category.id,
      stock_quantity: 100,
      supplier: "Nexus"
    },
    // Adaptors
    {
      name: "Nexus Plug Adaptor 1x16A 2x5A 1xSchuko Power On",
      price: 55,
      description: "Multi-socket adaptor with power indicator. 1x16A SA, 2x5A Euro, 1xSchuko sockets.",
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NEXUS%20PLUG%20ADAPTOR%201X16A.%202X5A.%201X%20SCHUKO%20POWER%20ON-5kf731ndszJW6HOeoSjE6VSeRUP36L.jpg",
      category_id: category.id,
      stock_quantity: 40,
      supplier: "Nexus"
    }
  ]

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
    message: `Added ${data.length} Nexus switches/multiplugs/plugtops`,
    products: data 
  })
}
