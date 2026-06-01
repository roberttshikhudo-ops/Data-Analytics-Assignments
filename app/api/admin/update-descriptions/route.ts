import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Product descriptions based on the seed data
const productDescriptions: Record<string, string> = {
  '2l-electric-glass-kettle': 'Premium 2L electric glass kettle with blue LED indicator light. Fast boiling with automatic shut-off feature. Perfect for tea, coffee, and hot beverages.',
  '5pcs-set-food-warmer': 'Complete 5-piece food warmer set with floral design. Includes various sizes to keep your dishes warm. Perfect for family gatherings and entertaining.',
  'modern-crocs-sizes-6-10': 'Comfortable modern Crocs available in sizes 6-10. Lightweight and easy to clean. Perfect for casual wear, gardening, and everyday use.',
  'throw-blanket': 'Soft and cozy throw blankets in various colors. Perfect for adding warmth and style to your living room or bedroom.',
  '3pcs-bakeware-set': 'Professional 3-piece ceramic bakeware set in white. Includes various sizes for all your baking needs. Oven safe and easy to clean.',
  '4-burner-gas-stove': 'Lightweight 4-burner gas stove perfect for outdoor cooking and camping. Easy to set up and use. Durable construction.',
  '3pcs-plastic-fruit-basket': '3-piece plastic fruit basket set in elegant design. Perfect for storing and displaying fruits on your kitchen counter.',
  'bread-bin-set': 'Complete red bread bin set including bread box, sugar, and other canisters. Keeps bread fresh and adds style to your kitchen.',
  '7l-ice-bucket-led-light': '7 Liter ice bucket with color-changing LED lights. Perfect for parties and entertaining. Keeps drinks cold while adding ambiance.',
  '5pcs-comforter-set': 'Luxurious 5-piece comforter set in green/grey color. Includes comforter, sheets, and pillowcases for a complete bedroom makeover.',
  'knife-set-with-stand': 'Professional knife set with wooden stand. Includes various knife sizes for all kitchen tasks. Sharp stainless steel blades.',
  'ceramic-flat-plate-each': 'Individual black ceramic flat plate. Elegant design perfect for modern dining. Dishwasher and microwave safe.',
  'stanley-cup': 'Insulated Stanley Cup tumbler for hot or cold beverages. Available in multiple colors. Keeps drinks at optimal temperature for hours.',
  '3pcs-character-kids-comforter': 'Fun 3-piece kids comforter set with Lightning McQueen character design. Perfect for your little one\'s bedroom.',
  'foldable-table-black': 'Black foldable table with metal legs. Perfect for outdoor events, markets, or extra dining space. Folds flat for easy storage.',
  'stove-stand': 'Sturdy metal stove stand in black. Provides stable platform for your gas stove. Easy assembly.',
  'multifunctional-wet-dry-vacuum': 'Powerful multifunctional wet and dry vacuum cleaner with 12V motor. Perfect for car cleaning and household use.',
  'lunch-box-stainless-steel': 'Stainless steel lunch box to keep your food warm. Multiple compartments for different foods. Leak-proof design.',
  'portable-blender': 'Compact portable blender for smoothies and shakes. USB rechargeable for on-the-go use. Perfect for gym, office, or travel.',
  'laundry-basket-60l': 'Large 60L laundry basket with handles. Durable construction for heavy loads. Easy to carry and store.',
  'winter-waterproof-warm-slippers': 'Cozy blue winter slippers with soft fur lining. Waterproof exterior keeps feet dry. Perfect for cold weather indoor comfort.',
  '4-in-1-rotating-vegetable-rack': 'Multi-tier rotating vegetable storage trolley in black. 4-in-1 design for organizing fruits, vegetables, and kitchen items. Space-saving rotating mechanism.',
  '10pcs-non-stick-pots': 'Premium 10-piece grey granite-style non-stick pot set with glass lids. Includes various sizes for all your cooking needs. Durable and easy to clean.',
  '2-in-1-cooler-box-20l': 'TIMIN brand 2-in-1 cooler box set in blue and peach colors. 20L capacity keeps food and drinks cold for hours. Perfect for picnics, camping, and outdoor events.',
  'dinner-set-white': 'Complete white dinner set including plates, bowls, and cups. Classic elegant design for everyday dining or special occasions.',
  '6l-pressure-cooker': '6 Liter electric pressure cooker with digital display and multiple cooking modes. Fast, efficient, and safe cooking. Includes preset programs for various dishes.',
  '5pcs-plain-colour-bedspread': 'Elegant 5-piece plain colour bedspread set in beige/tan. Includes quilted bedspread and matching accessories. Soft and comfortable for a cozy bedroom.',
  '8pcs-spice-jar-rotating-rack': 'Elegant 8-piece spice jar set on a rotating gold rack. Glass jars with gold lids for storing spices. Adds style and organization to your kitchen.',
  'quilted-weekender-travel-bag': 'Stylish quilted weekender travel bag available in various colors. Spacious interior for weekend getaways. Durable construction with comfortable handles.',
  'foldable-charcoal-grill': 'Portable foldable charcoal BBQ grill. Easy to set up and fold for storage or transport. Perfect for outdoor cooking, camping, and braais.',
  'steve-madden-bag': 'Stylish Steve Madden style black handbag. Elegant design perfect for work or casual outings. Spacious interior with multiple compartments.',
  'kitchen-electric-stand-mixer': 'Professional kitchen electric stand mixer for baking and cooking. Multiple speed settings, includes various attachments. Perfect for home bakers.',
  'beautiful-cooler-box': 'Beautiful pastel-colored cooler boxes in pink, green, and peach. Keeps food and drinks cold for hours. Stylish design for picnics and outings.',
  'portable-20l-rice-container': 'Beige/cream portable 20L rice storage container with secure lid. Keeps rice fresh and protected from pests. Easy-pour spout for convenience.',
  'dish-rack': 'Black metal 2-tier dish drying rack with drip tray. Organizes dishes, cups, and utensils. Space-saving design for kitchen counters.',
  '24pcs-stainless-steel-gold-cutlery': 'Elegant 24-piece gold stainless steel cutlery set in presentation box. Includes forks, knives, spoons, and teaspoons. Perfect for special occasions.',
  '5pcs-fluffy-comforter': 'Luxurious 5-piece fluffy comforter set in mint/aqua color. Extra soft and plush for ultimate comfort. Includes comforter, sheets, and pillowcases.',
  'foldable-washing-basket': 'Bamboo foldable laundry/washing basket. Eco-friendly and space-saving design. Collapses flat for easy storage when not in use.',
  '6l-triple-cereal-dispenser': 'Triple 6L cereal and dry food dispenser with black lids. Keeps cereals, grains, and snacks fresh. Wall-mounted or countertop design.',
  'mini-structured-tote-bag': 'Stylish mini structured tote bag available in yellow, white, and pink. Perfect for everyday use. Durable construction with elegant finish.',
  'insulated-cooler-bag': 'Insulated cooler bag available in blue/yellow and olive/brown colors. Keeps food and drinks cold or hot. Perfect for picnics, lunch, and travel.',
  'combo-set-cast-iron-pots-spoons': 'Complete combo set including 7 pieces cast iron pots in red and 12 kitchen spoons/utensils. Perfect starter set for new kitchens.',
  '7pcs-food-storage-containers': 'Set of 7 clear food storage containers with bamboo lids. Airtight seal keeps food fresh. Various sizes for different storage needs.',
  'easy-spin-cutter': 'Green manual food chopper and spin cutter. Easy pull-cord operation for quick chopping of vegetables, fruits, and more. Compact and easy to clean.',
  'egg-shaped-cutlery-set': 'Decorative egg-shaped cutlery holder with copper/rose gold top. Unique and elegant design for storing kitchen utensils. Makes a great centerpiece.',
  '6pcs-bathroom-accessories': 'Complete 6-piece white bathroom accessory set. Includes soap dispenser, toothbrush holder, soap dish, and more. Modern minimalist design.',
  '5pcs-corner-shower-caddy': '5-piece black metal corner shower caddy/organizer with multiple tiers. Wall-mounted design for bathroom storage. Holds shampoo, soap, and toiletries.',
  'business-laptop-backpack': 'Professional business laptop backpack available in black, burgundy, and olive colors. Multiple compartments for laptop, documents, and accessories.',
  'rechargeable-neck-fan': 'Wearable rechargeable neck fan in white/teal color. 360-degree surrounding air flow. Hands-free cooling for outdoor activities and hot weather.',
  'citrus-juicer': 'Electric citrus juicer in mint/green color. Easy to use for fresh orange, lemon, and lime juice. Compact design for kitchen counter.',
  '5pcs-quilt-different-colors': '5-piece quilt bedding set available in different colors including teal/turquoise with floral design. Includes quilt and matching accessories for a complete bedroom makeover.',
  'outdoor-folding-chair': 'Premium outdoor reclining folding chair in beige/tan color. Adjustable positions for maximum comfort. Perfect for garden, patio, camping, or beach.',
  '20l-food-storage-container': '20L food storage container/rice bucket in white. Airtight seal keeps food fresh and protected. Includes measuring cup and easy-pour spout.',
  '10pcs-bon-voyager-pots': '10-piece Bon Voyager stainless steel pot set with red lids. Various sizes for all cooking needs. Durable construction with heat-resistant handles.',
  'modern-knife-set-with-stand': 'Modern knife set with wooden handles on rotating stand. Includes various knives for all kitchen tasks. Elegant design and sharp blades.',
  'kitchen-and-work-apron': 'Black kitchen and work apron. Durable construction for cooking, grilling, and workshop use. Adjustable straps for comfortable fit.',
  '7pcs-cast-iron-pots': '7-piece blue cast iron pot set with various sizes. Includes pots, pans, and griddle. Superior heat retention for perfect cooking.',
  'kids-sandals-size-10-2': 'Colorful kids slide sandals available in sizes 10 to 2. Comfortable and easy to wear. Available in various fun colors.',
  '9kg-new-empty-gas-cylinder-cadac': 'New empty 9kg CADAC gas cylinder in blue. Ready for refilling at your local gas supplier. Durable and safe construction.',
  'hat-spoty-bucket-hat': 'Colorful bucket hats/sun hats available in various colors including orange, black, pink, and more. Perfect for outdoor activities and sun protection.',
  'car-fridge': 'Portable car fridge/cooler in blue. Plugs into car cigarette lighter. Keeps food and drinks cold during travel and camping.',
  'temperature-cup': 'Smart temperature display cup/mug in pink and green colors. Shows drink temperature on LED display. Perfect for tea and coffee lovers.',
  'foldable-table': 'White foldable table with sturdy metal legs. Perfect for events, parties, camping, or extra dining space. Folds flat for easy storage.',
  '7pcs-dolphine-cast-iron-pots': '7-piece DOLPHINE brand orange cast iron pot set. Includes various pot sizes and pan. Superior heat retention for perfect cooking.',
  'fieldbar-cooler-box': 'Premium FIELDBAR brand cooler box in grey. High-quality construction keeps contents cold for extended periods. Perfect for camping, fishing, and outdoor adventures.',
  'velvet-3d-carpet-160cm': 'Luxurious velvet 3D carpet in grey/brown pattern. Size 160cm x 230cm. Adds elegance and comfort to any living room or bedroom.',
  'foldable-bamboo-tray': 'Elegant foldable bamboo breakfast tray with folding legs. Perfect for breakfast in bed or serving. Sturdy and lightweight.',
  'special-kitchen-combo': 'Complete kitchen combo deal including bread box, coffee maker, utensils, and more. Everything you need to upgrade your kitchen in one package.',
  'wall-paper-3m': 'Decorative self-adhesive wallpaper in brown/marble pattern. 3 meters roll. Easy to apply and remove. Perfect for accent walls.',
  'combo-7pcs-cast-iron-pots-utensils': 'Complete combo set with 7-piece red cast iron pots and matching kitchen utensils. Everything you need for cooking in one package.',
  '3-tier-ceramic-serving-bowl': 'Elegant 3-tier white/pink ceramic serving bowl on wooden stand. Perfect for serving fruits, snacks, or appetizers at parties and gatherings.',
  '8pcs-pots-set': '8-piece stainless steel pot set with glass lids. Various sizes for all cooking needs. Durable construction with heat-resistant handles.',
  '7pcs-bedspread-with-curtains': '7-piece bedspread set with matching curtains in green/teal color with decorative pattern. Complete bedroom makeover set.',
  'sandals-size-3-10': 'Black slide sandals with white stripes. Available in adult sizes 3 to 10. Comfortable and stylish for everyday wear.',
  '5pcs-reversible-comforter': '5-piece reversible comforter set in blue with floral pattern. Can be flipped for a different look. Includes comforter, sheets, and pillowcases.',
  'gold-chaffing-dish': 'Elegant gold chafing dish with glass lid on gold stand. Perfect for keeping food warm at buffets, parties, and special events.',
}

export async function POST(request: Request) {
  try {
    // Allow with secret key for development
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    const results = {
      updated: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Update each product with its description
    for (const [slug, description] of Object.entries(productDescriptions)) {
      const { error } = await supabase
        .from('products')
        .update({ description })
        .eq('slug', slug)

      if (error) {
        results.failed++
        results.errors.push(`${slug}: ${error.message}`)
      } else {
        results.updated++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.updated} products, ${results.failed} failed`,
      results
    })

  } catch (error) {
    console.error('Error updating descriptions:', error)
    return NextResponse.json(
      { error: 'Failed to update descriptions' },
      { status: 500 }
    )
  }
}
