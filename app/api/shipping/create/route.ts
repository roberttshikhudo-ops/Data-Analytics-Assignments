import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createShipment, AGRIHUB_WAREHOUSE, ShippingAddress } from "@/lib/fastway"
import { sendOrderTrackingEmail, type OrderEmailData } from "@/lib/emails/order"

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, serviceType } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Look up the order with its items so we can build the waybill + email.
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*, product:products(name, weight))")
      .eq("id", orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.tracking_number) {
      return NextResponse.json(
        { error: "This order already has a shipment", trackingNumber: order.tracking_number },
        { status: 409 },
      )
    }

    if (order.shipping_method === "pickup") {
      return NextResponse.json(
        { error: "This is a local pickup order and does not need a shipment" },
        { status: 400 },
      )
    }

    const customerEmail = await resolveCustomerEmail(order)

    const deliveryAddress: ShippingAddress = {
      name: `${order.shipping_first_name || ""} ${order.shipping_last_name || ""}`.trim(),
      company: order.shipping_company || "",
      street: order.shipping_address_line1 || "",
      suburb: order.shipping_address_line2 || order.shipping_city || "",
      city: order.shipping_city || "",
      postalCode: order.shipping_postal_code || "",
      province: order.shipping_province || "",
      phone: order.shipping_phone || "",
      email: customerEmail,
    }

    const items = (order.order_items || []).map((item: any) => ({
      description: item.product?.name || item.product_name || "Product",
      weight: item.product?.weight || 1,
      quantity: item.quantity || 1,
    }))

    const resolvedService =
      serviceType || (order.shipping_method === "express" ? "EXPRESS" : "ROAD")

    const shipment = await createShipment(
      AGRIHUB_WAREHOUSE,
      deliveryAddress,
      items.length ? items : [{ description: "Agri Hub SA Order", weight: 5, quantity: 1 }],
      resolvedService,
    )

    if (!shipment) {
      return NextResponse.json(
        { error: "Failed to create shipment with Fastway" },
        { status: 502 },
      )
    }

    const trackingUrl = `${SITE_URL}/track?trackingNumber=${encodeURIComponent(shipment.trackingNumber)}`

    await supabaseAdmin
      .from("orders")
      .update({
        tracking_number: shipment.trackingNumber,
        tracking_url: trackingUrl,
        shipping_label_url: shipment.labelUrl,
        courier_service: "fastway",
        status: "shipped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    // Send the tracking email (never blocks the response).
    const emailData: OrderEmailData = {
      orderNumber: order.order_number || "",
      customerName:
        [order.shipping_first_name, order.shipping_last_name].filter(Boolean).join(" ") || null,
      items: (order.order_items || []).map((it: any) => ({
        name: it.product?.name || it.product_name || "Product",
        quantity: it.quantity || 1,
        total: Number(it.total_price ?? (it.unit_price || 0) * (it.quantity || 1)),
      })),
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping_cost || 0),
      discount: Number(order.discount_amount || 0),
      total: Number(order.total || 0),
      trackingNumber: shipment.trackingNumber,
      trackingUrl,
    }
    await sendOrderTrackingEmail(customerEmail, emailData)

    return NextResponse.json({
      success: true,
      trackingNumber: shipment.trackingNumber,
      trackingUrl,
      labelUrl: shipment.labelUrl,
      emailSent: Boolean(customerEmail),
    })
  } catch (error) {
    console.error("[v0] Create shipment error:", error)
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 })
  }
}
