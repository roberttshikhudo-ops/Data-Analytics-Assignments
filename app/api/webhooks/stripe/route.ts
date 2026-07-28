import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { sendOwnerPurchaseAlert } from "@/lib/whatsapp"

// Lazy initialization to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
  })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const stripe = getStripe()
  const supabase = getSupabase()
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get order ID from metadata
        const orderId = session.metadata?.order_id
        
        if (orderId) {
          // Update order status to paid
          const { error: orderError } = await supabase
            .from("orders")
            .update({
              status: "processing",
              payment_status: "paid",
              stripe_payment_intent_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)

          if (orderError) {
            console.error("Error updating order:", orderError)
          }

          // Get order items to decrement stock
          const { data: orderItems } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId)

          if (orderItems) {
            // Decrement stock for each product
            for (const item of orderItems) {
              await supabase.rpc("decrement_product_stock", {
                product_uuid: item.product_id,
                quantity_to_reduce: item.quantity,
              })
            }
          }

          // Increment coupon usage if applicable
          const couponCode = session.metadata?.coupon_code
          if (couponCode) {
            await supabase.rpc("increment_coupon_usage", {
              coupon_code: couponCode,
            })
          }

          // Alert the store owner on WhatsApp about the successful purchase.
          try {
            const { data: fullOrder } = await supabase
              .from("orders")
              .select(
                "order_number, total, shipping_first_name, shipping_last_name, billing_first_name, billing_last_name, shipping_phone, billing_phone, shipping_method, shipping_city, order_items(quantity, product_name, product:products(name))",
              )
              .eq("id", orderId)
              .single()

            if (fullOrder) {
              const customerName =
                [fullOrder.shipping_first_name, fullOrder.shipping_last_name]
                  .filter(Boolean)
                  .join(" ") ||
                [fullOrder.billing_first_name, fullOrder.billing_last_name]
                  .filter(Boolean)
                  .join(" ") ||
                null
              const isPickup = fullOrder.shipping_method === "pickup"

              await sendOwnerPurchaseAlert({
                orderNumber: fullOrder.order_number || "",
                total: Number(fullOrder.total || 0),
                customerName,
                customerPhone:
                  fullOrder.shipping_phone || fullOrder.billing_phone || null,
                items: (fullOrder.order_items || []).map((it: any) => ({
                  name: it.product?.name || it.product_name || "Product",
                  quantity: it.quantity || 1,
                })),
                fulfilment: isPickup
                  ? "Collection / pickup"
                  : `Delivery${fullOrder.shipping_city ? ` to ${fullOrder.shipping_city}` : ""}`,
              })
            }
          } catch (alertError) {
            console.error("[v0] Stripe WhatsApp alert error:", alertError)
          }
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata?.order_id

        if (orderId) {
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        if (paymentIntentId) {
          // Find the order by payment intent ID
          const { data: order } = await supabase
            .from("orders")
            .select("id")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .single()

          if (order) {
            await supabase
              .from("orders")
              .update({
                status: "refunded",
                payment_status: "refunded",
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.id)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
