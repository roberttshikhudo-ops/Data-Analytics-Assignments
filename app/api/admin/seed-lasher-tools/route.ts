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

  const products = [
    // Hammers
    {
      name: "Lasher Claw Hammer Poly Handle 500g",
      description: "Professional claw hammer with ergonomic poly handle. 500g head weight ideal for general carpentry and DIY tasks. Green painted head with yellow/black grip.",
      price: 185,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20CLAW%20HAMMER%20POLY%20HANDLE%20500G-BS36zFv6F36xF7CpP4rEsytEKo9z8g.jpg",
      stock_quantity: 50,
      supplier: "Lasher",
    },
    {
      name: "Lasher Club Hammer Poly Handle 1.8kg",
      description: "Heavy-duty club hammer with poly handle for demolition and masonry work. 1.8kg head provides powerful striking force. Green painted head with comfortable grip.",
      price: 245,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20CLUB%20HAMMER%20POLY%20HANDLE%201.8KG-wPN2RWMQTqqc9A9dgcpz6CXVtUBd91.jpg",
      stock_quantity: 35,
      supplier: "Lasher",
    },
    // Bow Saws
    {
      name: "Lasher Bow Saw 30L 530mm GP",
      description: "General purpose bow saw with 530mm blade. Yellow tubular steel frame with comfortable grip. Ideal for cutting branches and logs.",
      price: 195,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bowsaw%2030L%20530mm%20gp-noOMSY28mmAt69HPvhThpQ934DobfO.jpg",
      stock_quantity: 40,
      supplier: "Lasher",
    },
    {
      name: "Lasher Bow Saw 31 600mm",
      description: "Heavy-duty bow saw with 600mm blade. Black/green frame for durability. Perfect for cutting firewood and pruning.",
      price: 225,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bowsaw%2031%20600mm-4Cpw8DnntDMTUFjVubbMniSRdUxnpo.jpg",
      stock_quantity: 35,
      supplier: "Lasher",
    },
    {
      name: "Lasher Bow Saw 51A 530mm",
      description: "Lightweight bow saw with 530mm blade. Yellow frame with tensioning mechanism. Easy blade replacement.",
      price: 175,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lasher%20Bowsaw%2051a%20530-oiO2oQ0runFSTdp3zSEGwsMKHciyEv.jpg",
      stock_quantity: 45,
      supplier: "Lasher",
    },
    {
      name: "Lasher Bow Saw 750mm 30L Heavy Duty",
      description: "Large heavy-duty bow saw with 750mm blade. Yellow tubular steel frame for maximum cutting capacity. Professional grade.",
      price: 295,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20BOW%20SAW%20750MM%2030L%2010664-CfckOmvn0K25Qt5woVLMgTm14tFFdp.jpg",
      stock_quantity: 25,
      supplier: "Lasher",
    },
    // Bow Saw Blades
    {
      name: "Lasher Bow Saw Blade 31A 600x20mm",
      description: "Replacement bow saw blade 600mm x 20mm. Carbon steel with hardened teeth. Fits most 600mm bow saws.",
      price: 65,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20BOW%20SAW%20BLADE%2031A%20600X20MM%201575-SEU0ZpcNU2ByuBH1ADhT9l5pbDfwa5.jpg",
      stock_quantity: 100,
      supplier: "Lasher",
    },
    {
      name: "Lasher Bow Saw Blade 530x31mm Hard Point",
      description: "Premium replacement blade 530mm x 31mm. Best quality carbon steel with hard point teeth for longer life.",
      price: 55,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20BOW%20SAW%20BLADE%201615%20530X31-DpDpNEAkhUnRgY4y651nQbrsIjXVNr.jpg",
      stock_quantity: 100,
      supplier: "Lasher",
    },
    // Cutting Tools
    {
      name: "Lasher Panga 300P Poly Handle",
      description: "Heavy-duty panga/machete with poly handle. Black coated blade for rust resistance. Ideal for clearing brush and vegetation.",
      price: 145,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lasher%20300p%20poly%20handle-dhbEPkqZR1FfutwpmoD5xJfaSuMQc7.jpg",
      stock_quantity: 60,
      supplier: "Lasher",
    },
    {
      name: "Lasher Cane Knife Poly Handle",
      description: "Wide blade cane knife with ergonomic poly handle. Black coated blade for durability. Perfect for cutting cane and heavy vegetation.",
      price: 165,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20CANE%20KNIFE%20POLY%20HANDLE%202172-x8PCizfagVLRqKKfjrUEs7jOFqGs90.jpg",
      stock_quantity: 45,
      supplier: "Lasher",
    },
    {
      name: "Lasher Bypass Secateur",
      description: "Professional bypass secateur with green handles. Sharp carbon steel blade for clean cuts. Ideal for pruning and trimming.",
      price: 125,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%20BYPASS%20SECATEUR%202139-jmD4wP7BcgZjI2cq0WxCTFs78ERtyg.jpg",
      stock_quantity: 75,
      supplier: "Lasher",
    },
    // Rakes
    {
      name: "Lasher 16 Teeth Garden Rake Heavy Duty",
      description: "Heavy-duty garden rake with 16 steel teeth. Green head with yellow steel handle. Perfect for soil preparation and leveling.",
      price: 225,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%2016%20TEETH%20GARDEN%20RAKE%20STEEL%20H%20DUTY%20FG00015-hdgs9kulcWQOAPv86UW8ehaJc2aPCc.jpg",
      stock_quantity: 40,
      supplier: "Lasher",
    },
    {
      name: "Lasher 16 Teeth Rake Steel Handle",
      description: "Standard garden rake with 16 teeth. All yellow finish with steel handle. Ideal for general garden maintenance.",
      price: 195,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hw1541118LASHER%2016%20TEETH%20RAKE%20STEEL%20HANDLE%20MD%2038%20FG00038-9rJAxYJzrpmZ08xFMEKDajsbnancch.jpg",
      stock_quantity: 45,
      supplier: "Lasher",
    },
    {
      name: "Lasher 25 Teeth Rubber Rake Steel Handle",
      description: "Rubber rake with 25 flexible teeth. Yellow head and steel handle. Gentle on lawns while effectively collecting leaves and debris.",
      price: 185,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LASHER%2025%20TEETH%20RUBBER%20RAKE%20STEEL%20HANDLE%20FG00040-kjDxu3biZ3Hsf80FcmAa449NqvNhIP.jpg",
      stock_quantity: 50,
      supplier: "Lasher",
    },
    // Digging Tools
    {
      name: "Lasher Cutter Mattock Head 225g",
      description: "Cutter mattock head 225g. Black forged steel. Requires handle (sold separately). Ideal for digging and cutting roots.",
      price: 95,
      category_id: toolsCategory,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cutter%20matock%20225g-ENq2tdnDH04Ew9FlZmQiHN896oK8V0.jpg",
      stock_quantity: 60,
      supplier: "Lasher",
    },
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
    message: "Lasher tools seeded", 
    count: results.filter(r => r.success).length,
    results 
  })
}
