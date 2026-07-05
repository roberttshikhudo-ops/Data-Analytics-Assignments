import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  sendOrderConfirmationEmail,
  sendOrderTrackingEmail,
  type OrderEmailData,
} from "@/lib/emails/order"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://agrihubsa.co.za"

async function resolveCustomerEmail(order: any): Promise<string> {
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

function buildEmailData(order: any): OrderEmailData {
  return {
    orderNumber: order?.order_number || "",
    customerName:
      [order?.shipping_first_name, order?.shipping_last_name]
        .filter(Boolean)
        .join(" ") || null,
    items: (order?.order_items || []).map((it: any) => ({
      name: it.product?.name || it.product_name || "Product",
      quantity: it.quantity || 1,
      total: Number(it.total_price ?? (it.unit_price || 0) * (it.quantity || 1)),
    })),
    subtotal: Number(order?.subtotal || 0),
    shipping: Number(order?.shipping_cost || 0),
    discount: Number(order?.discount_amount || 0),
    total: Number(order?.total || 0),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, paymentStatus, trackingNumber, trackingUrl } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Fetch current order so we can detect what actually changed.
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*, product:products(name))")
      .eq("id", orderId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (status) updates.status = status
    if (paymentStatus) updates.payment_status = paymentStatus

    const trimmedTracking = (trackingNumber || "").trim()
    const isNewTracking =
      trimmedTracking && trimmedTracking !== (existing.tracking_number || "")

    if (trimmedTracking) {
      updates.tracking_number = trimmedTracking
      updates.tracking_url =
        (trackingUrl || "").trim() ||
        `${SITE_URL}/track?trackingNumber=${encodeURIComponent(trimmedTracking)}`
    } else if (trackingUrl) {
      updates.tracking_url = trackingUrl
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Order status update failed:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // Send emails based on what changed (never block the response).
    const customerEmail = await resolveCustomerEmail(existing)
    const emailData = buildEmailData(existing)

    const becamePaid =
      paymentStatus === "paid" && existing.payment_status !== "paid"
    if (becamePaid) {
      await sendOrderConfirmationEmail(customerEmail, emailData)
    }

    if (isNewTracking) {
      await sendOrderTrackingEmail(customerEmail, {
        ...emailData,
        trackingNumber: trimmedTracking,
        trackingUrl: updates.tracking_url,
      })
    }

    return NextResponse.json({
      success: true,
      emailsSent: {
        confirmation: becamePaid && Boolean(customerEmail),
        tracking: Boolean(isNewTracking) && Boolean(customerEmail),
      },
    })
  } catch (error) {
    console.error("[v0] Order status update error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
