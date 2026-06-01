import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Protek products from the provided price list
const protekProducts = [
  { name: 'Alphathrin 50ml', price: 158, description: 'Protek Alphathrin insecticide 50ml - Effective broad-spectrum insecticide for pest control.' },
  { name: 'Avi Gard 100ml', price: 98, description: 'Protek Avi Gard 100ml - Bird repellent and protection solution.' },
  { name: 'CarbaKil 200g', price: 109, description: 'Protek CarbaKil Dusting Powder 200g - Effective against fleas, ticks, and other parasites on pets.' },
  { name: 'Clear Pave 100ml', price: 93, description: 'Protek Clear Pave 100ml - Herbicide for clearing unwanted vegetation from paved areas.' },
  { name: 'Complete 350 SC 50ml', price: 201, description: 'Protek Complete 350 SC 50ml - Complete insecticide solution for comprehensive pest control.' },
  { name: 'Copper-Flow Plus 100ml', price: 122, description: 'Protek Copper-Flow Plus 100ml - Bactericide and fungicide for disease control in plants.' },
  { name: 'Cypermethrin 1L', price: 230, description: 'Protek Cypermethrin/Kemprin EC 1L - Professional-grade insecticide for agricultural and domestic use.' },
  { name: 'Fumigation Tablets for Insects', price: 123, description: 'Protek Fumigation Tablets - Effective insect fumigation tablets for enclosed spaces.' },
  { name: 'General Fertilizer 2:3:2 (14) 10kg', price: 333, description: 'Protek General Fertilizer 2:3:2 (14) 10kg - Ideal for flowers, shrubs, and vegetables. Contains 40g/kg N, 60g/kg P, 40g/kg K.' },
  { name: 'General Fertilizer 2:3:2 (14) 2kg', price: 105, description: 'Protek General Fertilizer 2:3:2 (14) 2kg - Ideal for flowers, shrubs, and vegetables. Contains 40g/kg N, 60g/kg P, 40g/kg K.' },
  { name: 'General Fertilizer 2:3:2 (14) 5kg', price: 205, description: 'Protek General Fertilizer 2:3:2 (14) 5kg - Ideal for flowers, shrubs, and vegetables. Contains 40g/kg N, 60g/kg P, 40g/kg K.' },
  { name: 'Kill-All Pellets 50g', price: 35, description: 'Protek Kill-All Rat & Mouse Pellets 50g - Effective rodent control pellets for indoor use.' },
  { name: 'Kill-All Wax Blocks 85g', price: 63, description: 'Protek Kill-All Rat & Mouse Wax Blocks 85g - Weather-resistant rodent bait blocks.' },
  { name: 'Knox Ant 50ml', price: 123, description: 'Protek Knox Ant 50ml - Targeted ant control solution for indoor and outdoor use.' },
  { name: 'Knox Flea 100ml', price: 201, description: 'Protek Knox Flea 100ml - Effective flea control treatment.' },
  { name: 'Knox Roach 100ml', price: 201, description: 'Protek Knox Roach 100ml - Cockroach control solution for home and commercial use.' },
  { name: 'Knox Worm 50ml', price: 122, description: 'Protek Knox Worm 50ml - Worm and caterpillar control for gardens and crops.' },
  { name: 'NitroGreen KAN/LAN 17% 10kg', price: 449, description: 'Protek NitroGreen KAN/LAN 17% 10kg - Nitrogen fertilizer containing 170g/kg N. Ideal for lawns, vegetables, and fruit trees.' },
  { name: 'NitroGreen KAN/LAN 17% 2kg', price: 128, description: 'Protek NitroGreen KAN/LAN 17% 2kg - Nitrogen fertilizer containing 170g/kg N. Ideal for lawns, vegetables, and fruit trees.' },
  { name: 'NitroGreen KAN/LAN 17% 5kg', price: 240, description: 'Protek NitroGreen KAN/LAN 17% 5kg - Nitrogen fertilizer containing 170g/kg N. Ideal for lawns, vegetables, and fruit trees.' },
  { name: 'Mycoguard 720 SC 100ml', price: 177, description: 'Protek Mycoguard 720 SC 100ml - Contact fungicide for lawn and garden disease control.' },
  { name: 'Nuvan Profi 330ml', price: 226, description: 'Protek Nuvan Profi Fumigation Fogger 330ml - Rapid-acting fumigation aerosol for indoor pest control.' },
  { name: 'Rodex Grain 100g', price: 35, description: 'Protek Rodex Rat & Mouse Grain Bait 100g - Highly palatable grain bait for rodent control.' },
  { name: 'Scatterkill for Insects 1kg', price: 185, description: 'Protek Scatterkill 1kg - Granular insecticide for broad-spectrum insect control.' },
  { name: 'Spray-Kill 1 50ml', price: 69, description: 'Protek Spray-Kill 1 50ml - For ants, harvester termites, crickets, brown locusts, and cockroaches.' },
  { name: 'Spray-Kill 3 50ml', price: 69, description: 'Protek Spray-Kill 3 50ml - For aphids, beetles, moths, scale, thrips, and white fly.' },
  { name: 'Spray-Kill 5 50ml', price: 69, description: 'Protek Spray-Kill 5 50ml - For fruit fly control.' },
  { name: 'Terminex 350 SC 500ml', price: 875, description: 'Protek Terminex 350 SC 500ml - Professional termite control concentrate. Covers up to 130m².' },
  { name: 'Terminex 350 SC 50ml', price: 358, description: 'Protek Terminex 350 SC 50ml - Termite control concentrate for building protection.' },
  { name: 'Triclon 50ml', price: 247, description: 'Protek Triclon 50ml - Herbicide for unwanted trees and shrubs.' },
  { name: 'Two-Step 500ml', price: 254, description: 'Protek Two-Step Advanced Weed Killer 500ml - Systemic herbicide for effective weed control.' },
]

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get fertilisers-chemicals category
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', 'fertilisers-chemicals')
      .single()

    if (catError || !category) {
      return NextResponse.json({ error: 'Fertilisers & Chemicals category not found', details: catError }, { status: 404 })
    }

    // Step 1: Delete all existing products in this category
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('category_id', category.id)

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch existing products', details: fetchError }, { status: 500 })
    }

    const deletedCount = existingProducts?.length || 0

    if (existingProducts && existingProducts.length > 0) {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('category_id', category.id)

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to delete existing products', details: deleteError }, { status: 500 })
      }
    }

    // Step 2: Add all Protek products
    const results: { name: string; status: string; message: string }[] = []

    for (const product of protekProducts) {
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          slug: generateSlug(product.name),
          price: product.price,
          category_id: category.id,
          stock_quantity: 100,
          description: product.description,
          brand: 'Protek',
          supplier: 'Protek',
          is_active: true,
          is_new: true,
        })

      if (insertError) {
        results.push({ name: product.name, status: 'error', message: insertError.message })
      } else {
        results.push({ name: product.name, status: 'success', message: 'Added successfully' })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      message: `Deleted ${deletedCount} old products. Added ${successCount} Protek products, errors: ${errorCount}`,
      categoryId: category.id,
      categoryName: category.name,
      deletedProducts: deletedCount,
      addedProducts: successCount,
      results,
    })
  } catch (error) {
    console.error('Error replacing products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
