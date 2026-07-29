import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createShipment,
  generateTrackingNumber,
  AGRIHUB_WAREHOUSE,
  type ShippingAddress,
} from "@/lib/fastway"
import { sendOrderTrackingEmail, type OrderEmailData } from "@/lib/emails/order"

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://agrihubsa.co.za"

export type FulfilStatus =
  | "created" // real Fastway waybill created
  | "provisional" // tracking number generated, Fastway waybill pending
  | "skipped_pickup" // local pickup order, no shipment needed
  | "already_fulfilled" // order already has a real Fastway waybill
  | "not_found"

export interface FulfilResult {
  status: FulfilStatus
  trackingNumber?: string
  trackingUrl?: string
  labelUrl?: string
  viaFastway?: boolean
  emailSent?: boolean
}

// Resolves the customer's email. Guest checkouts store it in guest_email;
// registered users have it in Supabase auth.
async function resolveCustomerEmail(
  supabaseAdmin: SupabaseClient,
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

/**
 * Ensures a paid delivery order has a tracking number linked to Fastway.
 *
 * It attempts to create a real Fastway waybill; if Fastway is unavailable or
 * not configured, it generates a provisional tracking number so the order
 * ALWAYS gets tracking automatically. The order row is updated and the
 * customer tracking email is sent. This never throws so it can be safely
 * called from payment webhooks.
 *
 * Pass `force: true` to retry Fastway for an order that only has a provisional
 * number (no real waybill/label yet).
 */
export async function fulfilOrderShipment(
  supabaseAdmin: SupabaseClient,
  orderId: string,
  opts: { serviceType?: string; force?: boolean } = {},
): Promise<FulfilResult> {
  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*, product:products(name, weight))")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return { status: "not_found" }
    }

    // Local pickup orders never need a shipment.
    if (order.shipping_method === "pickup") {
      return { status: "skipped_pickup" }
    }

    // Already has a REAL Fastway waybill (label present) - nothing to do
    // unless we are explicitly forcing a retry.
    if (order.tracking_number && order.shipping_label_url && !opts.force) {
      return {
        status: "already_fulfilled",
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url || undefined,
        labelUrl: order.shipping_label_url || undefined,
        viaFastway: true,
      }
    }

    const customerEmail = await resolveCustomerEmail(supabaseAdmin, order)

    const deliveryAddress: ShippingAddress = {
      name: `${order.shipping_first_name || order.billing_first_name || ""} ${
        order.shipping_last_name || order.billing_last_name || ""
      }`.trim(),
      company: order.shipping_company || "",
      street: order.shipping_address_line1 || order.billing_address_line1 || "",
      suburb:
        order.shipping_address_line2 ||
        order.shipping_city ||
        order.billing_address_line2 ||
        order.billing_city ||
        "",
      city: order.shipping_city || order.billing_city || "",
      postalCode: order.shipping_postal_code || order.billing_postal_code || "",
      province: order.shipping_province || order.billing_province || "",
      phone: order.shipping_phone || order.billing_phone || "",
      email: customerEmail,
    }

    const items = (order.order_items || []).map((item: any) => ({
      description: item.product?.name || item.product_name || "Product",
      weight: item.product?.weight || 1,
      quantity: item.quantity || 1,
    }))

    const serviceType =
      opts.serviceType || (order.shipping_method === "express" ? "EXPRESS" : "ROAD")

    // Attempt to create a real Fastway waybill.
    const shipment = await createShipment(
      AGRIHUB_WAREHOUSE,
      deliveryAddress,
      items.length
        ? items
        : [{ description: "Agri Hub SA Order", weight: 5, quantity: 1 }],
      serviceType,
    )

    // Fall back to a provisional tracking number so the order is never left
    // without one when Fastway is unreachable.
    const viaFastway = Boolean(shipment)
    const trackingNumber =
      shipment?.trackingNumber || generateTrackingNumber(order.order_number)
    const labelUrl = shipment?.labelUrl || ""
    const trackingUrl = `${SITE_URL}/track?trackingNumber=${encodeURIComponent(
      trackingNumber,
    )}`

    await supabaseAdmin
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        shipping_label_url: labelUrl,
        courier_service: "fastway",
        status: "shipped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    console.log(
      `[v0] Shipment fulfilled for order ${order.order_number}: ${trackingNumber} (${
        viaFastway ? "Fastway waybill" : "provisional - awaiting Fastway waybill"
      })`,
    )

    // Send the tracking email to the customer.
    const emailData: OrderEmailData = {
      orderNumber: order.order_number || "",
      customerName:
        [order.shipping_first_name, order.shipping_last_name]
          .filter(Boolean)
          .join(" ") || null,
      items: (order.order_items || []).map((it: any) => ({
        name: it.product?.name || it.product_name || "Product",
        quantity: it.quantity || 1,
        total: Number(it.total_price ?? (it.unit_price || 0) * (it.quantity || 1)),
      })),
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping_cost || 0),
      discount: Number(order.discount_amount || 0),
      total: Number(order.total || 0),
      trackingNumber,
      trackingUrl,
    }
    const emailSent = await sendOrderTrackingEmail(customerEmail, emailData)

    return {
      status: viaFastway ? "created" : "provisional",
      trackingNumber,
      trackingUrl,
      labelUrl,
      viaFastway,
      emailSent,
    }
  } catch (err) {
    console.error("[v0] fulfilOrderShipment error:", err)
    return { status: "not_found" }
  }
}
