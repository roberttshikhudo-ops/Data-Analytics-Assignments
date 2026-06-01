import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get gardening tools category
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', '%gardening%tool%')
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Gardening Tools category not found' }, { status: 404 })
    }

    const gardenProducts = [
      { name: 'Lasher 5 Prong Wooden Handle Digging Fork', price: 899.99, in_store_only: true },
      { name: 'Lasher Gardening Starter Kit Combo', price: 759.99, in_store_only: false },
      { name: 'Lasher Double Edge Pruning Saw 410mm', price: 259.99, in_store_only: false },
      { name: 'Lasher Spade Square Nose Steel Shaft', price: 599.99, in_store_only: true },
      { name: 'Lasher Ecobarrow Wheelbarrow', price: 1789.99, in_store_only: true },
      { name: 'Lasher Garden Tool Set 3 Piece', price: 759.99, in_store_only: false },
      { name: 'Lawnstar MiniMo Replacement Blade LSM 1200', price: 299.00, in_store_only: true },
      { name: 'Lawnstar Chainsaw Chain LSS 2440 SDS & LSP', price: 186.40, in_store_only: true, on_promotion: true },
      { name: 'Lawnstar Chainsaw Chain Petrol LSPS 4545', price: 312.00, in_store_only: true, on_promotion: true },
      { name: 'Lawnstar Replacement Cutting Head Petrol Trimmers', price: 439.99, in_store_only: true },
      { name: 'Kaufmann 6pc Watering Set', price: 212.00, in_store_only: false },
      { name: 'Kaufmann Adjustable Brass Sprinkler 15mm', price: 194.00, in_store_only: false },
      { name: 'Kaufmann Impulse Sprinkler', price: 187.00, in_store_only: false },
      { name: 'Kaufmann Adjustable Pressure Sprayer 8L', price: 275.00, in_store_only: false },
      { name: 'Kaufmann Pressure Sprayer 4L', price: 195.00, in_store_only: false },
      { name: 'Kaufmann Knapsack Sprayer 16L', price: 495.00, in_store_only: false },
      { name: 'Armadillo Garden Hose with Fittings 20mm 30m', price: 395.00, in_store_only: false },
      { name: 'Armadillo Garden Hose with Fittings 20mm 20m', price: 295.00, in_store_only: false },
      { name: 'Gardena Comfort HighFlex Hose 13mm x 30m', price: 995.00, in_store_only: false },
      { name: 'Gardena Comfort HighFlex Hose 13mm x 20m', price: 695.00, in_store_only: false },
      { name: 'Gardena Hose Connector 13mm', price: 85.00, in_store_only: false },
      { name: 'Shovel Round Nose', price: 165.00, in_store_only: false },
      { name: 'Shovel Square Nose', price: 175.00, in_store_only: false },
      { name: 'Spade Square Mouth', price: 185.00, in_store_only: false },
      { name: 'Spade Round Mouth', price: 175.00, in_store_only: false },
      { name: 'Garden Fork 4 Prong', price: 195.00, in_store_only: false },
      { name: 'Hoe Flat Blade', price: 125.00, in_store_only: false },
      { name: 'Hoe Prong 3 Prong', price: 145.00, in_store_only: false },
      { name: 'Hoe Prong 4 Prong', price: 165.00, in_store_only: false },
      { name: 'Hoe Prong 5 Prong', price: 185.00, in_store_only: false },
      { name: 'Rake Lawn Metal', price: 125.00, in_store_only: false },
      { name: 'Rake Lawn Plastic', price: 85.00, in_store_only: false },
      { name: 'Rake Garden 12 Teeth', price: 125.00, in_store_only: false },
      { name: 'Rake Garden 14 Teeth', price: 145.00, in_store_only: false },
      { name: 'Lopper Long Handle', price: 295.00, in_store_only: false },
      { name: 'Pruning Shears Bypass', price: 145.00, in_store_only: false },
      { name: 'Pruning Shears Anvil', price: 135.00, in_store_only: false },
      { name: 'Hedge Shears', price: 225.00, in_store_only: false },
      { name: 'Weeder Hand', price: 35.00, in_store_only: false },
      { name: 'Fork Hand', price: 45.00, in_store_only: false },
      { name: 'Trowel Hand', price: 45.00, in_store_only: false },
      { name: 'Cultivator Hand 3 Prong', price: 55.00, in_store_only: false },
      { name: 'Wheelbarrow 65L Builder', price: 899.00, in_store_only: false },
      { name: 'Wheelbarrow 80L Builder', price: 1099.00, in_store_only: false },
      { name: 'Wheelbarrow Concrete Eagle Assembled', price: 999.00, in_store_only: false },
      { name: 'Wheelbarrow Light Duty 65L Max Load 60kg', price: 595.00, in_store_only: false },
      { name: 'Garden Gloves Rubber', price: 55.00, in_store_only: false },
      { name: 'Garden Gloves Leather', price: 95.00, in_store_only: false },
      { name: 'Garden Gloves Cotton', price: 35.00, in_store_only: false },
      { name: 'Kneeling Pad Garden', price: 65.00, in_store_only: false },
      { name: 'Plant Ties 100 Pack', price: 45.00, in_store_only: false },
      { name: 'Garden Twine 200m', price: 55.00, in_store_only: false },
      { name: 'Sebor Watering Can 1L Teal', price: 45.00, in_store_only: false },
    ]

    const results: { name: string; status: string; message: string }[] = []

    for (const product of gardenProducts) {
      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .ilike('name', product.name)
        .single()

      if (existing) {
        results.push({ name: product.name, status: 'skipped', message: 'Already exists' })
        continue
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          slug: generateSlug(product.name),
          price: product.price,
          category_id: category.id,
          stock_quantity: 50,
          description: `High quality ${product.name} for your gardening needs.${product.in_store_only ? ' Available in-store only.' : ''}`,
          is_active: true,
        })

      if (insertError) {
        results.push({ name: product.name, status: 'error', message: insertError.message })
      } else {
        results.push({ name: product.name, status: 'success', message: 'Added successfully' })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const skippedCount = results.filter(r => r.status === 'skipped').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      message: `Added ${successCount} products, skipped ${skippedCount}, errors ${errorCount}`,
      results,
    })
  } catch (error) {
    console.error('Error adding products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
