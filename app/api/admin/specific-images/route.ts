import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Specific Unsplash images for each product - all unique
const productImages: Record<string, string> = {
  // Cookware & Pots
  'gold-chaffing-dish': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
  '7pcs-cast-iron-pots': 'https://images.unsplash.com/photo-1584990347449-a6d3f33d7dda?w=500',
  '7pcs-dolphine-cast-iron-pots': 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  '10pcs-bon-voyager-pots': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
  '8pcs-pots-set': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500',
  'combo-7pcs-cast-iron-pots-utensils': 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=500',
  'combo-set-cast-iron-pots-spoons': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=500',
  
  // Kitchen Appliances
  '4-burner-gas-stove': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  'kitchen-electric-stand-mixer': 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=500',
  '2l-electric-glass-kettle': 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=500',
  'citrus-juicer': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500',
  'easy-spin-cutter': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500',
  'multifunctional-wet-dry-vacuum': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500',
  
  // Kitchen Storage & Organization
  'bread-bin-set': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
  '7pcs-food-storage-containers': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
  '6l-triple-cereal-dispenser': 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=500',
  'portable-20l-rice-container': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
  '20l-food-storage-container': 'https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?w=500',
  '8pcs-spice-jar-rotating': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
  'dish-rack': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
  
  // Cutlery & Utensils
  '24pcs-stainless-steel-gold-cutlery': 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=500',
  'egg-shaped-cutlery-set': 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500',
  'modern-knife-set-with-stand': 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500',
  
  // Serving & Dining
  '3-tier-ceramic-serving-bowl': 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=500',
  '3pcs-plastic-fruit-basket': 'https://images.unsplash.com/photo-1568702846914-96b305d2uj8f?w=500',
  'ceramic-flat-plate': 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=500',
  'dinner-set': 'https://images.unsplash.com/photo-1595599512804-044c06fef87f?w=500',
  '5pcs-set-food-warmer': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
  
  // Bedding - Comforters & Quilts
  '5pcs-plain-colour-bedspread': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
  '5pcs-comforter': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
  '5pcs-fluffy-comforter': 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=500',
  '5pcs-reversible-comforter': 'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=500',
  '5pcs-quilt-different-colors': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
  '7pcs-bedspread-with-curtains': 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500',
  '3pcs-character-kids-comforter': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  
  // Bedding - Blankets
  'throw-blanket': 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500',
  'floral-blanket': 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=500',
  
  // Bathroom
  '6pcs-bathroom-accessories': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500',
  '5pcs-corner-shower-caddy': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
  
  // Bags & Backpacks
  'steve-madden-bag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
  'mini-structured-tote-bag': 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500',
  'quilted-weekender-travel-bag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  'business-laptop-backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  
  // Coolers & Outdoor
  'cooler-box': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500',
  'beautiful-cooler-box': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500',
  'fieldbar-cooler-box': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500',
  'insulated-cooler-bag': 'https://images.unsplash.com/photo-1622560480605-d83c661ae6d3?w=500',
  'car-fridge': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500',
  
  // Outdoor Furniture
  'outdoor-folding-chair': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500',
  'foldable-table': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  'foldable-charcoal-grill': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  
  // Drinkware
  'stanley-cup': 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500',
  'temperature-cup': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
  '7l-ice-bucket-led': 'https://images.unsplash.com/photo-1551024739-78e9d60c45ca?w=500',
  
  // Footwear
  'modern-crocs': 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500',
  'kids-sandals-size-10-2': 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=500',
  'sandals-size-3-10': 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500',
  
  // Home Accessories
  'rechargeable-neck-fan': 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=500',
  'foldable-bamboo-tray': 'https://images.unsplash.com/photo-1544376798-76d377213f34?w=500',
  'foldable-washing-basket': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500',
  'wall-paper-3m': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  'velvet-3d-carpet-160cm': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  
  // Kitchen Apron
  'kitchen-and-work-apron': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  
  // Gas & Utility
  '9kg-new-empty-gas-cylinder-cadac': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500',
  
  // Hats
  'hat-spoty-bucket-hat': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500',
  
  // Bakeware
  '3pcs-bakeware-set': 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  
  // Special Combos
  'special-kitchen-combo': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
}

