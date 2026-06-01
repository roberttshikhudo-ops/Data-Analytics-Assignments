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

  // Get Plumbing category
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Plumbing")
    .single()

  const categoryId = category?.id

  const products = [
    // Underground Bends (Beige)
    {
      name: "Waste Bend 22.5 Deg UG 110mm SABS",
      description: "PVC underground waste bend 22.5 degree 110mm diameter. SABS approved for sewer drainage systems.",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2022.5DEG%20UG%20110MM-CNLsU6p0dE9HqV27VVRgKPiVr0x39o.jpg",
      category_id: categoryId,
      stock_quantity: 50,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Bend 45 Deg UG 110mm SABS",
      description: "PVC underground waste bend 45 degree 110mm diameter. SABS approved for sewer drainage systems.",
      price: 95,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2045DEG%20UG%20110MM%20SABS-QYLhgx1tNGEjSvcZEgkrauMZjPMyqr.jpg",
      category_id: categoryId,
      stock_quantity: 50,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Bend 90 Deg UG 110mm SABS",
      description: "PVC underground waste bend 90 degree 110mm diameter. Ribbed flexible design. SABS approved.",
      price: 125,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2090DEG%20UG%20110MM%20SABS-X8knvrT0B6rZi9BSTtPPFm7U53lOZd.jpg",
      category_id: categoryId,
      stock_quantity: 40,
      supplier: "Flo-Tek",
    },
    // 50mm Plain Bends (White)
    {
      name: "Waste Bend 45 Deg SV Plain 50mm SABS",
      description: "PVC soil vent waste bend 45 degree 50mm plain ends. SABS approved for above ground drainage.",
      price: 25,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2045DEG%20SV%20PL%2050MM%20SABS-TfKujHBrlN3z5zP3F6opEqxl90p9PX.jpg",
      category_id: categoryId,
      stock_quantity: 100,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Bend 87.5 Deg SV Plain 50mm SABS",
      description: "PVC soil vent waste bend 87.5 degree 50mm plain ends. SABS approved for above ground drainage.",
      price: 28,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2087.5DEG%20SV%20PL%2050MM%20SABS-MiwCUQHtBNnWrNE3AX49Ai6B4l31gw.jpg",
      category_id: categoryId,
      stock_quantity: 100,
      supplier: "Flo-Tek",
    },
    // 110mm Plain Bends (White)
    {
      name: "Waste Bend 45 Deg SV Plain 110mm SABS",
      description: "PVC soil vent waste bend 45 degree 110mm plain ends. SABS approved for above ground drainage.",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2045DEG%20SV%20PL%20110MM%20SABS-Nc8juEZHtD8dSBeopF87AIJ7AWQkqY.jpg",
      category_id: categoryId,
      stock_quantity: 60,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Bend 87.5 Deg SV Plain 110mm SABS",
      description: "PVC soil vent waste bend 87.5 degree 110mm plain ends. SABS approved for above ground drainage.",
      price: 75,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2087.5DEG%20SV%20PL%20110MM-0PqSK2DEHnUHnIB8LuqgXcfmJE6dP3.jpg",
      category_id: categoryId,
      stock_quantity: 60,
      supplier: "Flo-Tek",
    },
    // 50mm Inspection Eye Bends
    {
      name: "Waste Bend 45 Deg SV I.E 50mm SABS",
      description: "PVC soil vent waste bend 45 degree 50mm with inspection eye access point. SABS approved.",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2045DEG%20SV%20I.E%2050MM%20SABS-Hfg4TmfTKDKO8ApIICQTeXr0mTXiFb.jpg",
      category_id: categoryId,
      stock_quantity: 60,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Bend 87.5 Deg SV I.E 50mm SABS",
      description: "PVC soil vent waste bend 87.5 degree 50mm with inspection eye access point. SABS approved.",
      price: 48,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2087.5DEG%20SV%20I.E%2050MM%20SABS-u8jGy0qNDnXwoayiL4KZg9CCKm09xI.jpg",
      category_id: categoryId,
      stock_quantity: 60,
      supplier: "Flo-Tek",
    },
    // 110mm Inspection Eye Bends
    {
      name: "Waste Bend 45 Deg SV I.E 110mm SABS",
      description: "PVC soil vent waste bend 45 degree 110mm with inspection eye access point. SABS approved.",
      price: 95,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2045DEG%20SV%20I.E%20110MM%20SABS-i6BzL9lwXAQC16ow9Vhfto4SKPUweX.jpg",
      category_id: categoryId,
      stock_quantity: 40,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Bend 87.5 Deg SV I.E 110mm SABS",
      description: "PVC soil vent waste bend 87.5 degree 110mm with inspection eye access point. SABS approved.",
      price: 105,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%2087.5DEG%20SV%20I.E%20110MM-qCJA9qaBfOML1gILiG0N1q04gqYtpA.jpg",
      category_id: categoryId,
      stock_quantity: 40,
      supplier: "Flo-Tek",
    },
    // Special Fittings
    {
      name: "Waste Bend Vent Horn 87.5 Deg 110mm SABS",
      description: "PVC vent horn bend 87.5 degree 110mm with 50mm vent outlet and inspection eye. SABS approved.",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20BEND%20VENT%20HORN%2087.5DEG%20SV%20I.E%20110MM%20SABS-DYH8me30xfZSNfRlRNoLnbZrkQtClv.jpg",
      category_id: categoryId,
      stock_quantity: 30,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Eccentric Reducer SV 110x50mm SABS",
      description: "PVC eccentric reducing coupling 110mm to 50mm. Offset design for drainage slope. SABS approved.",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20ECSENTRIC%20REDUCING%20SV%20110X50MM-8ftPlSxuJJAJXEdA6ylSnuevrDyTVP.jpg",
      category_id: categoryId,
      stock_quantity: 50,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Adaptor Male SV 50mm x 1-1/2 SABS",
      description: "PVC male threaded adaptor 50mm socket to 1-1/2 inch BSP thread. SABS approved.",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20ADAPTOR%20MALE%20SV%2050X1-1%202%20SABS-EtfqL2C6xojTdNSEx8W8JM8BsiPiU1.jpg",
      category_id: categoryId,
      stock_quantity: 80,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Adaptor Female SV 50mm x 1-1/2 SABS",
      description: "PVC female threaded adaptor 50mm socket to 1-1/2 inch BSP thread. SABS approved.",
      price: 38,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20ADAPTOR%20FEMALE%20SV%2050X1-1%202%20SABS-sKvlyw5bkmzSS27TMoV57kpFBW4SjK.jpg",
      category_id: categoryId,
      stock_quantity: 80,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste End Cap Female SV 50mm SABS",
      description: "PVC end cap 50mm female socket fitting. For capping unused drainage outlets. SABS approved.",
      price: 18,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20END%20CAP%20FEMALE%20SV%2050MM%20SABS-XteW8Zso9r0wzn1mlawJpEWpVYc4pQ.jpg",
      category_id: categoryId,
      stock_quantity: 100,
      supplier: "Flo-Tek",
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
