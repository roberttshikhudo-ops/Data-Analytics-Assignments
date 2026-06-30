import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderConfirmationEmail, type OrderEmailData } from "@/lib/emails/order"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

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
    // `to` lets an admin resend a receipt to a specific address (e.g. a copy to
    // themselves, or a corrected customer address).
    const { orderId, orderNumber, to } = body

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: "orderId or orderNumber is required" },
        { status: 400 },
      )
    }

    const query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*, product:products(name))")
    const { data: order, error } = orderId
      ? await query.eq("id", orderId).single()
      : await query.eq("order_number", orderNumber).single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const customerEmail = (to || "").trim() || (await resolveCustomerEmail(order))
    if (!customerEmail) {
      return NextResponse.json(
        { error: "No customer email on this order" },
        { status: 400 },
      )
    }

    const emailData: OrderEmailData = {
      orderNumber: order.order_number || "",
      customerName:
        [order.shipping_first_name, order.shipping_last_name].filter(Boolean).join(" ") ||
        null,
      items: (order.order_items || []).map((it: any) => ({
        name: it.product?.name || it.product_name || "Product",
        quantity: it.quantity || 1,
        total: Number(it.total_price ?? (it.unit_price || 0) * (it.quantity || 1)),
      })),
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping_cost || 0),
      discount: Number(order.discount_amount || 0),
      total: Number(order.total || 0),
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
    }

    const sent = await sendOrderConfirmationEmail(customerEmail, emailData)

    return NextResponse.json({ success: sent, to: customerEmail })
  } catch (err) {
    console.error("[v0] Send confirmation error:", err)
    return NextResponse.json({ error: "Failed to send confirmation" }, { status: 500 })
  }
}
