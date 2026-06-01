import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const lifestyleProducts = [
  {
    name: 'Ceramic Flat Plate (each)',
    slug: 'ceramic-flat-plate',
    description: 'Elegant black ceramic flat plate, perfect for everyday dining or special occasions. Durable and dishwasher safe.',
    short_description: 'Black ceramic flat plate for elegant dining',
    price: 28.00,
    sku: 'HL-PLATE-001',
    stock_quantity: 100,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: '/images/products/ceramic-flat-plate.jpg',
  },
  {
    name: 'Outdoor Shower (Rechargeable)',
    slug: 'outdoor-shower-rechargeable',
    description: 'Portable rechargeable outdoor shower with water container. Perfect for camping, beach trips, or garden use. Easy to use and convenient.',
    short_description: 'Portable rechargeable shower for outdoor use',
    price: 210.00,
    sku: 'HL-SHOWER-001',
    stock_quantity: 25,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: '/images/products/outdoor-shower.jpg',
  },
  {
    name: '3pcs Plastic Tray Set',
    slug: '3pcs-plastic-tray-set',
    description: 'Set of 3 elegant plastic serving trays with gold trim. Available in multiple colors. Perfect for serving snacks, drinks, or decorative display.',
    short_description: 'Elegant 3-piece serving tray set with gold trim',
    price: 240.00,
    sku: 'HL-TRAY-001',
    stock_quantity: 30,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: '/images/products/plastic-tray-set.jpg',
  },
  {
    name: '7L Ice Bucket with LED Light',
    slug: '7l-ice-bucket-led-light',
    description: '7 Liter ice bucket with color-changing LED lights. Perfect for parties and events. Creates a stunning visual effect while keeping drinks cold.',
    short_description: 'LED color-changing ice bucket for parties',
    price: 260.00,
    sku: 'HL-ICE-001',
    stock_quantity: 20,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: '/images/products/ice-bucket-led.jpg',
  },
  {
    name: '12pcs Silicon Spoon Set',
    slug: '12pcs-silicon-spoon-set',
    description: 'Complete set of 12 colorful silicone kitchen utensils. Heat resistant, non-stick friendly, and easy to clean. Includes various spoons and spatulas.',
    short_description: '12-piece colorful silicone kitchen utensil set',
    price: 200.00,
    sku: 'HL-SPOON-001',
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    is_new: true,
    image_url: '/images/products/silicon-spoon-set.jpg',
  },
  {
    name: 'BreadBin Set',
    slug: 'breadbin-set',
    description: 'Stylish bread storage container set. Available in multiple colors including Cream, Matte Black, Matte Grey, and Navy Blue. Keeps bread fresh longer.',
    short_description: 'Stylish bread storage container in multiple colors',
    price: 450.00,
    sku: 'HL-BREAD-001',
    stock_quantity: 15,
    is_active: true,
    is_featured: true,
    is_new: true,
    image_url: '/images/products/breadbin-set.jpg',
  },
]

async function seedLifestyleProducts() {
  console.log('Starting to seed lifestyle products...')

  // Get the Home & Living category ID
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'home-living')
    .single()

  if (categoryError || !category) {
    console.error('Home & Living category not found:', categoryError)
    return
  }

  console.log('Found Home & Living category:', category.id)

  for (const product of lifestyleProducts) {
    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', product.slug)
      .single()

    if (existing) {
      console.log(`Skipping ${product.name} - already exists`)
      continue
    }

    // Insert the product
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        category_id: category.id,
      })
      .select()

    if (error) {
      console.error(`Error inserting ${product.name}:`, error)
    } else {
      console.log(`Added: ${product.name}`)
    }
  }

  console.log('Finished seeding lifestyle products!')
}

seedLifestyleProducts()
