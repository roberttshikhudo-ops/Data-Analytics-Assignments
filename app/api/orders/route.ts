import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { SHIPPING_RATES, type ShippingMethod } from "@/lib/types"
import { sendOrderReceivedEmail } from "@/lib/emails/order"

// Calculate shipping the SAME way the checkout/cart does, so the stored order
// total always matches the amount the customer is charged via PayFast.
function calculateShipping(method: ShippingMethod, subtotal: number): number {
  if (method === "pickup") return 0
  const rate = method === "express" ? SHIPPING_RATES.express : SHIPPING_RATES.standard
  if (rate.freeThreshold && subtotal >= rate.freeThreshold) return 0
  return rate.price
}

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const body = await request.json()
    const {
      items,
      shippingAddress,
      billingAddress,
      email,
      paymentMethod,
      shippingMethod,
      couponCode,
      notes,
      subtotal,
      shipping,
      discount,
      total,
    } = body

    // Normalize the selected shipping method (defaults to standard delivery).
    const selectedShippingMethod: ShippingMethod =
      shippingMethod === "express" || shippingMethod === "pickup"
        ? shippingMethod
        : "standard"

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }

    if (!email || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get current user if logged in
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Validate products and get current prices
    const productIds = items.map((item: { productId: string }) => item.productId)
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, sku, stock_quantity")
      .in("id", productIds)
      .eq("is_active", true)

    if (productsError || !products) {
      return NextResponse.json(
        { error: "Failed to validate products" },
        { status: 400 }
      )
    }

    // Check stock and calculate totals
    let calculatedSubtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        )
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`,
          },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      calculatedSubtotal += itemTotal

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        product_image_url: item.imageUrl || null,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      })
    }

    // Validate coupon if provided
    let appliedDiscount = 0
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("is_active", true)
        .single()

      if (coupon) {
        const now = new Date()
        const validFrom = coupon.starts_at ? new Date(coupon.starts_at) : null
        const validTo = coupon.expires_at ? new Date(coupon.expires_at) : null

        if (
          (!validFrom || now >= validFrom) &&
          (!validTo || now <= validTo) &&
          (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit) &&
          calculatedSubtotal >= (coupon.minimum_order_amount || 0)
        ) {
          if (coupon.discount_type === "percentage") {
            appliedDiscount = (calculatedSubtotal * coupon.discount_value) / 100
            if (coupon.maximum_discount) {
              appliedDiscount = Math.min(appliedDiscount, coupon.maximum_discount)
            }
          } else {
            appliedDiscount = coupon.discount_value
          }

          // Increment usage count
          await supabaseAdmin
            .from("coupons")
            .update({ usage_count: coupon.usage_count + 1 })
            .eq("id", coupon.id)
        }
      }
    }

    // Calculate shipping using the shared SHIPPING_RATES so the server total
    // always matches what the customer was shown and charged.
    const calculatedShipping = calculateShipping(selectedShippingMethod, calculatedSubtotal)
    const calculatedTotal = calculatedSubtotal - appliedDiscount + calculatedShipping

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user?.id || null,
        guest_email: user ? null : email,
        status: "pending",
        payment_status: "pending",
        payment_method: paymentMethod,
        subtotal: calculatedSubtotal,
        shipping_cost: calculatedShipping,
        shipping_method: selectedShippingMethod,
        discount_amount: appliedDiscount,
        total: calculatedTotal,
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
        billing_first_name: billingAddress.firstName,
        billing_last_name: billingAddress.lastName,
        billing_company: billingAddress.company || null,
        billing_address_line1: billingAddress.addressLine1,
        billing_address_line2: billingAddress.addressLine2 || null,
        billing_city: billingAddress.city,
        billing_province: billingAddress.province,
        billing_postal_code: billingAddress.postalCode,
        billing_phone: billingAddress.phone || null,
      })
      .select("id, order_number")
      .single()

    if (orderError || !order) {
      console.error("Order creation error:", orderError)
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      )
    }

    // Create order items
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(itemsWithOrderId)

    if (itemsError) {
      console.error("Order items error:", itemsError)
      // Delete the order if items failed
      await supabaseAdmin.from("orders").delete().eq("id", order.id)
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      )
    }

    // Notify the customer that we've received their order (non-blocking:
    // a mail failure must never fail the order placement itself).
    try {
      const customerName =
        [shippingAddress.firstName, shippingAddress.lastName]
          .filter(Boolean)
          .join(" ") || null
      await sendOrderReceivedEmail(email, {
        orderNumber: order.order_number,
        customerName,
        items: orderItems.map((it) => ({
          name: it.product_name,
          quantity: it.quantity,
          total: it.total_price,
        })),
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        discount: appliedDiscount,
        total: calculatedTotal,
      })
    } catch (mailErr) {
      console.error("[v0] Order received email failed:", mailErr)
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      total: calculatedTotal,
    })
  } catch (error) {
    console.error("Order API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
