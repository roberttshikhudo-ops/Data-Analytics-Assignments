import { createClient } from "@supabase/supabase-js"

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

// For backwards compatibility
export const supabase = typeof window !== 'undefined' 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  : (null as unknown as ReturnType<typeof createClient>)

// Server-side client for admin operations
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Types
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

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_at_price: number | null
  sku: string
  stock_quantity: number
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface Order {
  id: string
  user_id: string | null
  order_number: string
  status: string
  subtotal: number
  shipping_cost: number
  tax_amount: number
  total_amount: number
  payment_status: string
  payment_method: string | null
  shipping_address: object
  billing_address: object
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}
