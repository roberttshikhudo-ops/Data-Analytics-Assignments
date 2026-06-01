import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get Plumbing category ID
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .in("name", ["Plumbing"])

  const categoryMap = new Map(categories?.map((c) => [c.name, c.id]) || [])
  const plumbingId = categoryMap.get("Plumbing")

  const products = [
    // PVC Waste Pipes - Soil Vent
    {
      name: "Waste Pipe SV 40mm x 6m",
      slug: "waste-pipe-sv-40mm-6m",
      description: "PVC soil vent waste pipe 40mm diameter, 6 meter length. SABS approved for residential and commercial plumbing installations.",
      price: 85,
      category_id: plumbingId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20PIPE%20SV%2040MMX6M%20NEW%20SPEC-BrIORm0IwX86Ki7dEiXVLk0ajbxCaD.jpg",
      supplier: null,
    },
    {
      name: "Waste Pipe SV 50mm x 6m",
      slug: "waste-pipe-sv-50mm-6m",
      description: "PVC soil vent waste pipe 50mm diameter, 6 meter length. SABS approved for residential and commercial plumbing installations.",
      price: 95,
      category_id: plumbingId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9905018WASTE%20PIPE%20SV%2050MMX6M%20NEW%20SPEC-jlxCreFOGTjf362yMEsbJtCFJxOtHr.jpg",
      supplier: null,
    },
    {
      name: "Waste Pipe SV 110mm x 6m",
      slug: "waste-pipe-sv-110mm-6m",
      description: "PVC soil vent waste pipe 110mm diameter, 6 meter length. SABS approved for main drainage and sewer connections.",
      price: 195,
      category_id: plumbingId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20PIPE%20SV%20110MMX6M%20NEW%20SPEC-l4Pwz6kUc7GYTwOkfhs9MPjDd6M9JS.jpg",
      supplier: null,
    },
    // Underground Drainage Pipe
    {
      name: "Waste Pipe UG 110mm x 6m Plain Ended SABS",
      slug: "waste-pipe-ug-110mm-6m-plain-ended-sabs",
      description: "PVC underground drainage pipe 110mm diameter, 6 meter length. Plain ended, SABS approved for underground sewage systems.",
      price: 245,
      category_id: plumbingId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20PIPE%20UG%20110MMX6M%20PLAIN%20ENDED%20SABS-5bID8raqbqdzLQH6URuP5V5L0EZWdA.jpg",
      supplier: null,
    },
    // Polycop Flexible Pipes
    {
      name: "Polycop Pipe 15mm x 100m Roll",
      slug: "polycop-pipe-15mm-100m-roll",
      description: "Flexible polyethylene water pipe 15mm diameter, 100 meter roll. Ideal for hot and cold water reticulation systems.",
      price: 895,
      category_id: plumbingId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PIPE%20POLYCOP%2015MMX100M%20PER%20ROLL-vUxSwsuH5dqzrPmQn9dX5xpIPJGoPW.jpg",
      supplier: "Polycop",
    },
    {
      name: "Polycop Pipe 22mm x 100m Roll",
      slug: "polycop-pipe-22mm-100m-roll",
      description: "Flexible polyethylene water pipe 22mm diameter, 100 meter roll. Ideal for hot and cold water reticulation systems.",
      price: 1295,
      category_id: plumbingId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PIPE%20POLYCOP%2022MMX100M%20PER%20ROLL-BflDOuLoXBHL4zKssHseTJakzy7j51.jpg",
      supplier: "Polycop",
    },
  ]

  const results = []
  for (const product of products) {
    const { data, error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "slug" })
      .select()

    if (error) {
      results.push({ name: product.name, error: error.message })
    } else {
      results.push({ name: product.name, success: true })
    }
  }

  return NextResponse.json({
    message: "Plumbing pipes seeded",
    results,
  })
}
