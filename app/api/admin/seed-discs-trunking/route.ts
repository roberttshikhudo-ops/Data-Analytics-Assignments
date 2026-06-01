import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get("key")

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

  const getCategoryId = (name: string) => {
    const cat = categories?.find((c) =>
      c.name.toLowerCase().includes(name.toLowerCase())
    )
    return cat?.id
  }

  const toolsId = getCategoryId("tools") || getCategoryId("hardware")
  const electricalId = getCategoryId("electrical")
  const homeId = getCategoryId("home")

  const products = [
    // Superflex Cutting Discs
    {
      name: "Superflex Cutting Disc Flat Steel 230x3mm",
      price: 35,
      category_id: toolsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20CUTTING%20DISC%20FLAT%20STEEL%20230X3MM-o7Hc78RhXtHrhDc2zIJv2aUjZIR0Wx.jpg",
      supplier: "Superflex",
    },
    {
      name: "Superflex Cutting Disc Flat Steel 115x3mm",
      price: 18,
      category_id: toolsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20CUTTING%20DISC%20FLAT%20STEEL%20115X3MM-eX8rQOx0PApS9uWthr2lQ1y53eB36j.jpg",
      supplier: "Superflex",
    },
    // Superflex Flap Discs Industrial
    {
      name: "Superflex Flap Disc Industrial 115mm 40G",
      price: 45,
      category_id: toolsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20FLAP%20DISC%20INDUSTRIAL%20115MM%2040G-ftKMlf0nOQIcZDh7MQXYCOh8b6ekRX.jpg",
      supplier: "Superflex",
    },
    {
      name: "Superflex Flap Disc Industrial 115mm 60G",
      price: 45,
      category_id: toolsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20FLAP%20DISC%20INDUSTRIAL%20115MM%2060G-tZ3Qo46rEk7tHN2cbIkPFXF9UfH8q9.jpg",
      supplier: "Superflex",
    },
    {
      name: "Superflex Flap Disc Industrial 115mm 80G",
      price: 45,
      category_id: toolsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20FLAP%20DISC%20INDUSTRIAL%20115MM%2080G-lX1kWmEB33FluwUZQ4wPdK1hpV3LdP.jpg",
      supplier: "Superflex",
    },
    // Superflex Flap Discs Evolution
    {
      name: "Superflex Flap Disc Evolution 115mm AZ40",
      price: 55,
      category_id: toolsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20FLAP%20DISC%20EVOLUTION%20115MM%20AZ40-E46qFwzSQ8HBZpspWnViUiNhhKRuHV.jpg",
      supplier: "Superflex",
    },
    {
      name: "Superflex Flap Disc Evolution 115mm AZ60",
      price: 55,
      category_id: toolsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20FLAP%20DISC%20EVOLUTION%20115MM%20AZ60-w5AauRipFcxP8vMTxyWzPncXl9E5mI.jpg",
      supplier: "Superflex",
    },
    {
      name: "Superflex Flap Disc Evolution 115mm AZ80",
      price: 55,
      category_id: toolsId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SUPERFLEX%20FLAP%20DISC%20EVOLUTION%20115MM%20AZ80-jwWQpXPYeAJ2RaUwZ9IMauWP37zt8G.jpg",
      supplier: "Superflex",
    },
    // Trunking
    {
      name: "Trunking 100x40 3M NBT 4",
      price: 85,
      category_id: electricalId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRUNKING%20100X40%203MT%20NBT%204-O4GFlM0wf3nfHLOumgM6c9W7JAZ48m.jpg",
      supplier: null,
    },
    {
      name: "Trunking 40x40 3M YT 5",
      price: 55,
      category_id: electricalId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRUNKING%2040X40%203MT%20YT%205-8T0nJwvwxiVuwMub897oHjpune9ktB.jpg",
      supplier: null,
    },
    {
      name: "Trunking 25x40 3M YT 4",
      price: 45,
      category_id: electricalId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRUNKING%2025X40%203MT%20YT%204-AY9UbJnPlwxzAuNUy7zlJjebCNwMwP.jpg",
      supplier: null,
    },
    {
      name: "Trunking 16x40 3M YT 3",
      price: 35,
      category_id: electricalId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRUNKING%2016X40%203MT%20YT%203-3uKiCU2nUuXMMFsWtq6qBrN9p0Atne.jpg",
      supplier: null,
    },
    {
      name: "Trunking 16x25 3M YT 2",
      price: 28,
      category_id: electricalId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRUNKING%2016X25%203MT%20YT%202-MwtNkdeAyXBEkIfnNvGvO5w0l0MWEf.jpg",
      supplier: null,
    },
    // Tuffy Foil
    {
      name: "Tuffy Foil Heavy 440mm x 20M",
      price: 65,
      category_id: homeId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TUFFY%20FOIL%20HEAVY%20440MM%20x%2020M-3CfQW83dtqAbcKRGgdiHkWJM8yyN4f.jpg",
      supplier: "Tuffy",
    },
    {
      name: "Tuffy Foil Light 300mm x 20M",
      price: 45,
      category_id: homeId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TUFFY%20FOIL%20LIGHT%20300MM%20x%2020M-TThkX84Cuy0IQkyeK13zUVpbE4lmun.jpg",
      supplier: "Tuffy",
    },
    {
      name: "Tuffy Foil Light 5M",
      price: 25,
      category_id: homeId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TUFFY%20FOIL%20LIGHT%205M-iMYIGaZjrpMpeevQVOdAeaXiByHxq1.jpg",
      supplier: "Tuffy",
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
    message: "Discs and trunking products seeded",
    results,
  })
}
