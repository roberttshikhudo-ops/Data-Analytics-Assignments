import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'gardening-tools'

  // Get category
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id, name')
    .ilike('slug', `%${category}%`)
    .single()

  if (!categoryData) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  // Get products without images or with placeholder images
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url, price')
    .eq('category_id', categoryData.id)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter products that need images
  const productsNeedingImages = products?.filter(p => 
    !p.image_url || 
    p.image_url.includes('placeholder') || 
    p.image_url.startsWith('/products/')
  ) || []

  return NextResponse.json({
    category: categoryData.name,
    totalProducts: products?.length || 0,
    productsNeedingImages: productsNeedingImages.length,
    products: productsNeedingImages.map(p => ({ name: p.name, currentImage: p.image_url }))
  })
}
