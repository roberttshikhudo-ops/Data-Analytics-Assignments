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
  const { data: ppeCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "PPE & Safety")
    .single()

  let plumbingCategoryId: string
  const { data: existingPlumbing } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Plumbing")
    .single()

  if (existingPlumbing) {
    plumbingCategoryId = existingPlumbing.id
  } else {
    const { data: newPlumbing } = await supabase
      .from("categories")
      .insert({ name: "Plumbing", slug: "plumbing" })
      .select("id")
      .single()
    plumbingCategoryId = newPlumbing!.id
  }

  const { data: hardwareCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Tools & Hardware")
    .single()

  const products = [
    // PPE - Blue Overalls (6 sizes)
    {
      name: "Overall Blue Budget 2 Pce Size 32 Chest 28 Waist",
      description: "Budget 2-piece blue overall set. Size 32 chest, 28 waist. Durable workwear for industrial and general use.",
      price: 185,
      category_id: ppeCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OVERALL%20BLUE%20BUDGET%202%20PCE%20SIZE%2032%20CHEST%2028%20WAIST-uUHO8wtdZgAf9tRa9f5UPMaOvZtxsn.jpg",
      stock_quantity: 15,
      is_active: true
    },
    {
      name: "Overall Blue Budget 2 Pce Size 34 Chest 30 Waist",
      description: "Budget 2-piece blue overall set. Size 34 chest, 30 waist. Durable workwear for industrial and general use.",
      price: 185,
      category_id: ppeCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OVERALL%20BLUE%20BUDGET%202%20PCE%20SIZE%2034%20CHEST%2030%20WAIST-qw7ueLRSjluyJEHlvbESkXxwchHosU.jpg",
      stock_quantity: 15,
      is_active: true
    },
    {
      name: "Overall Blue Budget 2 Pce Size 36 Chest 32 Waist",
      description: "Budget 2-piece blue overall set. Size 36 chest, 32 waist. Durable workwear for industrial and general use.",
      price: 185,
      category_id: ppeCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OVERALL%20BLUE%20BUDGET%202%20PCE%20SIZE%2036%20CHEST%2032%20WAIST-V1M1YWyXRomfByeCt0Q5J5tJgn05n2.jpg",
      stock_quantity: 15,
      is_active: true
    },
    {
      name: "Overall Blue Budget 2 Pce Size 38 Chest 34 Waist",
      description: "Budget 2-piece blue overall set. Size 38 chest, 34 waist. Durable workwear for industrial and general use.",
      price: 195,
      category_id: ppeCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OVERALL%20BLUE%20BUDGET%202%20PCE%20SIZE%2038%20CHEST%2034%20WAIST-ofqI7cXwgviMtBmlWmxI2N2bJ0Oasr.jpg",
      stock_quantity: 15,
      is_active: true
    },
    {
      name: "Overall Blue Budget 2 Pce Size 40 Chest 36 Waist",
      description: "Budget 2-piece blue overall set. Size 40 chest, 36 waist. Durable workwear for industrial and general use.",
      price: 195,
      category_id: ppeCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OVERALL%20BLUE%20BUDGET%202%20PCE%20SIZE%2040%20CHEST%2036%20WAIST-dP5LWxep1sBB2CPd1MsvawjljKS8V1.jpg",
      stock_quantity: 15,
      is_active: true
    },
    {
      name: "Overall Blue Budget 2 Pce Size 42 Chest 38 Waist",
      description: "Budget 2-piece blue overall set. Size 42 chest, 38 waist. Durable workwear for industrial and general use.",
      price: 205,
      category_id: ppeCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OVERALL%20BLUE%20BUDGET%202%20PCE%20SIZE%2042%20CHEST%2038%20WAIST-2sr25D3KyLcqSMSa2AhQwIMfSvg9gs.jpg",
      stock_quantity: 15,
      is_active: true
    },
    // PPE - Rainsuit
    {
      name: "Rainsuit Rubberised Nylon Large Yellow",
      description: "Yellow rubberised nylon rainsuit in large size. Waterproof jacket and pants set with hood for wet weather protection.",
      price: 145,
      category_id: ppeCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAINSUIT%20RUBBERISED%20NYLON%20LRG%20YEL-afOfRNoRDPn9P0cXgLQhxKM3nklbK9.jpg",
      stock_quantity: 20,
      is_active: true
    },
    // Plumbing - Pulse products
    {
      name: "Pulse Hand Shower Single Function 100mm",
      description: "Chrome hand shower with single function spray pattern. 100mm diameter head for comfortable showering.",
      price: 95,
      category_id: plumbingCategoryId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PULSE%20HAND%20SHOWER%20SINGLE%20FUNCTION%20100MM-W3VhQ6Ipp1bSgrZVpZDMLwZ05dmHjF.jpg",
      stock_quantity: 25,
      supplier: "Pulse",
      is_active: true
    },
    {
      name: "Pulse Shower Arm & Flange Long 400mm",
      description: "Chrome shower arm with flange. 400mm length for optimal shower head positioning.",
      price: 85,
      category_id: plumbingCategoryId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PULSE%20SHOWER%20ARM%20%26%20FLANGE%20LONG%20400MM-VFaeaCkRnigbLNzmCWF8TcNq6s2FIZ.jpg",
      stock_quantity: 30,
      supplier: "Pulse",
      is_active: true
    },
    {
      name: "Pulse Shower Rose 100mm Single Function",
      description: "Chrome overhead shower rose with single function. 100mm diameter for focused water coverage.",
      price: 75,
      category_id: plumbingCategoryId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PULSE%20SHOWER%20ROSE%20100MM%20SINGLE%20FUNCTION-6dXgFPXbzzHsuOXiX8BW0WYpIE9ZBk.jpg",
      stock_quantity: 25,
      supplier: "Pulse",
      is_active: true
    },
    {
      name: "Pulse Shower Rose 230mm Round",
      description: "Large chrome rainfall shower rose. 230mm round head for luxurious shower experience.",
      price: 195,
      category_id: plumbingCategoryId,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PULSE%20SHOWER%20ROSE%20230MM%20ROUND-JFrab8Eorgvbc5BGGRwb7qaI2a97D1.jpg",
      stock_quantity: 20,
      supplier: "Pulse",
      is_active: true
    },
    // Hardware - Adhesives
    {
      name: "Pattex Superglue Ultra Gel 3g",
      description: "Pattex super glue in gel formula. 3g tube, non-dripping, shock and water resistant. Bonds china, metal, rubber, leather, wood, paper, plastics.",
      price: 45,
      category_id: hardwareCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PATTEX%20SUPERGLUE%20TUBE%20ULTRA%20GEL%202622511%203G-vn6GQXLJQaiRoyNsP1Kx5PLFUqplu0.jpg",
      stock_quantity: 50,
      supplier: "Pattex",
      is_active: true
    },
    {
      name: "Pattex No More Nails Invisible 40g",
      description: "Pattex No More Nails invisible adhesive. 40g tube with instant tack. Bonds wood, aluminum, stone, plaster, concrete.",
      price: 65,
      category_id: hardwareCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PATTEX%20NO%20MORE%20NAILS%20INVISIBLE%20TUBE%202301846%2040GR-PjZaY3kgTe00IEpj8plpVilkuZfZLm.jpg",
      stock_quantity: 40,
      supplier: "Pattex",
      is_active: true
    },
    {
      name: "Pattex Precision Super Glue 5g",
      description: "Pattex precision super glue liquid. 5g bottle with precision applicator. No dripping, extra quick and extra strong.",
      price: 55,
      category_id: hardwareCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PATTEX%20PRECISION%20SUPER%20GLUE%20TUBE%202704712%205G-UoQ9Azleg3AB0klQswYXcqEw6z92YZ.jpg",
      stock_quantity: 45,
      supplier: "Pattex",
      is_active: true
    },
    {
      name: "Q-Bond Adhesive 5ml",
      description: "Q-Bond ultra strong bonding adhesive. 5ml bottle for quick repairs on various materials.",
      price: 35,
      category_id: hardwareCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Q-BOND%20ADHESIVE%205ML-vaeI5g3MlxRw5ntDHWELpeg6TXdl0h.jpg",
      stock_quantity: 60,
      supplier: "Q-Bond",
      is_active: true
    },
    {
      name: "Pritt Multi Tack 20g",
      description: "Pritt multi tack removable adhesive putty. 20g pack, clean and reusable. Perfect for photos, posters and decorations.",
      price: 35,
      category_id: hardwareCategory?.id,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PRITT%20MULTI%20TACK%20EACH%20981557%2020G-7KlR2HVCsKaQQ5uhJ04gjSvTXuznoy.jpg",
      stock_quantity: 50,
      supplier: "Pritt",
      is_active: true
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
    message: "Workwear, plumbing and adhesives products added",
    results
  })
}
