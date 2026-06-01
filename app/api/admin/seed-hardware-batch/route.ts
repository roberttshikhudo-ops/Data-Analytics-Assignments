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

  // Get category ID for Tools & Hardware
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Tools & Hardware")
    .single()

  const categoryId = category?.id

  const products = [
    {
      name: "Combination Pliers 6\" AIYI",
      description: "6 inch combination pliers with ergonomic yellow/black handles. Drop forged steel, hardened and tempered for durability.",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Combination%20pliers%206%20%28AIYI%29-q7Db2sQ8C8Brph9TrAvYHuu8uyhk9W.jpg",
      category_id: categoryId,
      stock_quantity: 50,
      supplier: "AIYI",
    },
    {
      name: "Combination Pliers 8\" KUKE",
      description: "8 inch heavy-duty combination pliers with comfortable yellow/black grip handles. Chrome vanadium steel construction.",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Combination%20Pliers%208%20%28KUKE%29-mrXgbM9pxvTtXeKxtVTayLOpwCmmgY.jpg",
      category_id: categoryId,
      stock_quantity: 50,
      supplier: "KUKE",
    },
    {
      name: "Black Electrical Tape 20m",
      description: "Black PVC electrical insulation tape, 20 meters. Flame retardant and suitable for electrical wiring applications.",
      price: 15,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20tape%2020m-xUqGNRjt5vXGLYcPqSNI65PRWRmIMv.jpg",
      category_id: categoryId,
      stock_quantity: 200,
      supplier: "Generic",
    },
    {
      name: "Clear Cellotape 50m",
      description: "Clear packing tape, 50 meters. Ideal for sealing boxes and general packaging needs.",
      price: 25,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cellotape%2050m-sJInP8YhQXEDCBlByhTLmucl9CK59R.jpg",
      category_id: categoryId,
      stock_quantity: 150,
      supplier: "Generic",
    },
    {
      name: "Clear Cellotape 200m",
      description: "Large clear packing tape roll, 200 meters. Heavy-duty adhesive for commercial packaging.",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cellotape%20200m-EA3Gv5BbnaPkU7uMshpMoM0tgIID8K.jpg",
      category_id: categoryId,
      stock_quantity: 100,
      supplier: "Generic",
    },
    {
      name: "Builder's Line Monofilament 100m",
      description: "Yellow builder's line, 100 meters. High-visibility monofilament for construction layout and leveling work.",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bilder%20liner%20_60%200.7mm%20x%20100m-Pv0jg49DrCc8KdFyCJ0AS0G0sOQDQL.jpg",
      category_id: categoryId,
      stock_quantity: 80,
      supplier: "Generic",
    },
    {
      name: "Afro Combs Set Assorted",
      description: "Set of colorful afro hair combs in assorted styles. Includes wide tooth, fine tooth, and pick combs.",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Afro%20Combs-uslMF6SGQiyzyZms99Eb1gwlkEdeiL.jpg",
      category_id: categoryId,
      stock_quantity: 100,
      supplier: "Generic",
    },
    {
      name: "AIYI Combination Spanner Set 8 Piece",
      description: "8 piece combination spanner set with sizes 6-22mm. Drop forged, hardened and tempered chrome vanadium steel with storage rack.",
      price: 195,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AiYI%208%20piece%20spanner%20set-78IlLZMAeYed0c2UFyaYENkNEZczYH.jpg",
      category_id: categoryId,
      stock_quantity: 30,
      supplier: "AIYI",
    },
    {
      name: "Blue Scissors Small",
      description: "Small scissors with blue plastic handles and stainless steel blades. Ideal for office, school or household use.",
      price: 25,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Blue%20Scissor%202-J8Bzr6c87J5ACCzmQFQF3leD8KyxDG.jpg",
      category_id: categoryId,
      stock_quantity: 100,
      supplier: "Generic",
    },
    {
      name: "AIYI Measuring Tape 50m Open Reel",
      description: "50 meter open reel measuring tape with blue/yellow housing. Features pointed tip for ground marking and fold-out handle.",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AiYI%20Measuring%20tape%2050m-phPZSs5GxW64qtfLdBeXXcbJfwmy6a.jpg",
      category_id: categoryId,
      stock_quantity: 40,
      supplier: "AIYI",
    },
    {
      name: "AIYI Measuring Tape 10m Retractable",
      description: "10 meter retractable measuring tape with yellow housing. 25mm wide blade with lock mechanism.",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20measuring%20tape%2010m%20AIYI-DmUpqayYoZBh31wBU07rG2TXELSUNH.jpg",
      category_id: categoryId,
      stock_quantity: 60,
      supplier: "AIYI",
    },
    {
      name: "Bathroom Ceiling Light Dome White",
      description: "White frosted glass dome ceiling light for bathrooms. Flush mount design, suitable for humid environments.",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bathroom%20lights-IWBf1AEZ1sv1FZkzvT7MWydUWXxeOb.jpg",
      category_id: categoryId,
      stock_quantity: 30,
      supplier: "Generic",
    },
    {
      name: "Andor Diamond Disc Segmented 125mm",
      description: "125mm segmented diamond cutting disc for wet or dry cutting. Universal fit for angle grinders, ideal for concrete, brick and stone.",
      price: 125,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Andor%20diamond%20%20disc%20segmented%20ss%20125%20x%202.7mm-HuPOcoc1o4PudqxqOXRKUqaP2JBYjA.jpg",
      category_id: categoryId,
      stock_quantity: 50,
      supplier: "Andor",
    },
    {
      name: "Viro Yellow Padlock 50mm",
      description: "50mm laminated steel padlock with yellow weatherproof cover. Comes with 2 brass keys. Ideal for outdoor use.",
      price: 95,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Auto%20yellow%20lockset%2050mm-nOtxjK0XD88LUgndQl4HTCHqS1p1kc.jpg",
      category_id: categoryId,
      stock_quantity: 40,
      supplier: "Viro",
    },
    {
      name: "AIYI Stainless Steel Door Hinges 4\"",
      description: "4 inch stainless steel door hinges. Heavy-duty construction for interior or exterior doors. Sold per piece.",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AIYI%20Stainless%20steel%20hinges%204-BL0iz13j0LTUpAq8yTyOoCcJHmIt6t.jpg",
      category_id: categoryId,
      stock_quantity: 100,
      supplier: "AIYI",
    },
    {
      name: "AIYI Gas Regulator LPG Grey",
      description: "LPG gas regulator for domestic gas cylinders. Grey finish with brass fittings and hose barb outlet.",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AIYI%20Gas%20regulator%20gray-AHd2fbFENbeeOox50ljAtbNfSq96UW.jpg",
      category_id: categoryId,
      stock_quantity: 50,
      supplier: "AIYI",
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

  return NextResponse.json({
    success: true,
    message: `Added ${data.length} hardware products`,
    products: data,
  })
}
