'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

interface CheckoutData {
  items: CartItem[]
  email: string
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    addressLine1: string
    addressLine2?: string
    city: string
    province: string
    postalCode: string
    phone?: string
  }
  billingAddress?: {
    firstName: string
    lastName: string
    company?: string
    addressLine1: string
    addressLine2?: string
    city: string
    province: string
    postalCode: string
    phone?: string
  }
  couponCode?: string
  notes?: string
}

export async function createStripeCheckoutSession(data: CheckoutData) {
  const supabaseAdmin = getSupabaseAdmin()
  const { items, email, shippingAddress, billingAddress, couponCode, notes } = data

  // Validate products and get current prices from database
  const productIds = items.map((item) => item.productId)
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, name, price, sku, stock_quantity')
    .in('id', productIds)
    .eq('is_active', true)

  if (productsError || !products) {
    throw new Error('Failed to validate products')
  }

  // Check stock and build line items
  let subtotal = 0
  const orderItems: {
    product_id: string
    product_name: string
    product_sku: string | null
    quantity: number
    unit_price: number
    total_price: number
  }[] = []

  const lineItems: {
    price_data: {
      currency: string
      product_data: { name: string; description?: string }
      unit_amount: number
    }
    quantity: number
  }[] = []

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`)
    }

    if (product.stock_quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`
      )
    }

    const itemTotal = product.price * item.quantity
    subtotal += itemTotal

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: item.quantity,
      unit_price: product.price,
      total_price: itemTotal,
    })

    lineItems.push({
      price_data: {
        currency: 'zar',
        product_data: {
          name: product.name,
        },
        // Stripe expects amount in cents
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    })
  }

  // Calculate shipping (free over R1,500)
  const shipping = subtotal >= 1500 ? 0 : 150

  // Add shipping as a line item if applicable
  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: 'zar',
        product_data: {
          name: 'Shipping',
          description: 'Standard delivery',
        },
        unit_amount: shipping * 100,
      },
      quantity: 1,
    })
  }

  // Validate coupon if provided
  let discount = 0
  if (couponCode) {
    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single()

    if (coupon) {
      const now = new Date()
      const validFrom = coupon.starts_at ? new Date(coupon.starts_at) : null
      const validTo = coupon.expires_at ? new Date(coupon.expires_at) : null

      if (
        (!validFrom || now >= validFrom) &&
        (!validTo || now <= validTo) &&
        (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit) &&
        subtotal >= (coupon.minimum_order_amount || 0)
      ) {
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.discount_value) / 100
          if (coupon.maximum_discount) {
            discount = Math.min(discount, coupon.maximum_discount)
          }
        } else {
          discount = coupon.discount_value
        }
      }
    }
  }

  const total = subtotal - discount + shipping

  // Create order in database first (pending status)
  const billing = billingAddress || shippingAddress
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      guest_email: email,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'stripe',
      subtotal,
      shipping_cost: shipping,
      discount_amount: discount,
      total,
      coupon_code: couponCode || null,
      notes: notes || null,
      // Shipping address
      shipping_first_name: shippingAddress.firstName,
      shipping_last_name: shippingAddress.lastName,
      shipping_company: shippingAddress.company || null,
      shipping_address_line1: shippingAddress.addressLine1,
      shipping_address_line2: shippingAddress.addressLine2 || null,
      shipping_city: shippingAddress.city,
      shipping_province: shippingAddress.province,
      shipping_postal_code: shippingAddress.postalCode,
      shipping_phone: shippingAddress.phone || null,
      // Billing address
      billing_first_name: billing.firstName,
      billing_last_name: billing.lastName,
      billing_company: billing.company || null,
      billing_address_line1: billing.addressLine1,
      billing_address_line2: billing.addressLine2 || null,
      billing_city: billing.city,
      billing_province: billing.province,
      billing_postal_code: billing.postalCode,
      billing_phone: billing.phone || null,
    })
    .select('id, order_number')
    .single()

  if (orderError || !order) {
    console.error('Order creation error:', orderError)
    throw new Error('Failed to create order')
  }

  // Create order items
  const itemsWithOrderId = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }))

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(itemsWithOrderId)

  if (itemsError) {
    // Clean up order on failure
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    throw new Error('Failed to create order items')
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    customer_email: email,
    line_items: lineItems,
    mode: 'payment',
    metadata: {
      order_id: order.id,
      order_number: order.order_number,
    },
  })

  // Update order with Stripe session ID
  await supabaseAdmin
    .from('orders')
    .update({ payment_reference: session.id })
    .eq('id', order.id)

  return {
    clientSecret: session.client_secret,
    orderId: order.id,
    orderNumber: order.order_number,
  }
}

export async function confirmStripePayment(sessionId: string) {
  const supabaseAdmin = getSupabaseAdmin()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status === 'paid' && session.metadata?.order_id) {
    // Update order status
    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
      })
      .eq('id', session.metadata.order_id)

    // Update coupon usage if applicable
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('coupon_code')
      .eq('id', session.metadata.order_id)
      .single()

    if (order?.coupon_code) {
      await supabaseAdmin.rpc('increment_coupon_usage', {
        coupon_code: order.coupon_code,
      })
    }

    // Reduce stock
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', session.metadata.order_id)

    if (orderItems) {
      for (const item of orderItems) {
        await supabaseAdmin.rpc('decrement_product_stock', {
          product_uuid: item.product_id,
          quantity_to_reduce: item.quantity,
        })
      }
    }

    return {
      success: true,
      orderNumber: session.metadata.order_number,
    }
  }

  return { success: false }
}
