import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], categories: [] })
    }

    const supabase = await createClient()

    // Search products using ilike for partial matching
    let productsQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        compare_at_price,
        image_url,
        is_active,
        is_featured,
        is_new,
        short_description,
        description,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
      .order('is_featured', { ascending: false })
      .order('name')
      .limit(limit)

    // Filter by category if provided
    if (category) {
      productsQuery = productsQuery.eq('categories.slug', category)
    }

    const { data: products, error: productsError } = await productsQuery

    if (productsError) {
      console.error('Search error:', productsError)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Also search categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(5)

    return NextResponse.json({
      products: products || [],
      categories: categories || [],
      query,
      total: products?.length || 0
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
