import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get or create Electrical category
  let { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Electrical")
    .single()

  if (!category) {
    // Create the category if it doesn't exist
    const { data: newCategory, error: catError } = await supabase
      .from("categories")
      .insert({
        name: "Electrical",
        slug: "electrical",
        description: "Electrical supplies including cables, circuit breakers, bulbs, and accessories",
        is_active: true,
      })
      .select()
      .single()

    if (catError) {
      return NextResponse.json({ error: "Failed to create category: " + catError.message }, { status: 500 })
    }
    category = newCategory
  }

  const products = [
    // Circuit Breakers
    {
      name: "CBI Circuit Breaker 10A Single Pole",
      description: "CBI 10A single pole circuit breaker with energy rating label. 240V 50Hz, 3kA breaking capacity. DIN rail mount. SABS approved.",
      price: 85,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Circuit%20breaker%2010A-amEKfVEbgnM2E34bkFIV6kNLTHlI1Q.jpg",
      stock_quantity: 50,
      supplier: "CBI",
    },
    {
      name: "CBI Earth Leakage 63A Double Pole",
      description: "CBI 63A earth leakage circuit breaker (ELCB/RCD). 30mA sensitivity, 240V 50Hz, 3kA. Double pole with green toggle switches. SABS approved.",
      price: 495,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Earth%20leakage-wLOR7VH0K5R6M6Z0zyCLGOvs4Lwabu.jpg",
      stock_quantity: 25,
      supplier: "CBI",
    },
    // LED Bulbs - Standard
    {
      name: "Ausma LED Bulb 7W B22 Daylight",
      description: "Ausma 7W LED light bulb with B22 bayonet cap. 6500K daylight, energy efficient. Long life span up to 25,000 hours.",
      price: 35,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ausma%20LED%207Watts-6IBxq53KpfooWzEqOGyasG4qRMmEnT.jpg",
      stock_quantity: 100,
      supplier: "Ausma",
    },
    {
      name: "Ausma LED Bulb 9W E27 Daylight",
      description: "Ausma 9W LED light bulb with E27 screw cap. 6500K daylight, 850 lumens. Energy efficient replacement for 60W incandescent.",
      price: 45,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ausma%20LED%209W-rpv4ASP3CMLJ6NaIX6IBAp9sAwspjE.jpg",
      stock_quantity: 100,
      supplier: "Ausma",
    },
    {
      name: "Redisson LED Bulb 9W E27 Screw",
      description: "Redisson 9W LED bulb with E27 screw cap. Energy class A rating, 25,000 hour lifespan. 2 year warranty. Cool white light.",
      price: 55,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Redisson%20bulb%20screw-u3R5mOdwbW7wimNSTPF8SyHchUtPQc.jpg",
      stock_quantity: 80,
      supplier: "Redisson",
    },
    // LED Bulbs - Emergency/Rechargeable
    {
      name: "Ausma Emergency LED Bulb 7W Rechargeable",
      description: "Ausma 7W emergency LED bulb with built-in battery. Works during load shedding. 4-6 hours backup time. Available in E27 and B22. 650 lumens, 18 month warranty.",
      price: 95,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ausma%207Watts%20rechargeble-54j949ajtR9YXF2lGnL3jdzdTlKxet.jpg",
      stock_quantity: 60,
      supplier: "Ausma",
    },
    {
      name: "Ausma Emergency LED Bulb 9W B22 Rechargeable",
      description: "Ausma 9W emergency LED bulb B22 bayonet with built-in battery. 850 lumens, 6500K daylight. 4-6 hours backup during power outages. 18 month warranty.",
      price: 115,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ausma%209Watts%20rechargeble-K4hzLmN4rfjhYtukm1jRandttfNvuQ.jpg",
      stock_quantity: 50,
      supplier: "Ausma",
    },
    // Downlights
    {
      name: "GU10 LED Downlight Bulb 5W",
      description: "GU10 LED spotlight bulb 5W. Cool white light, ideal for recessed downlights. Energy efficient replacement for halogen spots.",
      price: 45,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Down%20lights%20bulbs-QHKbUSxj9BfdpS9jLvnNHygHhQq8zb.jpg",
      stock_quantity: 80,
      supplier: "Generic",
    },
    {
      name: "GU10 Downlight Holder Ceramic",
      description: "GU10 ceramic lamp holder with cable leads. Heat resistant ceramic construction for downlight installations. Easy wire connection.",
      price: 18,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Downlight%20holder-Nrt85nu6D4BDfkAcaO4Pb0bfgIyTtr.jpg",
      stock_quantity: 100,
      supplier: "Generic",
    },
    // Electrical Cables
    {
      name: "Electrical Cable 2.5mm Twin & Earth White SABS",
      description: "2.5mm twin and earth electrical cable, white sheathed. SABS approved for domestic wiring. Sold per 100m roll.",
      price: 1450,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Electrical%20cable%202.5mm%20SABS%20approved-Q7MF0JycPghqoLq5NqbgHqUWkYxGos.jpg",
      stock_quantity: 20,
      supplier: "Generic",
    },
    {
      name: "Electrical Cable GP 2.5mm Black 100m",
      description: "General purpose 2.5mm single core electrical cable, black. 100 meter roll. For house wiring and electrical installations.",
      price: 650,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Electrical%20cLable%20GP%202.5M%20X%20100M-ibEJCw4vHwc6OYOscqT2YuUGB01QB7.jpg",
      stock_quantity: 25,
      supplier: "Generic",
    },
    {
      name: "Electrical Cable GP 2.5mm Grey SANS 1507 100m",
      description: "2x1.5+1x1mm grey flat twin and earth cable. SANS 1507 approved. 300/500V rating. 100 meter roll for domestic installations.",
      price: 1250,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Electrical%20cable%20gp%202.5mm%20grey-PCwqpKkl69SqKYO3XFLzDYGz78jsFT.jpg",
      stock_quantity: 20,
      supplier: "Generic",
    },
    {
      name: "Electrical Cable GP 2.5mm Red 100m",
      description: "General purpose 2.5mm single core electrical cable, red (live wire). 100 meter roll for house wiring installations.",
      price: 650,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Red%20electrical%20cable%20gp2.5mm-fYe9HMkugeJwv3hFYnPOFMxMyNvaXj.jpg",
      stock_quantity: 25,
      supplier: "Generic",
    },
    // Sockets & Accessories
    {
      name: "Double Switched Socket Outlet 16A",
      description: "White double switched socket outlet with individual switches. 16A rating for standard South African 3-pin plugs. Surface or flush mount.",
      price: 85,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Double%20plug-yaQ9wmX5sMBfCvQfY56NkjScLUrRif.jpg",
      stock_quantity: 50,
      supplier: "Generic",
    },
    {
      name: "Conduit Female Adaptor 20mm SABS",
      description: "20mm PVC conduit female adaptor. SABS approved. Connects conduit to junction boxes and fittings. White finish.",
      price: 8,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Conduit%20adaptor%20female%2020mm%20SABS-KzT4PvpuawtH2GL1kOvNne6aG1vK4b.jpg",
      stock_quantity: 200,
      supplier: "Generic",
    },
  ]

  const productsWithSlugs = products.map((p) => ({
    ...p,
    slug: generateSlug(p.name),
  }))

  const { data, error } = await supabase.from("products").insert(productsWithSlugs).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: data.length, products: data })
}
