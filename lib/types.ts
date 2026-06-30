// Database types
export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductAvailability = 'both' | 'online_only' | 'in_store_only'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  sku: string
  barcode: string | null
  stock_quantity: number
  low_stock_threshold: number | null
  weight: number | null
  weight_unit: string | null
  category_id: string | null
  brand: string | null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  image_url: string | null
  meta_title: string | null
  meta_description: string | null
  availability: ProductAvailability
  created_at: string
  updated_at: string
  // Joined fields
  category?: Category
}

// Product images will be added later as a separate table if needed

export interface Address {
  id: string
  user_id: string
  label: string
  first_name: string
  last_name: string
  company: string | null
  address_line1: string
  address_line2: string | null
  city: string
  province: string
  postal_code: string
  country: string
  phone: string | null
  is_default_shipping: boolean
  is_default_billing: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  payment_reference: string | null
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total: number
  coupon_code: string | null
  shipping_first_name: string | null
  shipping_last_name: string | null
  shipping_company: string | null
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_province: string | null
  shipping_postal_code: string | null
  shipping_country: string | null
  shipping_phone: string | null
  billing_first_name: string | null
  billing_last_name: string | null
  billing_company: string | null
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_city: string | null
  billing_province: string | null
  billing_postal_code: string | null
  billing_country: string | null
  billing_phone: string | null
  tracking_number: string | null
  tracking_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_sku: string | null
  product_image_url: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string
  // Joined fields
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string | null
  content: string | null
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  // Joined fields
  profile?: Profile
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  minimum_order_amount: number
  maximum_discount: number | null
  usage_limit: number | null
  usage_count: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Cart types (stored in Redis)
export interface CartItem {
  productId: string
  quantity: number
  // Cached product data for display
  name: string
  price: number
  image: string | null
  sku: string | null
  stock: number
}

export interface Cart {
  items: CartItem[]
  updatedAt: string
}

// South African provinces for address forms
export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
] as const

export type SAProvince = typeof SA_PROVINCES[number]

// Shipping rates for South Africa.
// Aligned to Fastway Couriers SA national satchel pricing (incl. VAT and the
// 5% fuel adjustment effective April 2026): A4 national satchel ≈ R99,
// A2 national satchel ≈ R120. Express reflects Fastway's priority service.
export const SHIPPING_RATES = {
  standard: {
    name: 'Standard Delivery (Fastway)',
    description: '2-4 business days nationwide via Fastway Couriers',
    price: 99,
    freeThreshold: 1000, // Free shipping over R1000
  },
  express: {
    name: 'Express Delivery (Fastway)',
    description: '1-2 business days to major centres via Fastway Couriers',
    price: 160,
    freeThreshold: null,
  },
  pickup: {
    name: 'Local Pickup',
    description: 'Pick up from our store',
    price: 0,
    freeThreshold: 0,
  },
} as const

export type ShippingMethod = keyof typeof SHIPPING_RATES
