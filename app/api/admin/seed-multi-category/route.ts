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

  // Get or create categories
  const categoryNames = ["Electrical", "Gardening Tools", "Chemicals & Fertilizers", "Home & Living"]
  const categoryMap: Record<string, string> = {}

  for (const catName of categoryNames) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("name", catName)
      .single()

    if (existing) {
      categoryMap[catName] = existing.id
    } else {
      const { data: created } = await supabase
        .from("categories")
        .insert({
          name: catName,
          slug: generateSlug(catName),
          description: `${catName} products`
        })
        .select("id")
        .single()
      if (created) categoryMap[catName] = created.id
    }
  }

  const products = [
    // Electrical - Conduit
    {
      name: "Conduit Solid Bend 25mm",
      description: "White PVC solid bend for 25mm conduit. Used for routing electrical cables around corners.",
      price: 8,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONDUIT%20SOLID%20BEND%2025MM-N5aO0lcPBsMnG4pjqsP1W1sALJOXWn.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 200,
      is_featured: false
    },
    {
      name: "Conduit Coupling SABS 20mm",
      description: "White PVC SABS approved coupling for joining 20mm conduit sections.",
      price: 5,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONDUIT%20COUPLING%20SABS%2020MM-ZtklhgAUiEvqV4BUcfzLk392cAPCzL.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 300,
      is_featured: false
    },
    {
      name: "Conduit Saddle Spacer Bar 20mm",
      description: "White PVC saddle with spacer bar for mounting 20mm conduit to walls.",
      price: 6,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONDUIT%20SADDLE%20SPACER%20BAR%2020MM-iJCLEYSsY0vWeG1L0GUsP4AMFpps9u.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 250,
      is_featured: false
    },
    {
      name: "Conduit Inspection Bend 20mm PVC",
      description: "White PVC inspection bend for 20mm conduit. Allows access for cable pulling.",
      price: 12,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONDUIT%20INSPECTION%20BEND%2020MM%20PVC-raSa616HQ1iN2uEA2JoQmeWETdCgdt.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 150,
      is_featured: false
    },
    {
      name: "Conduit Inspection T Piece SABS 20mm",
      description: "White PVC SABS approved T-piece for 20mm conduit. Three-way junction with inspection access.",
      price: 15,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONDUIT%20INSPECTION%20T%20PIECE%20SABS%2020MM-d3gR9TsHIF0AOAl3UetHRWH9PL1guq.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 150,
      is_featured: false
    },
    // Electrical - Lighting
    {
      name: "Eurolux Floodlight + Glass 400W",
      description: "Heavy-duty 400W halogen floodlight with protective glass cover. Ideal for security and outdoor lighting.",
      price: 295,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EUROLUX%20FLOODLIGHT%20%2B%20GLASS%20400W-hBMcn0nw4bPPspJzvTlG8lLTQtBlRZ.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 25,
      is_featured: true,
      supplier: "Eurolux"
    },
    {
      name: "Eurolux Floodlight 500W + Sensor",
      description: "500W halogen floodlight with built-in motion sensor. Automatic security lighting for homes and businesses.",
      price: 395,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EUROLUX%20FLOODLIGHT%20500W%20%2B%20SENSOR-GvSIG4nJsV64lTMpGpmebzTIGk3Vm1.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 20,
      is_featured: true,
      supplier: "Eurolux"
    },
    // Gardening - Sprinklers
    {
      name: "Kaufmann Adjustable Brass Sprinkler 15mm",
      description: "Professional-grade brass impulse sprinkler head. Adjustable spray pattern for efficient lawn and garden watering.",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%20ADJUSTABLE%20BRASS%20SPRINKLER%2015MM-0in34VnqJ9rvSutsawNOXqebDHGZpd.jpg",
      category_id: categoryMap["Gardening Tools"],
      stock_quantity: 40,
      is_featured: true,
      supplier: "Kaufmann"
    },
    {
      name: "Kaufmann Impulse Sprinkler",
      description: "Plastic impulse sprinkler on stable round base. Adjustable coverage for lawns and gardens.",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%20IMPULSE%20SPRINKLER-ZaEu9EC9ZPfIOVWqX8m9oCYwQoX6a2.jpg",
      category_id: categoryMap["Gardening Tools"],
      stock_quantity: 50,
      is_featured: false,
      supplier: "Kaufmann"
    },
    {
      name: "Kaufmann 6pc Watering Set",
      description: "Complete garden watering kit with multi-pattern spray gun, stationary sprinkler, tap connector, and hose fittings.",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%206PC%20WATERING%20SET-sq0rVMXiizSo4dXuiGx4vEmFkwqHn9.jpg",
      category_id: categoryMap["Gardening Tools"],
      stock_quantity: 30,
      is_featured: true,
      supplier: "Kaufmann"
    },
    // Chemicals - Insecticides
    {
      name: "Doom Insect Spray Flying Xtreme 300ml",
      description: "Fast-acting insect spray for flying insects. Kills mosquitoes, flies, and other flying pests instantly.",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DOOM%20INSECT%20SPRAY%20FLYING%20XTREME%20300ML-PQp2dVm7AM71NClULOKggIdzrkVoJp.jpg",
      category_id: categoryMap["Chemicals & Fertilizers"],
      stock_quantity: 100,
      is_featured: false,
      supplier: "Doom"
    },
    {
      name: "Doom Insect Spray Super 300ml",
      description: "Multi-insect spray that kills flies, mosquitoes, cockroaches, and other crawling and flying insects.",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DOOM%20INSECT%20SPRAY%20SUPER%20300ML-bxydGQSB8Pk6iMpSv3ehAjeOOU1Z1Q.jpg",
      category_id: categoryMap["Chemicals & Fertilizers"],
      stock_quantity: 100,
      is_featured: false,
      supplier: "Doom"
    },
    {
      name: "Doom Rattex Deadly Powder 100g",
      description: "Effective rat and mouse poison powder. Fast-acting rodent control for homes and farms.",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DOOM%20RODENT%20PELLETS%20RATTEX%20100G-AH2IpepIywMqeL0cCty0QpyD2SihSz.jpg",
      category_id: categoryMap["Chemicals & Fertilizers"],
      stock_quantity: 80,
      is_featured: false,
      supplier: "Doom"
    },
    // Cleaning Supplies
    {
      name: "Jeyes Fluid 125ml",
      description: "The Strong One - powerful disinfectant and cleanser. Kills germs with fresh smell. Carbolic acid formula.",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/JEYES%20FLUID%20125ML-WvClJHfOzITujP1N6PL5eLQZ2c2Ocq.jpg",
      category_id: categoryMap["Home & Living"],
      stock_quantity: 100,
      is_featured: false,
      supplier: "Jeyes"
    },
    {
      name: "Revet Domestik Toilet Bowl Cleaner 750ml",
      description: "Powerful stain removal for toilets and showers. Effective bathroom cleaner with angled nozzle.",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/g6005025REVET%20CLEANER%20DOMESTIK%20TOILET%20BOWL%20750ML-k79GNMWrJuiHjD37KmCwKAJwfHmDdD.png",
      category_id: categoryMap["Home & Living"],
      stock_quantity: 80,
      is_featured: false,
      supplier: "Revet"
    },
    // Home & Living
    {
      name: "Lion Matches 10 Units of 10",
      description: "Pack of 10 boxes of Lion safety matches. 10 matches per box, 100 matches total.",
      price: 25,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LION%20MATCHES%2010%20UNITS%20OF%2010-UlNKB3FbbTb839EoYgxkNQxDkQShq2.jpg",
      category_id: categoryMap["Home & Living"],
      stock_quantity: 200,
      is_featured: false,
      supplier: "Lion"
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
    message: "Multi-category products seeded",
    count: results.filter(r => r.success).length,
    results
  })
}
