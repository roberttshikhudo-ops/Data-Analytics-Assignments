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

  const products = [
    // 110mm White Junctions
    {
      name: "Waste Junction 87.5 Deg SV I.E 110mm SABS",
      description: "PVC waste junction 87.5 degree with inspection eye, 110mm soil vent, white, SABS approved",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2087.5DEG%20SV%20I.E%20110MM-cPyMiyBS7AxvxYFR4YTQEM07nmx13h.jpg",
      stock_quantity: 30,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction 45 Deg SV I.E 110mm SABS",
      description: "PVC waste junction 45 degree with inspection eye, 110mm soil vent, white, SABS approved",
      price: 125,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2045DEG%20SV%20I.E%20110MM%20SABS-uJGgR9LLcusWzR264pPQ4wyziSrESX.jpg",
      stock_quantity: 35,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction 45 Deg SV Plain 110mm SABS",
      description: "PVC waste junction 45 degree plain, 110mm soil vent, white, SABS approved",
      price: 95,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2045DEG%20SV%20PL%20110MM%20SABS-5Ts6PqL8uC7sIjQwVZnz5ZKB6a1MBp.jpg",
      stock_quantity: 40,
      supplier: "Flo-Tek",
    },
    // 50mm White Junctions
    {
      name: "Waste Junction 87.5 Deg SV I.E 50mm SABS",
      description: "PVC waste junction 87.5 degree with inspection eye, 50mm soil vent, white, SABS approved",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2087.5DEG%20SV%20I.E%2050MM%20SABS-n0oZtRpAABfYONSxkOZgN96pl6cxxF.jpg",
      stock_quantity: 45,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction 45 Deg SV I.E 50mm SABS",
      description: "PVC waste junction 45 degree with inspection eye, 50mm soil vent, white, SABS approved",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2045DEG%20SV%20I.E%2050MM%20SABS-PmWzW6tz4HKHbYqBqUgIM2TRTUkZHw.jpg",
      stock_quantity: 50,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction 87.5 Deg SV Plain 50mm SABS",
      description: "PVC waste junction 87.5 degree plain T-junction, 50mm soil vent, white, SABS approved",
      price: 38,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2087.5DEG%20SV%20PL%2050MM%20SABS-nqikZsNSIi6cF9YGrjl9pRcX4pNadM.jpg",
      stock_quantity: 60,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction 45 Deg SV Plain 50mm SABS",
      description: "PVC waste junction 45 degree plain Y-junction, 50mm soil vent, white, SABS approved",
      price: 32,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2045DEG%20SV%20PL%2050MM%20SABS-WgNdiN6aYcMwa1V2zjrxvAxNYQQskg.jpg",
      stock_quantity: 65,
      supplier: "Flo-Tek",
    },
    // 110mm Underground Beige
    {
      name: "Waste Junction 45 Deg UG Plain 110mm SABS",
      description: "PVC waste junction 45 degree plain, 110mm underground, beige, SABS approved",
      price: 115,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2045DEG%20UG%20PL%20110MM%20SABS-0OUPsw0LWmTqN1sn3VN31JWZD6F6UE.jpg",
      stock_quantity: 25,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction 45 Deg UG I.E Right Hand 110mm SABS",
      description: "PVC waste junction 45 degree with inspection eye, right hand, 110mm underground, beige, SABS approved",
      price: 165,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2045DEG%20UG%20I.E%20RH%20110MM%20SABS-UHFQ0COU52l98quep60pxFeVxhcldX.jpg",
      stock_quantity: 20,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction 45 Deg UG I.E Left Hand 110mm SABS",
      description: "PVC waste junction 45 degree with inspection eye, left hand, 110mm underground, beige, SABS approved",
      price: 165,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2045DEG%20UG%20I.E%20LH%20110MM%20SABS-PL2OQtraXMGFyYPuy9KXSjYAMOCXX4.jpg",
      stock_quantity: 20,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction 45 Deg UG I.E Universal 110mm SABS",
      description: "PVC waste junction 45 degree with inspection eye, universal, 110mm underground, beige, SABS approved",
      price: 155,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2045DEG%20UG%20IE%20UNIV%20110MM%20SABS-craG1BmkR2fsi6Dy3b3IQAqESewW46.jpg",
      stock_quantity: 25,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste End Cap Female UG 110mm SABS",
      description: "PVC waste end cap female, 110mm underground, beige, SABS approved",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20END%20CAP%20FEMALE%20UG%20110MM%20SABS-helPn1ADfixEQ8cdjEBfBIAokdkrQs.jpg",
      stock_quantity: 50,
      supplier: "Flo-Tek",
    },
    // Gulleys
    {
      name: "Waste Gulley Round Complete UG 110mm SABS",
      description: "PVC waste gulley round complete with white grate, 110mm underground, beige, SABS approved",
      price: 125,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20GULLEY%20ROUND%20COMPLETE%20UG%20110MM%20SABS-NagPOOFzoDG6T7TacUxtZTORyciLb3.jpg",
      stock_quantity: 30,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Gulley P Trap UG 110mm SABS",
      description: "PVC waste gulley P-trap, 110mm underground, beige, SABS approved for floor drainage",
      price: 185,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20GULLEY%20P%20TRAP%20UG%20110MM%20SABS-CSkpMSF1Kim2LKhctTEUU5OGIHzuP1.jpg",
      stock_quantity: 25,
      supplier: "Flo-Tek",
    },
    // Pipe Holders
    {
      name: "Waste Pipe Holder Batt Aluminium 50mm",
      description: "Aluminium pipe holder bracket with masonry nail for 50mm waste pipes",
      price: 18,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20HOLDER%20BATT%20ALUMINIUM%2050MM-sjb70lPOgLMC2bFrI9kV9OhUbmtVcN.jpg",
      stock_quantity: 100,
      supplier: "Generic",
    },
    {
      name: "Waste Pipe Holder Batt Aluminium 110mm",
      description: "Aluminium pipe holder bracket with masonry nail for 110mm waste pipes",
      price: 28,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20HOLDER%20BATT%20ALUMINIUM%20110MM-iCjfWkTSRRIMxSGUIeRmv8PMO5yzUY.jpg",
      stock_quantity: 80,
      supplier: "Generic",
    },
  ]

  // Get category ID for Plumbing
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "plumbing")
    .single()

  const categoryId = category?.id

  const productsWithSlugs = products.map((p) => ({
    ...p,
    slug: generateSlug(p.name),
    category_id: categoryId,
  }))

  const { data, error } = await supabase.from("products").insert(productsWithSlugs).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: data.length, products: data })
}
