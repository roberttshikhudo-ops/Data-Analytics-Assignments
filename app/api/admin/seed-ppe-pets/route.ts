import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ppeProducts = [
  {
    name: 'Hanvo General Handling PU Glove',
    slug: 'hanvo-general-handling-pu-glove',
    description: 'OHANVO PE302 General handling PU coated gloves. EN388 certified, size 10/XL. Black polyurethane coating provides excellent grip and dexterity for general handling tasks.',
    short_description: 'Black PU coated work gloves',
    price: 45.00,
    sku: 'PPE-GLOVE-PU-001',
    stock_quantity: 100,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HANVO%20GENERAL%20HANDLING%20PU%20GLOVE-WFfANbOllH1tOcDsyxFqSHW8iOe74S.jpg',
  },
  {
    name: 'Hanvo General Handling Latex Glove',
    slug: 'hanvo-general-handling-latex-glove',
    description: 'OHANVO LA304 General handling latex coated gloves. EN388 certified, size 9. Purple/blue latex coating provides excellent grip for wet and dry applications.',
    short_description: 'Purple latex coated work gloves',
    price: 40.00,
    sku: 'PPE-GLOVE-LATEX-001',
    stock_quantity: 100,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HANVO%20GENERAL%20HANDLING%20LATEX%20GLOVE-JLEvutrIQSI2uE7EsV8mA0ZHzDFEE4.jpg',
  },
  {
    name: 'Double Respirator',
    slug: 'double-respirator',
    description: 'Blue double cartridge respirator mask for protection against dust, fumes, and vapors. Features adjustable straps and dual filter cartridge system for enhanced protection.',
    short_description: 'Dual cartridge respirator mask',
    price: 150.00,
    sku: 'PPE-RESP-001',
    stock_quantity: 50,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DOUBLE%20RESPIRATOR-VW7RP0N19iG0sJMQT3hxeueSuGe61D.jpg',
  },
  {
    name: 'Barrier Tape Red/White 75mm x 100m',
    slug: 'barrier-tape-red-white-75mm-100m',
    description: 'Red and white striped barrier tape, 75mm width x 100m length. Ideal for marking hazardous areas, construction sites, and restricted zones.',
    short_description: 'Red/white hazard barrier tape',
    price: 85.00,
    sku: 'PPE-TAPE-001',
    stock_quantity: 80,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BARRIER%20TAPE%20RED%20%20WHT%2075MM%20100M-1BMUfVdVBoHNaHCZILgBDhmhQlzvFG.jpg',
  },
  {
    name: 'Safety Goggles Plastic Clear Grinding',
    slug: 'safety-goggles-plastic-clear-grinding',
    description: 'Clear plastic safety glasses with black frame. Lightweight design suitable for grinding, cutting, and general workshop use. Provides full eye protection.',
    short_description: 'Clear safety glasses for grinding',
    price: 35.00,
    sku: 'PPE-GOGGLE-001',
    stock_quantity: 120,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GOGGLE%20SAFETY%20PLASTIC%20CLR%20GRINDING-YZduvHbYSKE0UkphMWsTA4jqMX59X3.jpg',
  },
  {
    name: 'Safety Goggles Indirect Vent Grinding',
    slug: 'safety-goggles-indirect-vent-grinding',
    description: 'Indirect ventilation safety goggles with green elastic strap. Clear lens with anti-fog coating. Provides superior eye protection for grinding and chemical work.',
    short_description: 'Indirect vent safety goggles',
    price: 55.00,
    sku: 'PPE-GOGGLE-002',
    stock_quantity: 80,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GOGGLE%20SAFETY%20INDIRECT%20VENT%20GRINDING-kYFrNgBlG8chrQjD5L3mkEsLsAqDu0.jpg',
  },
  {
    name: 'Dust & Safety Goggles',
    slug: 'dust-safety-goggles',
    description: 'Dust and safety goggles with perforated side vents and green elastic strap. Clear lens provides full eye protection against dust particles and debris.',
    short_description: 'Dust protection safety goggles',
    price: 45.00,
    sku: 'PPE-GOGGLE-003',
    stock_quantity: 100,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GOGGLE%20DUST%20%26%20SAFETY-DN1exEBFUL2TsKBhAMQlARMQrz1421.jpg',
  },
  {
    name: 'Conduit PVC 20mm x 6m',
    slug: 'conduit-pvc-20mm-6m',
    description: 'White PVC electrical conduit pipe, 20mm diameter x 6 meter length. Suitable for protecting electrical wiring in residential and commercial installations.',
    short_description: 'PVC electrical conduit 20mm',
    price: 65.00,
    sku: 'PPE-CONDUIT-001',
    stock_quantity: 200,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Conduit%20PVC%2020mm%20x%206m-WM1xD7KPJA2A8M5IN7JoepMDUBnlDf.jpg',
  },
]

