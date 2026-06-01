import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const seedKey = url.searchParams.get('key')
  const search = url.searchParams.get('q') || ''
  
  if (seedKey !== 'agrihub-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, image_url')
    .or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data })
}
