import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (key !== 'agrihub-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get or create Footwear category
  let { data: footwearCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'footwear')
    .single()

  if (!footwearCategory) {
    const { data: newCategory } = await supabase
      .from('categories')
      .insert({
        name: 'Footwear',
        slug: 'footwear',
        description: 'Work boots, gumboots, and safety footwear',
        is_active: true
      })
      .select()
      .single()
    footwearCategory = newCategory
  }

  const products = [
    {
      name: 'Wayne Gumboots Mens Knee Length Black Size 9',
      slug: 'wayne-gumboots-mens-knee-black-size-9',
      description: 'Wayne brand men\'s knee-length black gumboots in size 9. Made from durable rubber with a textured sole for excellent grip on wet and slippery surfaces. Ideal for farming, gardening, construction, and general outdoor work. Waterproof design keeps feet dry in all conditions.',
      short_description: 'Men\'s knee-length black gumboots, size 9',
      price: 195,
      compare_at_price: 250,
      cost_price: 120,
      sku: 'WAYNE-GUMBOOT-BLK-9',
      stock_quantity: 15,
      low_stock_threshold: 3,
      category_id: footwearCategory?.id,
      brand: 'Wayne',
      is_active: true,
      is_featured: false,
      is_new: true,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WAYNE%20GUMBOOTS%20MENS%20KNEE%20L%20BLACK%20SIZE%209-49rIgfvwOGxHaoejNw3maqsTo5lTXK.jpg'
    }
  ]

  const { data, error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'slug' })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    message: `Added ${data.length} products`,
    products: data
  })
}
