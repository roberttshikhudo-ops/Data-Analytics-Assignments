import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    const dryRun = url.searchParams.get('dryRun') === 'true'
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get fertilisers-chemicals category
    const { data: fertCategory, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', 'fertilisers-chemicals')
      .single()

    if (catError || !fertCategory) {
      return NextResponse.json({ error: 'Fertilisers & Chemicals category not found', details: catError }, { status: 404 })
    }

    // Get all products in fertilisers-chemicals
    const { data: allProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, created_at')
      .eq('category_id', fertCategory.id)
      .order('name', { ascending: true })

    if (prodError) {
      return NextResponse.json({ error: 'Failed to fetch products', details: prodError }, { status: 500 })
    }

    // The products that have "Protek" prefix in name are duplicates - they were from the old category
    // We want to keep the clean names without "Protek" prefix
    const productsWithProtekPrefix = allProducts?.filter(p => p.name.startsWith('Protek ')) || []
    const productsWithoutPrefix = allProducts?.filter(p => !p.name.startsWith('Protek ') && !p.name.startsWith('Efekto ')) || []

    // Also catch Efekto products that got moved
    const efektoProducts = allProducts?.filter(p => p.name.startsWith('Efekto ')) || []

    if (dryRun) {
      return NextResponse.json({
        message: 'Dry run - no changes made',
        totalProducts: allProducts?.length || 0,
        productsWithProtekPrefix: productsWithProtekPrefix.map(p => p.name),
        productsWithoutPrefix: productsWithoutPrefix.map(p => p.name),
        efektoProducts: efektoProducts.map(p => p.name),
        toDelete: [...productsWithProtekPrefix, ...efektoProducts].map(p => p.name),
      })
    }

    // Delete products with Protek prefix and Efekto products (they're duplicates or non-Protek)
    const toDelete = [...productsWithProtekPrefix, ...efektoProducts]
    const deleteResults: { name: string; status: string }[] = []

    for (const product of toDelete) {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (deleteError) {
        deleteResults.push({ name: product.name, status: 'error' })
      } else {
        deleteResults.push({ name: product.name, status: 'deleted' })
      }
    }

    return NextResponse.json({
      message: `Deleted ${deleteResults.filter(r => r.status === 'deleted').length} duplicate/non-Protek products`,
      remainingProducts: productsWithoutPrefix.length,
      deleteResults,
    })
  } catch (error) {
    console.error('Error cleaning up duplicates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
