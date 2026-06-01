import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // First, get ALL categories to see what exists
    const { data: allCategories } = await supabaseAdmin
      .from('categories')
      .select('*')
    
    console.log('All categories:', allCategories?.map(c => ({ id: c.id, name: c.name })))

    // Find all seed-related categories with broader matching
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .or('name.ilike.%seed%,name.ilike.%mbeu%,slug.ilike.%seed%,slug.ilike.%mbeu%')

    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 500 })
    }

    console.log('Found categories:', categories)

    if (!categories || categories.length === 0) {
      return NextResponse.json({ message: 'No seed categories found' })
    }

    // Check if our target category already exists
    const targetCategoryName = 'Seeds (Vegetables and Mbeu)'
    const targetSlug = 'seeds-vegetables-and-mbeu'
    
    let targetCategory = categories.find(c => c.name === targetCategoryName)
    
    if (!targetCategory) {
      // Create the new combined category
      const { data: newCat, error: createError } = await supabaseAdmin
        .from('categories')
        .insert({
          name: targetCategoryName,
          slug: targetSlug,
          description: 'Quality vegetable seeds and Mbeu for your garden and farm'
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
      
      targetCategory = newCat
    }

    // Get all category IDs to merge (excluding the target)
    const categoryIdsToMerge = categories
      .filter(c => c.id !== targetCategory.id)
      .map(c => c.id)

    // Update all products from old categories to the new one
    let totalUpdated = 0
    for (const catId of categoryIdsToMerge) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('products')
        .update({ category_id: targetCategory.id })
        .eq('category_id', catId)
        .select()

      if (updateError) {
        console.error('Error updating products for category', catId, updateError)
      } else if (updated) {
        totalUpdated += updated.length
      }
    }

    // Delete old categories
    const { error: deleteError } = await supabaseAdmin
      .from('categories')
      .delete()
      .in('id', categoryIdsToMerge)

    if (deleteError) {
      console.error('Error deleting old categories:', deleteError)
    }

    return NextResponse.json({
      success: true,
      message: `Merged ${categories.length} seed categories into "${targetCategoryName}"`,
      categoriesMerged: categories.map(c => c.name),
      productsUpdated: totalUpdated,
      newCategory: targetCategory
    })

  } catch (error) {
    console.error('Error merging categories:', error)
    return NextResponse.json({ error: 'Failed to merge categories' }, { status: 500 })
  }
}
