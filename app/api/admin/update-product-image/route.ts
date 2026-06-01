import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, name, image_url, new_name, new_slug, description, price, category } = await request.json()

    if ((!slug && !name)) {
      return NextResponse.json({ error: 'Missing slug or name to identify product' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Build update object with provided fields
    const updateData: Record<string, unknown> = {}
    if (image_url) updateData.image_url = image_url
    if (new_name) {
      updateData.name = new_name
      updateData.slug = new_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    if (new_slug) updateData.slug = new_slug
    if (description) updateData.description = description
    if (price !== undefined) updateData.price = price
    
    // Handle category change by slug
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      if (categoryData) {
        updateData.category_id = categoryData.id
      }
    }

    let query = supabase.from('products').update(updateData)
    
    if (slug) {
      query = query.eq('slug', slug)
    } else if (name) {
      // First try exact match, then partial match
      const { data: exactMatch } = await supabase
        .from('products')
        .select('slug')
        .ilike('name', name)
        .single()
      
      if (exactMatch) {
        query = query.eq('slug', exactMatch.slug)
      } else {
        query = query.ilike('name', `%${name}%`)
      }
    }

    const { data, error } = await query.select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No product found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
