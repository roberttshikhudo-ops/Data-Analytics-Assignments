import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('category')

  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      image_url,
      categories!inner(name, slug)
    `)
    .order('name')

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }

  const { data: products, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Categorize products by image type
  const withLocalImages = products?.filter(p => p.image_url?.startsWith('/products/')) || []
  const withExternalImages = products?.filter(p => p.image_url && !p.image_url.startsWith('/products/') && !p.image_url.includes('blob.vercel')) || []
  const withBlobImages = products?.filter(p => p.image_url?.includes('blob.vercel')) || []
  const withoutImages = products?.filter(p => !p.image_url) || []

  return NextResponse.json({
    total: products?.length || 0,
    summary: {
      localGenerated: withLocalImages.length,
      externalReal: withExternalImages.length,
      blobUploaded: withBlobImages.length,
      noImage: withoutImages.length
    },
    productsWithLocalImages: withLocalImages.map(p => ({ name: p.name, image_url: p.image_url })),
    productsWithExternalImages: withExternalImages.map(p => ({ name: p.name, image_url: p.image_url })),
  })
}
