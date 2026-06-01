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

    // Get fertilisers & chemicals category
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', '%fertilis%chemical%')
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Fertilisers & Chemicals category not found' }, { status: 404 })
    }

    // Products from the Agri Hub Product List
    const fertilizerProducts = [
      // KAN/LAN Fertilizers
      { name: 'KAN 17% 2kg', price: 128, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DeuQul1NHekvdiCN33Kwco25JE4Qvf.png' },
      { name: 'KAN 17% 5kg', price: 240, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DeuQul1NHekvdiCN33Kwco25JE4Qvf.png' },
      { name: 'KAN 17% 10kg', price: 449, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DeuQul1NHekvdiCN33Kwco25JE4Qvf.png' },
      
      // General Fertilizer 2:3:2
      { name: 'General Fertilizer 2:3:2 (14) 2kg', price: 105, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KQ1Z8ARjLOOdFzKCFEczRSAcuLhF43.png' },
      { name: 'General Fertilizer 2:3:2 14 5kg', price: 205, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KQ1Z8ARjLOOdFzKCFEczRSAcuLhF43.png' },
      { name: 'General Fertilizer 2:3:2 14 10kg', price: 333, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KQ1Z8ARjLOOdFzKCFEczRSAcuLhF43.png' },
      
      // Doom Products
      { name: 'Doom Insect Spray Flying Xtreme 300ml', price: 87, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001085_7fb0142aaf92411dfbf17b69cc5403c3.jpg' },
      { name: 'Doom Insect Spray Super 300ml', price: 86, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001096_10226d1858fe3bfea8fb9e28f72580a7.jpg' },
      { name: 'Doom Rodent Pellets Rattex 100g', price: 35, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001306_c90fac719d693fcca42f34a084dfb153.jpg' },
      
      // Kill-all Products
      { name: 'Kill-all Pellets 50g', price: 35, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/c/6/c640kill00050.jpg' },
      { name: 'Kill-all Wax Blocks 85g', price: 63, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/c/6/c640kill00085.jpg' },
      
      // Rodex
      { name: 'Rodex Grain 100g', price: 35, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001306_c90fac719d693fcca42f34a084dfb153.jpg' },
      
      // Round Up Products
      { name: 'Round Up 360 1L', price: 293, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-f5PGF8zLWbMomlr7dRIjfN5IEU9srg.png' },
      { name: 'Round Up 360 5L', price: 1090, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-f5PGF8zLWbMomlr7dRIjfN5IEU9srg.png' },
      { name: 'Round Up Powermax 1L', price: 305, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-f5PGF8zLWbMomlr7dRIjfN5IEU9srg.png' },
      
      // Alphathrin
      { name: 'Alphathrin 50ml', price: 158, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001096_10226d1858fe3bfea8fb9e28f72580a7.jpg' },
      
      // Cypermethrin
      { name: 'Cypermethrin 1L', price: 230, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001096_10226d1858fe3bfea8fb9e28f72580a7.jpg' },
      
      // Delete All
      { name: 'Delete All (for Makupa)', price: 339, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001077_2250bb82557dda8c10909f803adbaa06.jpg' },
      
      // Karbadust
      { name: 'Karbadust 5% 200g', price: 129, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001077_2250bb82557dda8c10909f803adbaa06.jpg' },
      { name: 'Karbadust 5% 500g', price: 116, image_url: 'https://www.agrinet.co.za/api/klevu_images/200X200/g/8/g8001077_2250bb82557dda8c10909f803adbaa06.jpg' },
      
      // Copper Flow Plus
      { name: 'Copper-flow-plus 100ml', price: 115, image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qS6IG7ICYdwTYGTQiJqkLvUHp9iU2J.png' },
    ]

    const results: { name: string; status: string; message: string }[] = []

    for (const product of fertilizerProducts) {
      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .ilike('name', `%${product.name.replace(/[%]/g, '')}%`)
        .single()

      if (existing) {
        // Update price and image if exists
        await supabase
          .from('products')
          .update({ 
            price: product.price, 
            image_url: product.image_url,
            stock_quantity: 50
          })
          .eq('id', existing.id)
        results.push({ name: product.name, status: 'updated', message: 'Updated price and image' })
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
          image_url: product.image_url,
          description: `High quality ${product.name} for agricultural use.`,
          is_active: true,
        })

      if (insertError) {
        results.push({ name: product.name, status: 'error', message: insertError.message })
      } else {
        results.push({ name: product.name, status: 'success', message: 'Added successfully' })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const updatedCount = results.filter(r => r.status === 'updated').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      message: `Added ${successCount} products, updated ${updatedCount}, errors ${errorCount}`,
      results,
    })
  } catch (error) {
    console.error('Error adding products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
