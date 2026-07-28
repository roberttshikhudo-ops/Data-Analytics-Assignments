import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { validatePayFastITN, getPaymentStatus } from "@/lib/payfast"
import { createShipment, AGRIHUB_WAREHOUSE, ShippingAddress } from "@/lib/fastway"
import {
  sendOrderConfirmationEmail,
  sendOrderTrackingEmail,
  type OrderEmailData,
} from "@/lib/emails/order"
import { sendOwnerPurchaseAlert } from "@/lib/whatsapp"

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://agrihubsa.co.za"

// Resolves the customer's email for an order. Guest checkouts store the address
// in guest_email; registered users have their email in Supabase auth.
async function resolveCustomerEmail(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  order: any,
): Promise<string> {
  if (order?.guest_email) return order.guest_email
  if (order?.user_id) {
    try {
      const { data } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
      return data?.user?.email || ""
    } catch {
      return ""
    }
  }
  return ""
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
    // Get the raw body for validation
    const body = await request.text()
    const params = new URLSearchParams(body)
    const pfData: Record<string, string> = {}
    
    params.forEach((value, key) => {
      pfData[key] = value
    })

    console.log("[v0] PayFast ITN received:", pfData)

    // Validate the ITN
    const validation = await validatePayFastITN({ ...pfData }, body)

    if (!validation.valid) {
      console.error("[v0] PayFast ITN validation failed:", validation.error)
      return new NextResponse("INVALID", { status: 400 })
    }

    // Extract payment details
    const orderId = pfData.m_payment_id
    const orderNumber = pfData.custom_str1
    const paymentStatus = getPaymentStatus(pfData.payment_status)
    const amountGross = parseFloat(pfData.amount_gross)
    const pfPaymentId = pfData.pf_payment_id

    // Update order in database
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, total, payment_status")
      .eq("id", orderId)
      .single()

    if (fetchError || !order) {
      console.error("[v0] Order not found:", orderId)
      return new NextResponse("ORDER_NOT_FOUND", { status: 404 })
    }

    // Verify amount matches (with small tolerance for rounding)
    if (Math.abs(order.total - amountGross) > 0.01) {
      console.error("[v0] Amount mismatch:", { expected: order.total, received: amountGross })
      return new NextResponse("AMOUNT_MISMATCH", { status: 400 })
    }

    // Update order status
    const newStatus = paymentStatus === "paid" ? "processing" : "pending"
    
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: paymentStatus,
        status: newStatus,
        payment_reference: pfPaymentId,
        payment_method: "payfast",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Failed to update order:", updateError)
      return new NextResponse("UPDATE_FAILED", { status: 500 })
    }

    console.log(`[v0] Order ${orderNumber} updated: payment_status=${paymentStatus}, status=${newStatus}`)

    // If payment successful, update stock quantities and create shipment
    if (paymentStatus === "paid") {
      // Get full order details for shipment
      const { data: fullOrder } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*, product:products(name, weight))")
        .eq("id", orderId)
        .single()

      // Update stock quantities
      const { data: orderItems } = await supabaseAdmin
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId)

      if (orderItems) {
        for (const item of orderItems) {
          if (item.product_id) {
            await supabaseAdmin.rpc("decrement_stock", {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            })
          }
        }
      }

      // Resolve customer contact details for emails + shipment.
      const customerEmail = await resolveCustomerEmail(supabaseAdmin, fullOrder)
      const customerName =
        [fullOrder?.shipping_first_name, fullOrder?.shipping_last_name]
          .filter(Boolean)
          .join(" ") || null

      const emailData: OrderEmailData = {
        orderNumber: orderNumber || fullOrder?.order_number || "",
        customerName,
        items: (fullOrder?.order_items || []).map((it: any) => ({
          name: it.product?.name || it.product_name || "Product",
          quantity: it.quantity || 1,
          total: Number(it.total_price ?? (it.unit_price || 0) * (it.quantity || 1)),
        })),
        subtotal: Number(fullOrder?.subtotal || 0),
        shipping: Number(fullOrder?.shipping_cost || 0),
        discount: Number(fullOrder?.discount_amount || 0),
        total: Number(fullOrder?.total ?? amountGross),
      }

      // Send the order confirmation email (never blocks the ITN).
      await sendOrderConfirmationEmail(customerEmail, emailData)

      // Alert the store owner on WhatsApp about the successful purchase.
      const isPickup = fullOrder?.shipping_method === "pickup"
      await sendOwnerPurchaseAlert({
        orderNumber: orderNumber || fullOrder?.order_number || "",
        total: Number(fullOrder?.total ?? amountGross),
        customerName,
        customerPhone:
          fullOrder?.shipping_phone || fullOrder?.billing_phone || null,
        items: (fullOrder?.order_items || []).map((it: any) => ({
          name: it.product?.name || it.product_name || "Product",
          quantity: it.quantity || 1,
        })),
        fulfilment: isPickup
          ? "Collection / pickup"
          : `Delivery${fullOrder?.shipping_city ? ` to ${fullOrder.shipping_city}` : ""}`,
      })

      // Auto-create Fastway shipment if shipping method is delivery
      if (fullOrder && fullOrder.shipping_method !== "pickup") {
        try {
          const customerAddress: ShippingAddress = {
            name: `${fullOrder.shipping_first_name || fullOrder.billing_first_name} ${fullOrder.shipping_last_name || fullOrder.billing_last_name}`,
            street: fullOrder.shipping_address_line1 || fullOrder.billing_address_line1 || "",
            suburb:
              fullOrder.shipping_address_line2 ||
              fullOrder.shipping_city ||
              fullOrder.billing_address_line2 ||
              fullOrder.billing_city ||
              "",
            city: fullOrder.shipping_city || fullOrder.billing_city || "",
            postalCode: fullOrder.shipping_postal_code || fullOrder.billing_postal_code || "",
            province: fullOrder.shipping_province || fullOrder.billing_province || "",
            phone: fullOrder.shipping_phone || fullOrder.billing_phone || "",
            email: customerEmail,
          }

          const items = (fullOrder.order_items || []).map((item: any) => ({
            description: item.product?.name || item.product_name || "Product",
            weight: item.product?.weight || 1,
            quantity: item.quantity || 1,
          }))

          const serviceType = fullOrder.shipping_method === "express" ? "EXPRESS" : "ROAD"

          const shipment = await createShipment(
            AGRIHUB_WAREHOUSE,
            customerAddress,
            items,
            serviceType
          )

          if (shipment) {
            const trackingUrl = `${SITE_URL}/track?trackingNumber=${encodeURIComponent(shipment.trackingNumber)}`

            // Update order with tracking info
            await supabaseAdmin
              .from("orders")
              .update({
                tracking_number: shipment.trackingNumber,
                tracking_url: trackingUrl,
                shipping_label_url: shipment.labelUrl,
                courier_service: "fastway",
                status: "shipped",
              })
              .eq("id", orderId)

            console.log(`[v0] Fastway shipment created for order ${orderNumber}: ${shipment.trackingNumber}`)

            // Send the tracking email (never blocks the ITN).
            await sendOrderTrackingEmail(customerEmail, {
              ...emailData,
              trackingNumber: shipment.trackingNumber,
              trackingUrl,
            })
          } else {
            console.log(`[v0] Could not auto-create shipment for order ${orderNumber}, manual creation required`)
          }
        } catch (shipmentError) {
          console.error("[v0] Auto shipment creation failed:", shipmentError)
          // Don't fail the ITN - shipment can be created manually
        }
      }
    }

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("[v0] PayFast ITN error:", error)
    return new NextResponse("ERROR", { status: 500 })
  }
}
