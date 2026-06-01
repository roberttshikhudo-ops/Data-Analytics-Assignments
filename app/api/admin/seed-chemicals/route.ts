import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

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

  // Create Chemicals & Fertilizers category
  const { data: category } = await supabase
    .from("categories")
    .upsert({
      name: "Chemicals & Fertilizers",
      slug: "chemicals-fertilizers",
      description: "Agricultural chemicals, fertilizers, insecticides, and pest control products",
      is_active: true
    }, { onConflict: "slug" })
    .select()
    .single()

  const categoryId = category?.id

  const products = [
    // Fertilizers
    {
      name: "Protek General Fertilizer 2:3:2 (14) 2kg",
      slug: "protek-general-fertilizer-232-2kg",
      description: "Protek General Fertilizer 2:3:2 (14) is ideal for use on flowers, flowering shrubs and vegetables. This balanced fertilizer promotes healthy growth, vibrant blooms, and bountiful harvests. The 2kg bag covers approximately 66m² and is perfect for home gardens.",
      short_description: "Balanced fertilizer for flowers, shrubs, and vegetables - 2kg",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/General%20Fertiliser%2023%202%20%2814%29%202kg-pnvjrJPOkOzR24PzDI4GlCFWLOTp7P.jpg",
      sku: "FERT-GEN-2KG",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek General Fertilizer 2:3:2 (14) 5kg",
      slug: "protek-general-fertilizer-232-5kg",
      description: "Protek General Fertilizer 2:3:2 (14) is ideal for use on flowers, flowering shrubs and vegetables. This balanced fertilizer promotes healthy growth, vibrant blooms, and bountiful harvests. The 5kg bag covers approximately 166m² and is great for medium-sized gardens.",
      short_description: "Balanced fertilizer for flowers, shrubs, and vegetables - 5kg",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/general-fertilizer-5kg-nEoc9N4ACuSUbPCa8Vbs2rPLZbhd1i.png",
      sku: "FERT-GEN-5KG",
      is_active: true,
      is_featured: true
    },
    {
      name: "Protek General Fertilizer 2:3:2 (14) 10kg",
      slug: "protek-general-fertilizer-232-10kg",
      description: "Protek General Fertilizer 2:3:2 (14) is ideal for use on flowers, flowering shrubs and vegetables. This balanced fertilizer promotes healthy growth, vibrant blooms, and bountiful harvests. The 10kg bag covers approximately 333m² and is ideal for large gardens.",
      short_description: "Balanced fertilizer for flowers, shrubs, and vegetables - 10kg",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/general-fertilizer-10kg-MfTs3cQea9oIjg6jiuIQxmOdySgaJr.png",
      sku: "FERT-GEN-10KG",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Nitrogreen KAN/LAN 17% 2kg",
      slug: "protek-nitrogreen-kan-lan-17-2kg",
      description: "Protek Nitrogreen KAN/LAN 17% is a nitrogen fertilizer ideal for use on lawns, vegetables and fruit trees. Contains 170g/kg Nitrogen for lush green growth. The 2kg bag covers approximately 100m².",
      short_description: "Nitrogen fertilizer for lawns, vegetables & fruit trees - 2kg",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAN%2017-2kg-A6Kd9qp0pzWqkLklqGYSWE8Jkq9lH1.jpg",
      sku: "FERT-KAN-2KG",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Nitrogreen KAN/LAN 17% 5kg",
      slug: "protek-nitrogreen-kan-lan-17-5kg",
      description: "Protek Nitrogreen KAN/LAN 17% is a nitrogen fertilizer ideal for use on lawns, vegetables and fruit trees. Contains 170g/kg Nitrogen for lush green growth. The 5kg bag covers approximately 250m².",
      short_description: "Nitrogen fertilizer for lawns, vegetables & fruit trees - 5kg",
      price: 95,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAN%2017-5kg-8pLgcJa1OUaAzTHLc6MdCkt3CosGXQ.jpg",
      sku: "FERT-KAN-5KG",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Nitrogreen KAN/LAN 17% 10kg",
      slug: "protek-nitrogreen-kan-lan-17-10kg",
      description: "Protek Nitrogreen KAN/LAN 17% is a nitrogen fertilizer ideal for use on lawns, vegetables and fruit trees. Contains 170g/kg Nitrogen for lush green growth. The 10kg bag covers approximately 500m².",
      short_description: "Nitrogen fertilizer for lawns, vegetables & fruit trees - 10kg",
      price: 165,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAN%2017-10kg-4AAGG8Ms13hCQVElKSXDYzo1yFWXMK.png",
      sku: "FERT-KAN-10KG",
      is_active: true,
      is_featured: true
    },
    // Insecticides
    {
      name: "Protek Nuvan Profi Fumigation Fogger 330ml",
      slug: "protek-nuvan-profi-fumigation-fogger-330ml",
      description: "Nuvan Profi is a rapid-acting uninterrupted release aerosol for space fumigation of dwelling houses, stores, warehouses, mills, silos, ships, and cargo holds. Covers up to 60m². Effective against flies, mosquitoes, cockroaches, and other crawling insects.",
      short_description: "Fumigation fogger for indoor pest control - covers 60m²",
      price: 125,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Nuvan%20Profi%20330ml-2OnKNFI29xHYidf4pJZ6Y7RIcoQmsJ.jpg",
      sku: "CHEM-NUVAN-330",
      is_active: true,
      is_featured: true
    },
    {
      name: "Protek Avi Gard Merkaptotion 100ml",
      slug: "protek-avi-gard-merkaptotion-100ml",
      description: "Avi Gard Merkaptotion is a house and garden insecticide for the control of ants, flies, cockroaches, and other crawling insects. Safe for use around birds when used as directed.",
      short_description: "House & garden insecticide for ants, flies, cockroaches",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Avi%20Gard%20100ml-tMJdXIhM35qFesjHJE5feHZBUPk5jG.jpg",
      sku: "CHEM-AVIGARD-100",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Cypermethrin/Sipermetrien 1L",
      slug: "protek-cypermethrin-1l",
      description: "Cypermethrin is a broad-spectrum insecticide effective against caterpillars, cutworms, bollworms, and other crop pests. Professional-grade formula for agricultural and garden use.",
      short_description: "Broad-spectrum insecticide for caterpillars & crop pests - 1L",
      price: 185,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cypermethrin%201L-V6XytjA21KxiKLpE6Co1zjSBJRlv0y.jpg",
      sku: "CHEM-CYPER-1L",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Alphathrin 50ml",
      slug: "protek-alphathrin-50ml",
      description: "Alphathrin is an effective insecticide for controlling cockroaches, ants, flies, mosquitoes, and other household pests. Fast-acting formula provides long-lasting protection.",
      short_description: "Insecticide for cockroaches, ants, flies & mosquitoes",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/alphathrin-50ml-ULPXpfO6RSnvzLtDBUJJI2Ifcm0axj.png",
      sku: "CHEM-ALPHA-50",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Knox Worm 50ml",
      slug: "protek-knox-worm-50ml",
      description: "Knox Worm is an effective treatment for controlling caterpillars, cutworms, bollworms, and other worm pests in gardens and crops. Safe for use on vegetables and ornamental plants.",
      short_description: "Worm & caterpillar control for gardens & crops",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/knox-worm-50ml-hxvEafhDmyXmlFm2Ce8bdhMLWwBFGJ.png",
      sku: "CHEM-KNOXWORM-50",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Knox Flea 100ml",
      slug: "protek-knox-flea-100ml",
      description: "Knox Flea is a concentrated flea control solution for treating homes, kennels, and pet bedding areas. Effectively eliminates fleas and provides residual protection.",
      short_description: "Flea control for homes, kennels & pet areas",
      price: 75,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/knox-flea-100ml-WWkccCoPHJrlv5j3ObLUUs6DShwK6r.png",
      sku: "CHEM-KNOXFLEA-100",
      is_active: true,
      is_featured: false
    },
    // Rodent Control
    {
      name: "Protek Kill All Rat & Mouse Pellets 50g",
      slug: "protek-kill-all-rat-mouse-pellets-50g",
      description: "Kill All Rat & Mouse Pellets are for indoor use to control Norway rats, roof rats, and house mice. Blue pellets with brodifacoum active ingredient. Ready to use - no mixing required.",
      short_description: "Rodent control pellets for indoor use - 50g",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KIll%20all%20pellets%2050g-DH0VtSWYr5YDPDBbbO60LRna07j4Mw.png",
      sku: "CHEM-KILLPEL-50",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Kill All Rat & Mouse Wax Blocks 85g",
      slug: "protek-kill-all-rat-mouse-wax-blocks-85g",
      description: "Kill All Rat & Mouse Wax Blocks are moisture-resistant bait blocks for controlling rats and mice in damp areas. Blue wax blocks with brodifacoum active ingredient.",
      short_description: "Moisture-resistant rodent bait blocks - 85g",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Kill%20all%20rat-mouse-wax-block-85g-k9MrEL8mxy75aEJWtwwNfC0nNHuu3c.png",
      sku: "CHEM-KILLWAX-85",
      is_active: true,
      is_featured: false
    },
    // Fungicides
    {
      name: "Protek Copper Flow Plus Bactericide & Fungicide 100ml",
      slug: "protek-copper-flow-plus-100ml",
      description: "Copper Flow Plus is a contact bactericide and fungicide for controlling bacterial and fungal diseases on vegetables, fruit trees, and ornamental plants. Prevents blight, mildew, and rot.",
      short_description: "Bactericide & fungicide for vegetables & fruit trees",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copper%20flow%20plus%20100ml-t5jLIYqpee6CxlC5nfqUa0DvuHVD5h.jpg",
      sku: "CHEM-COPPER-100",
      is_active: true,
      is_featured: false
    },
    {
      name: "Protek Mycoguard 720 100ml",
      slug: "protek-mycoguard-720-100ml",
      description: "Mycoguard 720 is a contact fungicide for controlling fungal diseases on lawns, vegetables, and ornamental plants. Effectively treats and prevents lawn diseases.",
      short_description: "Contact fungicide for lawns & garden plants",
      price: 75,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mycoguard-720-100ml-ucnQp34L8WNkdSf3WwOKltV5IzQaMr.png",
      sku: "CHEM-MYCO-100",
      is_active: true,
      is_featured: false
    },
    // Pet Care
    {
      name: "Protek CarbaKil Dusting Powder 200g",
      slug: "protek-carbakil-dusting-powder-200g",
      description: "CarbaKil Dusting Powder is for the control of fleas, ticks, and lice on dogs and cats. Simply dust onto your pet's coat and massage in. Safe and effective formula.",
      short_description: "Flea, tick & lice powder for dogs and cats",
      price: 55,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Carbakill%20200g-WfBslNV32849Ww1Ms6qpzIin11bYwC.jpg",
      sku: "CHEM-CARBA-200",
      is_active: true,
      is_featured: false
    },
    // Herbicides
    {
      name: "Protek Clear Pave 100ml",
      slug: "protek-clear-pave-100ml",
      description: "Clear Pave is a non-selective herbicide for clearing weeds from paved areas, driveways, and pathways. Kills weeds down to the root for long-lasting control.",
      short_description: "Weed killer for paved areas & driveways",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clear%20pave%20100ml-U1Pxi3fJR8pTbICeoYwhIXQyvPCO2Y.jpg",
      sku: "CHEM-CLEARPAVE-100",
      is_active: true,
      is_featured: false
    }
  ]

  let successCount = 0
  const errors: string[] = []

  for (const product of products) {
    const { error } = await supabase
      .from("products")
      .upsert({
        ...product,
        category_id: categoryId
      }, { onConflict: "slug" })

    if (error) {
      errors.push(`${product.name}: ${error.message}`)
    } else {
      successCount++
    }
  }

  return NextResponse.json({
    success: true,
    message: `Added ${successCount} chemicals & fertilizers products`,
    categoryId,
    errors: errors.length > 0 ? errors : undefined
  })
}
