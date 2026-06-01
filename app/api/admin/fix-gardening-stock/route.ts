import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (key !== 'agrihub-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First, get the gardening-tools category
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'gardening-tools')
      .single()

    if (catError || !category) {
      return NextResponse.json({ error: 'Category not found', catError }, { status: 404 })
    }

    // Get all products in gardening-tools with 0 or null stock
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('category_id', category.id)
      .or('stock_quantity.is.null,stock_quantity.eq.0')

    if (prodError) {
      return NextResponse.json({ error: 'Failed to get products', prodError }, { status: 500 })
    }

    const updates = []
    
    // Update each product to have stock of 50
    for (const product of products || []) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: 50 })
        .eq('id', product.id)

      if (updateError) {
        updates.push({ name: product.name, status: 'error', error: updateError.message })
      } else {
        updates.push({ name: product.name, status: 'updated', old_stock: product.stock_quantity, new_stock: 50 })
      }
    }

    // Also update ALL products in gardening tools regardless of current stock to ensure none are out of stock
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('category_id', category.id)

    if (!allError && allProducts) {
      for (const product of allProducts) {
        if (product.stock_quantity === null || product.stock_quantity === 0 || product.stock_quantity < 10) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: 50 })
            .eq('id', product.id)

          if (!updateError && !updates.find(u => u.name === product.name)) {
            updates.push({ name: product.name, status: 'updated', old_stock: product.stock_quantity, new_stock: 50 })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      category_id: category.id,
      products_updated: updates.length,
      updates
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 })
  }
}
