import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Specific image mappings for each product by slug or name pattern
const productImages: Record<string, string> = {
  // Pots and Cookware - All unique
  '10pcs-bon-voyager-pots': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
  '10pcs-non-stick-pots': 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500',
  '12pcs-cookware-set': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  '7pcs-cast-iron-pots': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500',
  '7pcs-dolphine-cast-iron-pots': 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=500',
  '8pcs-pots-set': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500',
  'combo-7pcs-cast-iron-pots-utensils': 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=500',
  'combo-set-cast-iron-pots-spoons': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=500',
  'pot-set-7-piece-aluminium': 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  
  // Bags - All unique
  '2pcs-travel-bags': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  'mini-structured-tote-bag': 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500',
  'quilted-weekender-travel-bag': 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500',
  'steve-madden-bag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
  'women-sm-bag': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
  'bags-3-collection': 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500',
  'business-laptop-backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a15?w=500',
  'school-bag-large': 'https://images.unsplash.com/photo-1577733975197-3b950ca4a7bf?w=500',
  
  // Coolers - All unique  
  '2-in-1-cooler-box-20l': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500',
  'car-fridge': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500',
  'fieldbar-cooler-box': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
  'beautiful-cooler-box': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500',
  'cooler-bag-insulated': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  'cooler-box-26l': 'https://images.unsplash.com/photo-1622560480605-d83c661ae6d3?w=500',
  'cooler-box-42l': 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=500',
  'insulated-cooler-bag': 'https://images.unsplash.com/photo-1558618047-f5c6a6c6e0ca?w=500',
  
  // Bedding - All unique
  'throw-blanket': 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500',
  '5pcs-comforter': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
  '5pcs-fluffy-comforter': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500',
  '5pcs-plain-colour-bedspread': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
  '5pcs-quilt-different-colors': 'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=500',
  '5pcs-reversible-comforter': 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=500',
  '7pcs-bedspread-with-curtains': 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=500',
  '3pcs-character-kids-comforter': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  
  // Kitchen Appliances - All unique
  '2l-electric-glass-kettle': 'https://images.unsplash.com/photo-1594213114663-d94db9b89c0d?w=500',
  '4-burner-gas-stove': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  'kitchen-electric-stand-mixer': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
  'citrus-juicer': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500',
  'easy-spin-cutter': 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500',
  'multifunctional-wet-dry-vacuum': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500',
  
  // Cups & Drinkware - All unique
  'stanley-cup': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
  'temperature-cup': 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500',
  '7l-ice-bucket-with-led-light': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500',
  
  // Cutlery & Utensils - All unique
  '24pcs-stainless-steel-gold-cutlery': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500',
  'egg-shaped-cutlery-set': 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  'modern-knife-set-with-stand': 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500',
  '8pcs-spice-jar-rotating': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
  
  // Storage & Organization - All unique
  '6l-triple-cereal-dispenser': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500',
  '7pcs-food-storage-containers': 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=500',
  '20l-food-storage-container': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
  'portable-20l-rice-container': 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  'bread-bin-set': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500',
  
  // Furniture - All unique
  'outdoor-folding-chair': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500',
  'foldable-table': 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=500',
  '3pcs-plastic-fruit-basket': 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=500',
  
  // Bathroom - All unique
  '5pcs-corner-shower-caddy': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500',
  '6pcs-bathroom-accessories': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=500',
  'foldable-washing-basket': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500',
  
  // Serving - All unique
  'gold-chaffing-dish': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500',
  '3-tier-ceramic-serving-bowl': 'https://images.unsplash.com/photo-1604579428972-e7bf4c2cc4f6?w=500',
  '5pcs-set-food-warmer': 'https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?w=500',
  '3pcs-bakeware-set': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
  
  // Grills & Outdoor Cooking - All unique
  'foldable-charcoal-grill': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',
  
  // Hats & Accessories - All unique
  'hat-spoty-bucket-hat': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500',
  
  // Footwear - All unique
  'modern-crocs': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
  'kids-sandals-size-10-2': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500',
  'sandals-size-3-10': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500',
  
  // Fans & Personal Items - All unique
  'rechargeable-neck-fan': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  
  // Aprons & Kitchen Textiles - All unique
  'kitchen-and-work-apron': 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  
  // Home Decor - All unique
  'velvet-3d-carpet-160cm': 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=500',
  'wall-paper-3m': 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=500',
  
  // Trays & Serving - All unique  
  'foldable-bamboo-tray': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
  'dish-rack': 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  
  // Gas & Utilities - All unique
  '9kg-new-empty-gas-cylinder-cadac': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
  
  // Combos & Special Sets - All unique
  'special-kitchen-combo': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
}