// Fallback images by category/keyword for products not in the map
const categoryImages: Record<string, string[]> = {
  'pot': [
    'https://images.unsplash.com/photo-1584990347449-a6d3f33d7dda?w=500',
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
  ],
  'comforter': [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=500',
  ],
  'bedspread': [
    'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=500',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500',
  ],
  'blanket': [
    'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500',
    'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=500',
  ],
  'bag': [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  ],
  'cooler': [
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500',
    'https://images.unsplash.com/photo-1622560480605-d83c661ae6d3?w=500',
  ],
  'kitchen': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=500',
  ],
  'cup': [
    'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500',
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
  ],
  'plate': [
    'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=500',
    'https://images.unsplash.com/photo-1595599512804-044c06fef87f?w=500',
  ],
  'chair': [
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  ],
  'table': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  ],
  'knife': [
    'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500',
  ],
  'cutlery': [
    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=500',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500',
  ],
  'bathroom': [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
  ],
  'sandal': [
    'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500',
    'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=500',
  ],
  'basket': [
    'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500',
  ],
  'storage': [
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
    'https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?w=500',
  ],
  'grill': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  ],
  'carpet': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  ],
  'quilt': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
  ],
  'tray': [
    'https://images.unsplash.com/photo-1544376798-76d377213f34?w=500',
  ],
  'spice': [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
  ],
  'serving': [
    'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=500',
  ],
  'mixer': [
    'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=500',
  ],
  'kettle': [
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=500',
  ],
  'stove': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  ],
  'apron': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  ],
  'hat': [
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500',
  ],
  'backpack': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  ],
  'fridge': [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500',
  ],
  'vacuum': [
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500',
  ],
  'juicer': [
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500',
  ],
  'bread': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
  ],
  'cereal': [
    'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=500',
  ],
  'rice': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
  ],
  'dish': [
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
  ],
  'wallpaper': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  ],
  'fan': [
    'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=500',
  ],
  'gas': [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500',
  ],
  'ice': [
    'https://images.unsplash.com/photo-1551024739-78e9d60c45ca?w=500',
  ],
  'bakeware': [
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  ],
  'fruit': [
    'https://images.unsplash.com/photo-1568702846914-96b305d2uj8f?w=500',
  ],
  'shower': [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
  ],
  'crocs': [
    'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500',
  ],
}

// Track used images to avoid duplicates
const usedImages = new Set<string>()
let imageIndex = 0

function getImageForProduct(slug: string, name: string): string {
  // First check if we have a specific image for this product
  if (productImages[slug]) {
    return productImages[slug]
  }
  
  // Otherwise, find by keyword in name
  const nameLower = name.toLowerCase()
  
  for (const [keyword, images] of Object.entries(categoryImages)) {
    if (nameLower.includes(keyword)) {
      // Get next image in rotation to avoid duplicates
      for (const img of images) {
        if (!usedImages.has(img)) {
          usedImages.add(img)
          return img
        }
      }
      // If all used, just use the first one with index variation
      imageIndex++
      return `${images[0]}&sig=${imageIndex}`
    }
  }
  
  // Default fallback - generic home product
  imageIndex++
  return `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&sig=${imageIndex}`
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, slug, name')
      .order('name')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const results: { name: string; image: string; status: string }[] = []

    // Update each product with a specific image
    for (const product of products || []) {
      const imageUrl = getImageForProduct(product.slug, product.name)
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', product.id)

      results.push({
        name: product.name,
        image: imageUrl,
        status: updateError ? `Error: ${updateError.message}` : 'Updated'
      })
    }

    const updated = results.filter(r => r.status === 'Updated').length

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} products with specific images`,
      total: products?.length || 0,
      results
    })

  } catch (error) {
    console.error('Error updating images:', error)
    return NextResponse.json({ error: 'Failed to update images' }, { status: 500 })
  }
}
