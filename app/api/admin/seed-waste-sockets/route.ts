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

  // Get or create Plumbing category
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Plumbing")
    .single()

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  const products = [
    // Vent Valves
    {
      name: "Waste Vent Valve 2-Way 50mm Econo SABS",
      description: "PVC 2-way vent valve 50mm for soil vent pipe. Prevents air lock and allows proper drainage. SABS approved. White.",
      price: 85,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20VENT%20VALVE%202WAY%2050MM%20ECONO%20SABS-gEKRqOMLL2xSNSLtNucVfPwaKamzE0.jpg",
      stock_quantity: 30,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Vent Valve 2-Way 110mm SABS",
      description: "PVC 2-way vent valve 110mm for soil vent pipe. Prevents air lock and ensures proper drainage. SABS approved. White.",
      price: 145,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20VENT%20VALVE%202WAY%20110MM%20SABS-WVMDIMkchfJtzyfjWz7bhMWHh0L8NC.jpg",
      stock_quantity: 25,
      supplier: "Flo-Tek",
    },
    // Sockets & Couplers
    {
      name: "Waste Socket Kimberley UG 110mm SABS",
      description: "PVC underground Kimberley socket coupler 110mm. Double socket with rubber seal rings for joining pipes. SABS approved. Beige.",
      price: 95,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20SOCKET%20KIMBERLEY%20UG%20110MM%20SABS-NqvhmX7mMn0gj4bONqAwaZeDky5Y4w.jpg",
      stock_quantity: 40,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Socket Kimberley SV 110mm SABS",
      description: "PVC soil vent Kimberley socket coupler 110mm. Double socket with rubber seal rings for joining pipes. SABS approved. White.",
      price: 85,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20SOCKET%20KIMBERLEY%20SV%20110MM%20SABS-ydNXxgb3TCIbAjYDC8qT9cxzc73aYJ.jpg",
      stock_quantity: 40,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Socket Double UG 110mm SABS",
      description: "PVC underground double socket coupler 110mm. For joining two pipes. SABS approved. Beige.",
      price: 75,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20SOCKET%20DOUBLE%20UG%20110MM%20SABS-cdGJckrbwORuTGpCm6TyGzwEbP4bpQ.jpg",
      stock_quantity: 45,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Socket SV Solvent Ring 110mm SABS",
      description: "PVC soil vent socket with solvent welding ring 110mm. For permanent pipe connections. SABS approved. White.",
      price: 55,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20SOCKET%20SV%20SOLVENT%20RING%20110MM%20SABS-j85NRelHuK4R6Z3F0GILNzPvcm76UV.jpg",
      stock_quantity: 50,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Socket UG Solvent Ring 110mm SABS",
      description: "PVC underground socket with solvent welding ring 110mm. For permanent pipe connections. SABS approved. Beige.",
      price: 65,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20SOCKET%20UG%20SOLVENT%20RING%20110MM%20SABS-HTZkcnjwGRt0Ds6Kig38fZDGXoQBas.jpg",
      stock_quantity: 45,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Socket Reducing SV 50x40mm SABS",
      description: "PVC soil vent reducing socket 50mm to 40mm. For connecting different pipe sizes. SABS approved. White.",
      price: 18,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20SOCKET%20REDUCING%20SV%2050X40MM%20SABS-pm4jeC7AH4cIDqpRihZYhYref5N0X4.jpg",
      stock_quantity: 60,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Socket SV 50mm SABS",
      description: "PVC soil vent socket coupler 50mm. Simple socket for joining pipes. SABS approved. White.",
      price: 12,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20SOCKET%20SV%2050MM%20SABS-J6vtLv99QzejwaQJD0XL5HpICEGkZN.jpg",
      stock_quantity: 80,
      supplier: "Flo-Tek",
    },
    // Junctions
    {
      name: "Waste Junction 87.5 Deg SV Plain 110mm SABS",
      description: "PVC soil vent T-junction 87.5 degree plain 110mm. Flo-Tek brand. For branch connections. SABS approved. White.",
      price: 95,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%2087.5DEG%20SV%20PL%20110MM%20SABS-moDYDKkGutn7pm9V1dmAKCIekSPuBo.jpg",
      stock_quantity: 30,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction Reducing 87.5 Deg SV I.E 110x50mm SABS",
      description: "PVC soil vent reducing T-junction 87.5 degree with inspection eye. 110mm main with 50mm branch. SABS approved. White.",
      price: 125,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%20RED%2087.5DEG%20SV%20I.E%20110X50MM%20SATAS-9kVkWPt9SwAmjS1hAKmcuCvVjjKWFW.jpg",
      stock_quantity: 25,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Junction Reducing 87.5 Deg SV Plain 110x50mm SABS",
      description: "PVC soil vent reducing T-junction 87.5 degree plain. 110mm main with 50mm branch. SABS approved. White.",
      price: 95,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20JUNCTION%20RED%2087.5DEG%20SV%20PL%20110X50MM%20SABS-F7GsgOZx5m8RPt1WDYYn2FlFLHBBCl.jpg",
      stock_quantity: 30,
      supplier: "Flo-Tek",
    },
    // Pan Connectors
    {
      name: "Waste Pan Connector Straight SV 110mm",
      description: "PVC toilet pan connector straight 110mm. Connects toilet to soil pipe. With rubber seal. White.",
      price: 65,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20PAN%20CONNECTOR%20STRAIGHT%20SV%20110MM-Lmj2h6kZPCpiQCzt3SE0ReVCQkBoau.jpg",
      stock_quantity: 35,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Pan Connector Bend SV I.E 110mm",
      description: "PVC toilet pan connector 90 degree bend 110mm with inspection eye. Connects toilet to soil pipe. White.",
      price: 125,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20PAN%20CONNECTOR%20BEND%20SV%20I.E%20110MM-6vPK93gIHQgdDOrUplTJHU2rwZVXUC.jpg",
      stock_quantity: 25,
      supplier: "Flo-Tek",
    },
    // Special Fittings
    {
      name: "Waste Rodding Eye 45 Deg UG 110mm SABS",
      description: "PVC underground rodding eye 45 degree 110mm. Access point for drain cleaning with removable cover. SABS approved. Beige.",
      price: 165,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20RODDING%20EYE%2045DEG%20UG%20110MM%20SABS-h7ik0rGBLwk5D2H5nGeg4bED8KaNbO.jpg",
      stock_quantity: 20,
      supplier: "Flo-Tek",
    },
    {
      name: "Waste Strap-On Boss SV 110x50mm",
      description: "PVC strap-on boss connector 110mm to 50mm. Clamps onto existing pipe to add branch connection. White.",
      price: 85,
      category_id: category.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WASTE%20STRAP-ON%20BOSS%20SV%20110X50MM-YGGH21A3dxhy9JI0eRrg3q4uEqAfvN.jpg",
      stock_quantity: 30,
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
