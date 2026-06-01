import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== 'agrihub-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // First, create the Human Health Care category if it doesn't exist
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'human-health-care')
    .single()

  let categoryId: string

  if (existingCategory) {
    categoryId = existingCategory.id
  } else {
    const { data: newCategory, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: 'Human Health Care',
        slug: 'human-health-care',
        description: 'Health care products for humans including cough relief, vitamins, and medicines',
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
      })
      .select('id')
      .single()

    if (categoryError) {
      return NextResponse.json({ error: 'Failed to create category', details: categoryError }, { status: 500 })
    }
    categoryId = newCategory.id
  }

  // Cough relief products from Curapharm
  const products = [
    {
      name: "Zinplex Junior Cough Bee Calm Syrup 200ml",
      price: 68.84,
      image_url: "https://www.curapharm.co.za/cdn/shop/products/ZinplexJuniorCoughBeeCalmSyrup200ml1.jpg?v=1665477351&width=533",
      description: "Junior cough syrup with bee calm formula for children"
    },
    {
      name: "Fulvicough 4 Kids 100ml",
      price: 125.03,
      image_url: "https://www.curapharm.co.za/cdn/shop/files/515Wx515H_99875_01.jpg?v=1739992786&width=533",
      description: "Cough syrup formulated for kids"
    },
    {
      name: "Fulvicough 4 Adults 200ml",
      price: 137.37,
      image_url: "https://www.curapharm.co.za/cdn/shop/files/515Wx515H_99876_01.jpg?v=1739992637&width=533",
      description: "Adult cough syrup formula"
    },
    {
      name: "Lennon Cough Mix Orange 50ml",
      price: 47.26,
      image_url: "https://www.curapharm.co.za/cdn/shop/files/LennonCoughMixOrange50mlDutchMed1.jpg?v=1690448814&width=533",
      description: "Orange flavoured cough mixture"
    },
    {
      name: "Lennon Cough Mix Honey 100ml",
      price: 72.49,
      image_url: "https://www.curapharm.co.za/cdn/shop/files/LennonCoughMixHoney100mlDutchMeds1.jpg?v=1690448711&width=533",
      description: "Honey flavoured cough mixture"
    },
    {
      name: "Lennon Cough Mix Honey 50ml",
      price: 47.26,
      image_url: "https://www.curapharm.co.za/cdn/shop/files/LennonCoughMixHoney50mlDutchMeds.jpg?v=1690448766&width=533",
      description: "Honey flavoured cough mixture - smaller size"
    },
    {
      name: "Stop Cough Nightime 100ml",
      price: 58.07,
      image_url: "https://www.curapharm.co.za/cdn/shop/files/StopCoughNightime100MlSc.jpg?v=1684752325&width=533",
      description: "Night time cough relief syrup"
    },
    {
      name: "Avalife Synatura Syrup 200ml",
      price: 117.50,
      image_url: "https://www.curapharm.co.za/cdn/shop/products/AvalifeSynaturaSyrup200ml.jpg?v=1666363153&width=533",
      description: "Natural cough syrup"
    },
    {
      name: "Natura Combin Assist Cough & Colds 125 Tablets",
      price: 97.09,
      image_url: "https://www.curapharm.co.za/cdn/shop/products/NaturaCombinAssistCough_C125Tablets.jpg?v=1665236836&width=533",
      description: "Homeopathic tablets for cough and cold relief"
    },
    {
      name: "Tibb Kofcare Syrup 100ml",
      price: 92.34,
      image_url: "https://www.curapharm.co.za/cdn/shop/products/kofcare-syrup-200.jpg?v=1629775806&width=533",
      description: "Herbal cough care syrup"
    },
    {
      name: "Tibb Kofcare Syrup 200ml",
      price: 156.28,
      image_url: "https://www.curapharm.co.za/cdn/shop/products/kofcare-syrup-200_6d749e37-875c-49c9-bfa7-21dc8d6083c5.jpg?v=1629775821&width=533",
      description: "Herbal cough care syrup - larger size"
    },
    {
      name: "Nectadyn Heel Cough Syrup 125ml",
      price: 144.36,
      image_url: "https://www.curapharm.co.za/cdn/shop/products/6009665892030.jpg?v=1632939501&width=533",
      description: "Homeopathic cough syrup"
    }
  ]

  const results = {
    added: [] as string[],
    skipped: [] as string[],
    errors: [] as string[]
  }

  for (const product of products) {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          slug,
          price: product.price,
          image_url: product.image_url,
          description: product.description,
          category_id: categoryId
        })

      if (error) {
        if (error.code === '23505') {
          results.skipped.push(product.name)
        } else {
          results.errors.push(`${product.name}: ${error.message}`)
        }
      } else {
        results.added.push(product.name)
      }
    } catch (err) {
      results.errors.push(`${product.name}: ${err}`)
    }
  }

  return NextResponse.json({
    success: true,
    categoryId,
    totalProducts: products.length,
    ...results
  })
}