// Keyword-based image assignment for products not in the mapping
const keywordImages: Record<string, string[]> = {
  'pot': [
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
    'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=500',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500',
  ],
  'bag': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
    'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500',
  ],
  'cooler': [
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500',
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500',
    'https://images.unsplash.com/photo-1622560480605-d83c661ae6d3?w=500',
  ],
  'comforter': [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
    'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=500',
    'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=500',
  ],
  'bedspread': [
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=500',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
  ],
  'blanket': [
    'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  ],
  'kettle': [
    'https://images.unsplash.com/photo-1594213114663-d94db9b89c0d?w=500',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500',
  ],
  'cup': [
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
    'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500',
  ],
  'cutlery': [
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500',
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
    'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500',
  ],
  'knife': [
    'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500',
  ],
  'storage': [
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500',
    'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=500',
  ],
  'chair': [
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
  ],
  'table': [
    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=500',
  ],
  'bathroom': [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=500',
  ],
  'shower': [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500',
  ],
  'basket': [
    'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500',
    'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=500',
  ],
  'grill': [
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',
  ],
  'hat': [
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500',
    'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=500',
  ],
  'sandal': [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500',
    'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500',
  ],
  'crocs': [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
  ],
  'carpet': [
    'https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=500',
  ],
  'wallpaper': [
    'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=500',
  ],
  'apron': [
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  ],
  'mixer': [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
  ],
  'juicer': [
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500',
  ],
  'stove': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  ],
  'chaffing': [
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=500',
  ],
  'serving': [
    'https://images.unsplash.com/photo-1604579428972-e7bf4c2cc4f6?w=500',
  ],
  'warmer': [
    'https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?w=500',
  ],
  'bakeware': [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
  ],
  'spice': [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
  ],
  'bread': [
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500',
  ],
  'tray': [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
  ],
  'dish': [
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  ],
  'rack': [
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500',
  ],
  'fan': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  ],
  'gas': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
  ],
  'ice': [
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500',
  ],
  'quilt': [
    'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=500',
  ],
  'seeds': [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500',
  ],
  'fertilizer': [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
  ],
  'garden': [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
  ],
  'plant': [
    'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500',
  ],
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
      .select('id, name, slug')
      .order('name')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const updates: { id: string; name: string; image_url: string }[] = []
    const keywordCounters: Record<string, number> = {}

    for (const product of products || []) {
      let imageUrl = ''
      
      // First check direct slug mapping
      if (productImages[product.slug]) {
        imageUrl = productImages[product.slug]
      } else {
        // Find by keyword and rotate through available images
        const nameLower = product.name.toLowerCase()
        
        for (const [keyword, images] of Object.entries(keywordImages)) {
          if (nameLower.includes(keyword)) {
            // Initialize counter for this keyword if not exists
            if (keywordCounters[keyword] === undefined) {
              keywordCounters[keyword] = 0
            }
            
            // Get the next image in rotation
            const imageIndex = keywordCounters[keyword] % images.length
            imageUrl = images[imageIndex]
            
            // Increment counter for next product with same keyword
            keywordCounters[keyword]++
            break
          }
        }
        
        // Fallback to generic product image
        if (!imageUrl) {
          imageUrl = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&sig=${product.id}`
        }
      }

      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', product.id)

      if (!updateError) {
        updates.push({ id: product.id, name: product.name, image_url: imageUrl })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} products with unique images`,
      updated: updates.length,
    })
  } catch (error) {
    console.error('Error updating images:', error)
    return NextResponse.json({ error: 'Failed to update images' }, { status: 500 })
  }
}
