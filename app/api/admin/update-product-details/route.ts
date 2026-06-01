import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, description, short_description } = await request.json()

    if (!id && !name) {
      return NextResponse.json({ error: 'Missing id or name' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const updateData: Record<string, string> = {}
    if (description) updateData.description = description
    if (short_description) updateData.short_description = short_description

    let query = supabase.from('products').update(updateData)
    
    if (id) {
      query = query.eq('id', id)
    } else if (name) {
      query = query.ilike('name', `%${name}%`)
    }

    const { data, error } = await query.select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No product found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, updated: data.length, products: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