const petProducts = [
  {
    name: 'Dog Bowl Plastic Double',
    slug: 'dog-bowl-plastic-double',
    description: 'Blue plastic double dog bowl for food and water. Durable plastic construction, easy to clean. Perfect for keeping food and water separate.',
    short_description: 'Blue double pet bowl',
    price: 45.00,
    sku: 'PET-BOWL-001',
    stock_quantity: 60,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DOG%20BOWL%20PLASTIC%20DOUBLE-qBV2bTEmX6ZEX77A5xAN661YRJMMzu.jpg',
  },
  {
    name: 'Complete Dog Bowl Medium',
    slug: 'complete-dog-bowl-medium',
    description: 'Yellow Complete brand dog bowl, medium size. Durable plastic construction with non-slip base. Features Complete pet food branding.',
    short_description: 'Yellow medium dog bowl',
    price: 35.00,
    sku: 'PET-BOWL-002',
    stock_quantity: 80,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20DOG%20BOWL%20MEDIUM-bn2HRQIn3oR4M8CsvrHKmrmykqiGAP.jpg',
  },
  {
    name: 'Complete Dog Food Classique Small-Medium 2kg',
    slug: 'complete-dog-food-classique-small-medium-2kg',
    description: 'Complete Classique+ dog food for small to medium breed adult dogs. 2kg bag. Omega 3 & 6 balanced formula with 22% protein. Free from soya, artificial colours and flavours.',
    short_description: 'Classique dog food 2kg',
    price: 120.00,
    sku: 'PET-FOOD-001',
    stock_quantity: 50,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20DOG%20FOOD%20CLASSIQUE%20SMALL%20-%20MEDIUM%202KG-RcoZUzFSmNanH4YygBVFReCP7iIAIG.jpg',
  },
  {
    name: 'Complete Dog Food Elite Small-Medium 2kg',
    slug: 'complete-dog-food-elite-small-medium-2kg',
    description: 'Complete Elite dog food for small to medium breed adult dogs. 2kg bag. Contains real ostrich, 24% protein. Omega 3 & 6 balanced formula. Free from soya, artificial colours and flavours.',
    short_description: 'Elite dog food with ostrich 2kg',
    price: 150.00,
    sku: 'PET-FOOD-002',
    stock_quantity: 40,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20DOG%20FOOD%20ELITE%20SMALL%20-%20MEDIUM%202KG-UzO8Ayeis4C5yzgMx9at4VJ97Zkoh4.jpg',
  },
  {
    name: 'Complete Cat Food Adult 3kg',
    slug: 'complete-cat-food-adult-3kg',
    description: 'Complete Adult Cat food, 3kg bag. Complete and balanced nutrition for adult cats with 28% protein. Contains taurine for heart and eye health. Free from artificial colours and flavours.',
    short_description: 'Adult cat food 3kg',
    price: 180.00,
    sku: 'PET-FOOD-003',
    stock_quantity: 45,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20CAT%20FOOD%203KG-RKtTBy8XtRRWgFmW7c5OSMRMd659bZ.jpg',
  },
  {
    name: 'Complete Cat Food Kitten 1.2kg',
    slug: 'complete-cat-food-kitten-1-2kg',
    description: 'Complete Kitten food, 1.2kg bag. Rich in chicken and rice with 32% protein. Contains DHA for healthy brain development. Free from artificial colours and flavours.',
    short_description: 'Kitten food 1.2kg',
    price: 95.00,
    sku: 'PET-FOOD-004',
    stock_quantity: 55,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20CAT%20FOOD%20KITTEN%201.2KG-AyFMcfnXHFe5A53ub5Mg5MYJX4an8U.jpg',
  },
  {
    name: 'Cat Litter Tray',
    slug: 'cat-litter-tray',
    description: 'Green plastic cat litter tray. Lightweight and easy to clean. Available in assorted colours. Perfect for indoor cats.',
    short_description: 'Green cat litter tray',
    price: 55.00,
    sku: 'PET-TRAY-001',
    stock_quantity: 70,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CAT%20LITTER%20TRAY%20%28ASSORTED%20COLOURS%29-gB96gmR00ardQVPFA51acO4vCzRqnE.jpg',
  },
]

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Create PPE category if it doesn't exist
    let ppeCategory = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'ppe-safety')
      .single()

    if (!ppeCategory.data) {
      const { data: newCategory } = await supabase
        .from('categories')
        .insert({
          name: 'PPE & Safety',
          slug: 'ppe-safety',
          description: 'Personal Protective Equipment and safety supplies',
          is_active: true,
        })
        .select()
        .single()
      ppeCategory = { data: newCategory, error: null }
    }

    // Create Pet Supplies category if it doesn't exist
    let petCategory = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'pet-supplies')
      .single()

    if (!petCategory.data) {
      const { data: newCategory } = await supabase
        .from('categories')
        .insert({
          name: 'Pet Supplies',
          slug: 'pet-supplies',
          description: 'Pet food, bowls, and accessories',
          is_active: true,
        })
        .select()
        .single()
      petCategory = { data: newCategory, error: null }
    }

    const results = {
      ppe: { added: 0, errors: [] as string[] },
      pets: { added: 0, errors: [] as string[] },
    }

    // Add PPE products
    for (const product of ppeProducts) {
      const { error } = await supabase
        .from('products')
        .upsert({
          ...product,
          category_id: ppeCategory.data?.id,
        }, { onConflict: 'sku' })

      if (error) {
        results.ppe.errors.push(`${product.name}: ${error.message}`)
      } else {
        results.ppe.added++
      }
    }

    // Add Pet products
    for (const product of petProducts) {
      const { error } = await supabase
        .from('products')
        .upsert({
          ...product,
          category_id: petCategory.data?.id,
        }, { onConflict: 'sku' })

      if (error) {
        results.pets.errors.push(`${product.name}: ${error.message}`)
      } else {
        results.pets.added++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${results.ppe.added} PPE products and ${results.pets.added} Pet products`,
      results,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 })
  }
}
