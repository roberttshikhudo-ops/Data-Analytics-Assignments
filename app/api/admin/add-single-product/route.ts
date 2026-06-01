import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productData = await request.json()

    if (!productData.name || !productData.price) {
      return NextResponse.json({ error: 'Missing name or price' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Generate slug from name
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Get or create category if provided
    let category_id = null
    if (productData.category) {
      const { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', productData.category)
        .single()

      if (existingCat) {
        category_id = existingCat.id
      } else {
        const catSlug = productData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const { data: newCat } = await supabase
          .from('categories')
          .insert({ name: productData.category, slug: catSlug })
          .select('id')
          .single()
        category_id = newCat?.id
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        slug,
        description: productData.description || null,
        price: productData.price,
        sku: productData.sku || `SKU-${Date.now()}`,
        stock_quantity: productData.stock_quantity || 100,
        is_active: true,
        image_url: productData.image_url || null,
        category_id,
        brand: productData.brand || null,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
