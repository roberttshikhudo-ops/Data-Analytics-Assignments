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
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
  
  const categoryMap: Record<string, string> = {}
  categories?.forEach(cat => {
    categoryMap[cat.name] = cat.id
  })

  const products = [
    // Plumbing - Visto Taps
    {
      name: "Visto Bib Tap 15mm Long",
      description: "Chrome bib tap with long spout for wall mounting. Quality brass construction with ceramic disc valve.",
      price: 125,
      category_id: categoryMap["Plumbing"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VISTO%20BIB%20TAP%2015MM%20LONG-uRMSdljSMBTSQ9g7LYCqhD7SH0OpEW.jpg",
      supplier: "Visto",
    },
    {
      name: "Visto Bib Tap 15mm Short",
      description: "Chrome bib tap with short spout for wall mounting. Quality brass construction with ceramic disc valve.",
      price: 115,
      category_id: categoryMap["Plumbing"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VISTO%20BIB%20TAP%2015MM%20SHORT-V6Jd2GEDtdoMTSdQFsO6LlJeWL0HvL.jpg",
      supplier: "Visto",
    },
    {
      name: "Visto Bib Tap 15mm with Hose Connection",
      description: "Chrome bib tap with hose connection thread for garden hose attachment. Brass construction.",
      price: 135,
      category_id: categoryMap["Plumbing"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VISTO%20BIB%20TAP%2015MM%20W%20H-XkizwRRbhkeJDBa4MCSOmDtN4dWeYD.jpg",
      supplier: "Visto",
    },
    {
      name: "Visto Pillar Tap 15mm",
      description: "Chrome pillar tap for basin mounting. Single hole installation with ceramic disc valve.",
      price: 95,
      category_id: categoryMap["Plumbing"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VISTO%20PILLAR%2015MM-ItxiXOlA3x9axzHMqnK0RaXo9kbJ3S.jpg",
      supplier: "Visto",
    },
    {
      name: "Visto Sink Mixer Double Handle",
      description: "Chrome sink mixer with double handles and swivel spout. Ideal for kitchen sink installation.",
      price: 345,
      category_id: categoryMap["Plumbing"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VISTO%20SINK%20MIXER%20D%20T-UZmlIF8DrO5fa8m2IyMM5gI4X2rfpc.jpg",
      supplier: "Visto",
    },
    {
      name: "Visto Basin Mixer Cast Spout",
      description: "Chrome basin mixer with cast spout and double handles. Premium quality brass construction.",
      price: 295,
      category_id: categoryMap["Plumbing"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VISTO%20BASIN%20MIXER%20CAST%20SPOUT-fcGkmWCxHusdOdHfUOxmqdgo5fRDIS.jpg",
      supplier: "Visto",
    },
    {
      name: "Visto UT 15mm MxM",
      description: "Chrome utility tap 15mm male x male connection. Concealed installation valve.",
      price: 85,
      category_id: categoryMap["Plumbing"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VISTO%20UT%2015MM%20MXM-KP7Lo1sPdSuaxcHJr3XKUViGw1VwPB.jpg",
      supplier: "Visto",
    },
    // Home & Living - Tuffy Bags
    {
      name: "Tuffy Zipper Sandwich Bags Medium 19x18cm 15-Pack",
      description: "Medium size zipper sandwich bags. Tuff Max extra strength material. 15 bags per pack.",
      price: 35,
      category_id: categoryMap["Home & Living"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TUFFY%20SMALL%20ZIPPER%20SANDWICH%20BAG%2019X18CM%20X15%20P%20PACK-icts1FKSBH63cPSQGuPPNHbA0rRaRr.jpg",
      supplier: "Tuffy",
    },
    {
      name: "Tuffy Zipper Freezer Bags Large 27x28cm 10-Pack",
      description: "Large size zipper freezer bags. Tuff Max extra strength for freezer storage. 10 bags per pack.",
      price: 45,
      category_id: categoryMap["Home & Living"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TUFFY%20LARGE%20ZIPPER%20FREEZER%20BAG%2027X28CM%20X10%20P%20PACK-rFnZGUI9Y3iui6r4gyuj90L9t4BtA4.jpg",
      supplier: "Tuffy",
    },
    // Gardening Tools - Wheelbarrows
    {
      name: "Wheelbarrow Light Duty 65L Max Load 60kg",
      description: "Light duty wheelbarrow with 65 litre capacity. Maximum load 60kg. Green tray with solid wheel.",
      price: 595,
      category_id: categoryMap["Gardening Tools"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHEELBARROW%20LIGHT%20DUTY%2065L%20MAX%20LOAD%2060KG-FTdBefoRLxSple1q0CugmoqnNm400o.jpg",
      supplier: null,
    },
    {
      name: "Wheelbarrow Concrete Eagle Assembled",
      description: "Heavy duty concrete wheelbarrow. Assembled and ready to use. Black tray with pneumatic wheel.",
      price: 895,
      category_id: categoryMap["Gardening Tools"],
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHEELBARROW%20CONCRETE%20EAGLE%20ASSEMBLED-az33XxvlGIXIEZ8TePy2w3JpHehEab.jpg",
      supplier: "Eagle",
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
      results.push({ name: product.name, status: "error", error: error.message })
    } else {
      results.push({ name: product.name, status: "success", id: data.id })
    }
  }

  return NextResponse.json({
    message: "Plumbing and garden products seeded",
    results,
    total: results.filter(r => r.status === "success").length
  })
}
