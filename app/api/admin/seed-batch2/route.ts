import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const products = [
  // Kiddies Gumboots - various sizes
  {
    name: "Kiddies Gumboots Size 2 Blue & Yellow",
    slug: "kiddies-gumboots-size-2-blue-yellow",
    sku: "GUMBOOT-KIDS-2",
    price: 89,
    description: "Durable children's gumboots in bright blue with yellow sole. Size 2. Perfect for rainy days and muddy play. Waterproof PVC construction keeps little feet dry.",
    short_description: "Kids rain boots size 2",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KIDDIES%20GUMBOOTS%20SIZE%202%20BLU%20%26%20YEL-f9mKnmOBIk2MS0abrnR5ASAOwFZIjZ.jpg",
    stock_quantity: 30,
    category_slug: "footwear"
  },
  {
    name: "Kiddies Gumboots Size 7 Blue & Yellow",
    slug: "kiddies-gumboots-size-7-blue-yellow",
    sku: "GUMBOOT-KIDS-7",
    price: 95,
    description: "Durable children's gumboots in bright blue with yellow sole. Size 7. Perfect for rainy days and muddy play. Waterproof PVC construction keeps little feet dry.",
    short_description: "Kids rain boots size 7",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KIDDIES%20GUMBOOTS%20SIZE%207%20BLU%20%26%20YEL-urjRm7lisj5yqQopn4zbOjvBLBweHr.jpg",
    stock_quantity: 30,
    category_slug: "footwear"
  },
  {
    name: "Kiddies Gumboots Size 8 Blue & Yellow",
    slug: "kiddies-gumboots-size-8-blue-yellow",
    sku: "GUMBOOT-KIDS-8",
    price: 99,
    description: "Durable children's gumboots in bright blue with yellow sole. Size 8. Perfect for rainy days and muddy play. Waterproof PVC construction keeps little feet dry.",
    short_description: "Kids rain boots size 8",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KIDDIES%20GUMBOOTS%20SIZE%208%20BLU%20%26%20YEL-RvGNQPH6E9YmD4rvsNQS1MDvCRHfoa.jpg",
    stock_quantity: 30,
    category_slug: "footwear"
  },
  {
    name: "Kiddies Gumboots Size 9 Blue & Yellow",
    slug: "kiddies-gumboots-size-9-blue-yellow",
    sku: "GUMBOOT-KIDS-9",
    price: 105,
    description: "Durable children's gumboots in bright blue with yellow sole. Size 9. Perfect for rainy days and muddy play. Waterproof PVC construction keeps little feet dry.",
    short_description: "Kids rain boots size 9",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KIDDIES%20GUMBOOTS%20SIZE%209%20BLU%20%26%20YEL-MoxyhTi3nUJjfphGLRdcCwdURGfJHn.jpg",
    stock_quantity: 30,
    category_slug: "footwear"
  },
  {
    name: "Kiddies Gumboots Size 10 Blue & Yellow",
    slug: "kiddies-gumboots-size-10-blue-yellow",
    sku: "GUMBOOT-KIDS-10",
    price: 109,
    description: "Durable children's gumboots in bright blue with yellow sole. Size 10. Perfect for rainy days and muddy play. Waterproof PVC construction keeps little feet dry.",
    short_description: "Kids rain boots size 10",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KIDDIES%20GUMBOOTS%20SIZE%2010%20BLU%20%26%20YEL-wqKvzyrMaOs5qpyN4tLeBrcqsxhJME.jpg",
    stock_quantity: 30,
    category_slug: "footwear"
  },
  {
    name: "Kiddies Gumboots Size 11 Blue & Yellow",
    slug: "kiddies-gumboots-size-11-blue-yellow",
    sku: "GUMBOOT-KIDS-11",
    price: 115,
    description: "Durable children's gumboots in bright blue with yellow sole. Size 11. Perfect for rainy days and muddy play. Waterproof PVC construction keeps little feet dry.",
    short_description: "Kids rain boots size 11",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KIDDIES%20GUMBOOTS%20SIZE%2011%20BLU%20%26%20YEL-GvAnHmItfRRWCMNFqQ690KclDcCl5Q.jpg",
    stock_quantity: 30,
    category_slug: "footwear"
  },
  {
    name: "Kiddies Gumboots Size 12 Blue & Yellow",
    slug: "kiddies-gumboots-size-12-blue-yellow",
    sku: "GUMBOOT-KIDS-12",
    price: 119,
    description: "Durable children's gumboots in bright blue with yellow sole. Size 12. Perfect for rainy days and muddy play. Waterproof PVC construction keeps little feet dry.",
    short_description: "Kids rain boots size 12",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KIDDIES%20GUMBOOTS%20SIZE%2012%20BLU%20%26%20YEL-wV6bg4RdCv54WDEBvq3NjmfjUmTggy.jpg",
    stock_quantity: 30,
    category_slug: "footwear"
  },

  // Welding Supplies
  {
    name: "Promax E6013 Welding Rods 4.0mm x 5kg Box",
    slug: "promax-e6013-welding-rods-4mm-5kg",
    sku: "WELD-E6013-4MM-5KG",
    price: 285,
    description: "Pro-Max E6013 general purpose welding electrodes. 4.0mm diameter, 5kg box. High quality rutile coated electrodes for all position welding. Low spatter, excellent arc stability. Made in South Africa.",
    short_description: "4.0mm welding rods 5kg box",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PROMAX%20E6013%20WELDING%20RODS%204.0MM%20X%205KG%20BOX-NoKE7XReMRNZoTcaHopTEct6xee8uL.jpg",
    stock_quantity: 50,
    category_slug: "tools-hardware"
  },
  {
    name: "Promax E6013 Welding Rods 3.2mm x 5kg Box",
    slug: "promax-e6013-welding-rods-3-2mm-5kg",
    sku: "WELD-E6013-3.2MM-5KG",
    price: 275,
    description: "Pro-Max E6013 general purpose welding electrodes. 3.2mm diameter, 5kg box. High quality rutile coated electrodes for all position welding. Low spatter, excellent arc stability. Made in South Africa.",
    short_description: "3.2mm welding rods 5kg box",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PROMAX%20E6013%20WELDING%20RODS%203.2MM%20X%205KG%20BOX-zoPzbsGTd73HutPGxOxE0DnAjOiS41.jpg",
    stock_quantity: 50,
    category_slug: "tools-hardware"
  },
  {
    name: "Promax E6013 Welding Rods 3.2mm x 1kg Box",
    slug: "promax-e6013-welding-rods-3-2mm-1kg",
    sku: "WELD-E6013-3.2MM-1KG",
    price: 75,
    description: "Pro-Max E6013 general purpose welding electrodes. 3.2mm diameter, 1kg box. Perfect for small jobs and DIY projects. High quality rutile coated electrodes. Made in South Africa.",
    short_description: "3.2mm welding rods 1kg box",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PROMAX%20E6013%20WELDING%20RODS%203.2MM%20X%201KG%20BOX-sro4Pldu5gjG28hNn5bSe02jNeJ2fG.jpg",
    stock_quantity: 100,
    category_slug: "tools-hardware"
  },

  // Gloves
  {
    name: "Hanvo Super Grip Nitrile Glove",
    slug: "hanvo-super-grip-nitrile-glove",
    sku: "GLOVE-HANVO-NITRILE-RED",
    price: 55,
    description: "Hanvo Super Grip nitrile coated work gloves. Red liner with black nitrile palm coating. EN388 certified (4121). Excellent grip and dexterity for general handling tasks.",
    short_description: "Red/black nitrile work gloves",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HANVO%20SUPER%20GRIP%20NITRILE%20GLOVE-hGgv07hmvU8K1kQ8fT3ccEPmZgqRR2.jpg",
    stock_quantity: 200,
    category_slug: "ppe-safety"
  },
  {
    name: "Hanvo Super Grip Cut Level 5 Nitrile Glove",
    slug: "hanvo-super-grip-cut-level-5-nitrile-glove",
    sku: "GLOVE-HANVO-CUT5",
    price: 85,
    description: "Hanvo Super Grip cut resistant gloves with nitrile palm coating. Cut Level 5 protection (EN388 4543). Grey HPPE liner for maximum cut resistance. Ideal for handling sharp materials.",
    short_description: "Cut level 5 resistant gloves",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HANVO%20SUPER%20GRIP%20CUT%20LEVEL%205%20NITRILE%20GLOVE-LdubB5Czu1C5wSpJ6TuXaPY3H8ZJJx.jpg",
    stock_quantity: 150,
    category_slug: "ppe-safety"
  },
  {
    name: "Kaufmann Glove Green Solvex Nitrile",
    slug: "kaufmann-glove-green-solvex-nitrile",
    sku: "GLOVE-KAUFMANN-SOLVEX",
    price: 65,
    description: "Kaufmann green Solvex nitrile chemical resistant gloves. Excellent protection against oils, greases, and many chemicals. Flock-lined for comfort. Ideal for industrial and cleaning applications.",
    short_description: "Green chemical resistant gloves",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%20GLOVE%20GREEN%20SOLVEX%20NITRILE-16XB8Qrz72BlYQWbKo6KagnTqTXKLo.jpg",
    stock_quantity: 150,
    category_slug: "ppe-safety"
  },
  {
    name: "Kaufmann Glove PVC Knitted Wrist Bulk",
    slug: "kaufmann-glove-pvc-knitted-wrist-bulk",
    sku: "GLOVE-KAUFMANN-PVC-BULK",
    price: 35,
    description: "Kaufmann red PVC dipped gloves with knitted wrist. EN388 certified (4121). Excellent grip and chemical resistance. Sold in bulk packs. Ideal for general industrial use.",
    short_description: "Red PVC work gloves bulk",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%20GLOVE%20PVC%2BKNITTED%20WRIST%20120%20BULK-edoCF59GsIz2cCkYctwK9gp8d4SpgI.jpg",
    stock_quantity: 500,
    category_slug: "ppe-safety"
  },
  {
    name: "Kaufmann Glove Nitrolite Grey Nitrile Palm Coated",
    slug: "kaufmann-glove-nitrolite-grey",
    sku: "GLOVE-KAUFMANN-NITROLITE",
    price: 45,
    description: "Kaufmann Nitrolite grey nitrile palm coated gloves. White polyester liner with grey nitrile coating. EN388 certified. Excellent dexterity and grip for precision work.",
    short_description: "Grey nitrile palm coated gloves",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%20GLOVE%20NITROLITE%20GREY%20NITRILE%20PALM%20COATED-waZJNK0aSvtnbByy6JcbWWDP7XSW8d.jpg",
    stock_quantity: 200,
    category_slug: "ppe-safety"
  },
  {
    name: "Latex Gloves Household Large",
    slug: "latex-gloves-household-large",
    sku: "GLOVE-LATEX-HOUSE-L",
    price: 25,
    description: "Yellow latex household gloves, size large. Flock-lined for comfort. Ideal for cleaning, dishwashing, and general household tasks. Protects hands from water and cleaning chemicals.",
    short_description: "Yellow household gloves large",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LATEX%20GLOVES%20HOUSEHOLD%20LARGE-Kiaw2mkRBOAwiwiAvGEQO5DYV8N8Mn.jpg",
    stock_quantity: 300,
    category_slug: "ppe-safety"
  },
  {
    name: "Latex Gloves Household Medium",
    slug: "latex-gloves-household-medium",
    sku: "GLOVE-LATEX-HOUSE-M",
    price: 25,
    description: "Yellow latex household gloves, size medium. Flock-lined for comfort. Ideal for cleaning, dishwashing, and general household tasks. Protects hands from water and cleaning chemicals.",
    short_description: "Yellow household gloves medium",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LATEX%20GLOVES%20HOUSEHOLD%20MEDIUM-j2orIWkFmT9M4ta4Mpljgvp4Vc6wdJ.jpg",
    stock_quantity: 300,
    category_slug: "ppe-safety"
  },

  // Safety Equipment
  {
    name: "Kaufmann PPE Drivers Kit",
    slug: "kaufmann-ppe-drivers-kit",
    sku: "PPE-DRIVERS-KIT",
    price: 195,
    description: "Complete PPE drivers kit including hi-vis safety vest, safety glasses, and leather driver gloves. Essential safety gear for drivers and site workers. Meets safety standards.",
    short_description: "Hi-vis vest, glasses & gloves kit",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KAUFMANN%20PPE%20DRIVERS%20KIT-HaoXoEbx1fEJecLIZpqrw5zxizjIGi.jpg",
    stock_quantity: 75,
    category_slug: "ppe-safety"
  },
  {
    name: "Reflective Tape SABS 50m Yellow",
    slug: "reflective-tape-sabs-50m-yellow",
    sku: "TAPE-REFLECT-YEL-50M",
    price: 450,
    description: "SABS approved yellow reflective tape, 50 meter roll. High visibility conspicuity tape for vehicles, trailers, and equipment. Meets South African road safety standards.",
    short_description: "Yellow reflective tape 50m roll",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/REFLECTIVE%20TAPE%20SABS%2050M%20PRICE%20P.M-mJeFmGzQtBv1vdo8AvQ9K4qhfWmB7C.jpg",
    stock_quantity: 40,
    category_slug: "ppe-safety"
  },

  // Pet Care
  {
    name: "Bob Martin Tick & Flea Dog Spot Large 2x1ml",
    slug: "bob-martin-tick-flea-dog-spot-large",
    sku: "PET-BOBMARTIN-FLEA-LRG",
    price: 85,
    description: "Bob Martin Tick & Flea Dog Spot treatment for large dogs. Contains 2 x 1ml applicators. Provides 5 weeks protection against ticks and fleas. Safe for puppies from 2 weeks old.",
    short_description: "Tick & flea treatment large dogs",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OB%20MARTIN%20PET%20DOG%20SPOT%20LRG%202X1ML-UmNa6nseeczbrsiOOZqRQK8WpEUjFK.jpg",
    stock_quantity: 100,
    category_slug: "pet-supplies"
  }
]

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Ensure categories exist
    const categoryData = [
      { name: "Footwear", slug: "footwear", description: "Boots, shoes and footwear for all ages" },
      { name: "Tools & Hardware", slug: "tools-hardware", description: "Welding supplies, tools and hardware" },
      { name: "PPE & Safety", slug: "ppe-safety", description: "Personal protectiveequipment and safety gear" },
      { name: "Pet Supplies", slug: "pet-supplies", description: "Food, accessories and care products for pets" }
    ]

    for (const cat of categoryData) {
      await supabase
        .from('categories')
        .upsert(cat, { onConflict: 'slug' })
    }

    // Get category IDs
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug')

    const categoryMap = new Map(categories?.map(c => [c.slug, c.id]) || [])

    const results = { added: 0, updated: 0, errors: [] as string[] }

    for (const product of products) {
      const categoryId = categoryMap.get(product.category_slug)
      
      const productData = {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        description: product.description,
        short_description: product.short_description,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        category_id: categoryId,
        is_active: true,
        is_featured: false,
        is_new: true
      }

      const { error } = await supabase
        .from('products')
        .upsert(productData, { onConflict: 'slug' })

      if (error) {
        results.errors.push(`${product.name}: ${error.message}`)
      } else {
        results.added++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added/updated ${results.added} products`,
      results
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 })
  }
}
