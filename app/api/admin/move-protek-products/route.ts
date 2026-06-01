import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Known Protek product name patterns to identify
const protekPatterns = [
  'alphathrin', 'avi gard', 'carbakil', 'clear pave', 'complete 350',
  'copper-flow', 'copper flow', 'cypermethrin', 'kemprin', 'fumigation tablets',
  'general fertilizer', 'general fertiliser', 'kill-all', 'kill all', 'killall',
  'knox ant', 'knox flea', 'knox roach', 'knox worm', 'nitrogreen', 'kan/lan',
  'mycoguard', 'nuvan profi', 'rodex', 'scatterkill', 'spray-kill', 'spray kill',
  'terminex', 'triclon', 'two-step', 'two step', 'protek'
]

function isProtekProduct(productName: string): boolean {
  const nameLower = productName.toLowerCase()
  return protekPatterns.some(pattern => nameLower.includes(pattern))
}

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

    // Get all categories
    const { data: allCategories, error: allCatError } = await supabase
      .from('categories')
      .select('id, name, slug')

    if (allCatError) {
      return NextResponse.json({ error: 'Failed to fetch categories', details: allCatError }, { status: 500 })
    }

    // Get all products NOT in fertilisers-chemicals
    const { data: allProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, category_id, brand, supplier')
      .neq('category_id', fertCategory.id)

    if (prodError) {
      return NextResponse.json({ error: 'Failed to fetch products', details: prodError }, { status: 500 })
    }

    // Find Protek products in other categories
    const protekProductsInOtherCategories = allProducts?.filter(product => {
      // Check by brand/supplier
      if (product.brand?.toLowerCase() === 'protek' || product.supplier?.toLowerCase() === 'protek') {
        return true
      }
      // Check by name pattern
      return isProtekProduct(product.name)
    }) || []

    // Get existing products in fertilisers-chemicals to check for duplicates
    const { data: existingFertProducts, error: fertProdError } = await supabase
      .from('products')
      .select('name')
      .eq('category_id', fertCategory.id)

    if (fertProdError) {
      return NextResponse.json({ error: 'Failed to fetch fertiliser products', details: fertProdError }, { status: 500 })
    }

    const existingNames = new Set(existingFertProducts?.map(p => p.name.toLowerCase()) || [])

    // Categorize found products
    const productsToMove: { id: string; name: string; fromCategory: string; action: string }[] = []
    const productsToDelete: { id: string; name: string; fromCategory: string; reason: string }[] = []

    for (const product of protekProductsInOtherCategories) {
      const category = allCategories?.find(c => c.id === product.category_id)
      const categoryName = category?.name || 'Unknown'
      
      // Check if product already exists in fertilisers-chemicals
      if (existingNames.has(product.name.toLowerCase())) {
        productsToDelete.push({
          id: product.id,
          name: product.name,
          fromCategory: categoryName,
          reason: 'Duplicate - already exists in Fertilisers & Chemicals'
        })
      } else {
        productsToMove.push({
          id: product.id,
          name: product.name,
          fromCategory: categoryName,
          action: 'Move to Fertilisers & Chemicals'
        })
        existingNames.add(product.name.toLowerCase()) // Prevent moving duplicates
      }
    }

    if (dryRun) {
      return NextResponse.json({
        message: 'Dry run - no changes made',
        fertilizerCategoryId: fertCategory.id,
        protekProductsFound: protekProductsInOtherCategories.length,
        productsToMove,
        productsToDelete,
      })
    }

    // Execute moves
    const moveResults: { name: string; status: string; message: string }[] = []
    
    for (const product of productsToMove) {
      const { error: moveError } = await supabase
        .from('products')
        .update({ category_id: fertCategory.id })
        .eq('id', product.id)

      if (moveError) {
        moveResults.push({ name: product.name, status: 'error', message: moveError.message })
      } else {
        moveResults.push({ name: product.name, status: 'moved', message: `Moved from ${product.fromCategory}` })
      }
    }

    // Execute deletes (duplicates)
    const deleteResults: { name: string; status: string; message: string }[] = []
    
    for (const product of productsToDelete) {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (deleteError) {
        deleteResults.push({ name: product.name, status: 'error', message: deleteError.message })
      } else {
        deleteResults.push({ name: product.name, status: 'deleted', message: product.reason })
      }
    }

    return NextResponse.json({
      message: `Moved ${moveResults.filter(r => r.status === 'moved').length} products, deleted ${deleteResults.filter(r => r.status === 'deleted').length} duplicates`,
      moveResults,
      deleteResults,
    })
  } catch (error) {
    console.error('Error moving Protek products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
