import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Free Unsplash images mapped to product keywords
const imageMap: Record<string, string> = {
  // Kitchen & Cookware
  'pot': 'https://images.unsplash.com/photo-1584990347449-a8f1d0f7b4a4?w=500&q=80',
  'pots': 'https://images.unsplash.com/photo-1584990347449-a8f1d0f7b4a4?w=500&q=80',
  'cast iron': 'https://images.unsplash.com/photo-1585442231711-f54f912a3799?w=500&q=80',
  'kettle': 'https://images.unsplash.com/photo-1594213114663-d94db9760a5e?w=500&q=80',
  'knife': 'https://images.unsplash.com/photo-1566454419290-57a64afe1e5b?w=500&q=80',
  'cutlery': 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=500&q=80',
  'spoon': 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=500&q=80',
  'plate': 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=500&q=80',
  'dinner set': 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=500&q=80',
  'bread bin': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80',
  'food storage': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&q=80',
  'container': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&q=80',
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
  'mixer': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  'blender': 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&q=80',
  'juicer': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&q=80',
  'cereal': 'https://images.unsplash.com/photo-1517456215183-9a2c3a1f7c93?w=500&q=80',
  'dispenser': 'https://images.unsplash.com/photo-1517456215183-9a2c3a1f7c93?w=500&q=80',
  'spice': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80',
  'dish rack': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
  'apron': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80',
  'chopper': 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=500&q=80',
  'cutter': 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=500&q=80',
  'vacuum': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80',
  'chaffing': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500&q=80',
  'serving': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500&q=80',
  'fruit basket': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&q=80',
  'bakeware': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
  'tray': 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=500&q=80',
  'bamboo': 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=500&q=80',
  
  // Bedroom & Bedding
  'bed': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80',
  'bedspread': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80',
  'comforter': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80',
  'quilt': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80',
  'blanket': 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500&q=80',
  'throw': 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500&q=80',
  'pillow': 'https://images.unsplash.com/photo-1592789705501-f9ae4278a9c9?w=500&q=80',
  'curtain': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80',
  
  // Bathroom
  'bathroom': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&q=80',
  'shower': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&q=80',
  'towel': 'https://images.unsplash.com/photo-1583845112203-29329902332e?w=500&q=80',
  
  // Bags & Accessories
  'bag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
  'backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
  'tote': 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500&q=80',
  'weekender': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
  'travel': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
  
  // Outdoor & Camping
  'cooler': 'https://images.unsplash.com/photo-1532635248-cdd3d399f56c?w=500&q=80',
  'grill': 'https://images.unsplash.com/photo-1529262363204-6e5a4d0b12e8?w=500&q=80',
  'charcoal': 'https://images.unsplash.com/photo-1529262363204-6e5a4d0b12e8?w=500&q=80',
  'chair': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
  'folding chair': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&q=80',
  'table': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&q=80',
  'camping': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&q=80',
  'outdoor': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&q=80',
  'gas': 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=500&q=80',
  'stove': 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=500&q=80',
  'braai': 'https://images.unsplash.com/photo-1529262363204-6e5a4d0b12e8?w=500&q=80',
  
  // Electronics & Appliances
  'fan': 'https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?w=500&q=80',
  'ice bucket': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
  'fridge': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80',
  'car fridge': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80',
  'temperature': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
  'cup': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
  'mug': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
  'stanley': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
  
  // Footwear
  'sandal': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&q=80',
  'crocs': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&q=80',
  'slippers': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&q=80',
  
  // Home Decor
  'carpet': 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=500&q=80',
  'rug': 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=500&q=80',
  'wallpaper': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
  
  // Laundry
  'washing': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80',
  'laundry': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80',
  'basket': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80',
  
  // Hats & Accessories
  'hat': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&q=80',
  'bucket hat': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&q=80',
  
  // Kids
  'kids': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80',
  'character': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80',
  
  // Food & Drinks
  'warmer': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
  'food warmer': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
  'insulated': 'https://images.unsplash.com/photo-1532635248-cdd3d399f56c?w=500&q=80',
  
  // Default fallback
  'default': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
}

function findBestImage(productName: string): string {
  const nameLower = productName.toLowerCase()
  
  // Check for exact/partial matches
  for (const [keyword, url] of Object.entries(imageMap)) {
    if (keyword !== 'default' && nameLower.includes(keyword)) {
      return url
    }
  }
  
  return imageMap['default']
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get all products without images
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .or('image_url.is.null,image_url.eq.')
      .order('name')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ 
        message: 'All products already have images',
        updated: 0 
      })
    }

    const updates = []
    const results = []

    for (const product of products) {
      const imageUrl = findBestImage(product.name)
      
      const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', product.id)

      if (!error) {
        updates.push(product.name)
        results.push({ name: product.name, image: imageUrl, status: 'success' })
      } else {
        results.push({ name: product.name, status: 'failed', error: error.message })
      }
    }

    return NextResponse.json({
      message: `Updated ${updates.length} products with images`,
      updated: updates.length,
      total: products.length,
      products: results
    })

  } catch (error) {
    console.error('Auto-image error:', error)
    return NextResponse.json({ error: 'Failed to add images' }, { status: 500 })
  }
}
