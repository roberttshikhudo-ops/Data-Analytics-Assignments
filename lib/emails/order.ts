import { Resend } from "resend"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://agrihubsa.co.za"

// Resend requires a verified domain for the "from" address. Until
// agrihubsa.co.za is verified in Resend, the shared onboarding domain is used.
const FROM_EMAIL =
  process.env.ORDER_FROM_EMAIL ||
  process.env.CONTACT_FROM_EMAIL ||
  "Agri Hub SA <onboarding@resend.dev>"

export interface OrderEmailItem {
  name: string
  quantity: number
  /** Line total for this item (unit price x quantity). */
  total: number
}

export interface OrderEmailData {
  orderNumber: string
  customerName?: string | null
  items: OrderEmailItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  trackingNumber?: string | null
  trackingUrl?: string | null
}

function formatRand(amount: number): string {
  return `R${(Number(amount) || 0).toFixed(2)}`
}

function trackUrlFor(data: OrderEmailData): string {
  if (data.trackingUrl) return data.trackingUrl
  if (data.trackingNumber) {
    return `${BASE_URL}/track?trackingNumber=${encodeURIComponent(data.trackingNumber)}`
  }
  return `${BASE_URL}/track`
}

/**
 * Sends the order confirmation email after a successful payment. Never throws,
 * so a mail failure can never block the payment/fulfillment flow.
 */
export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderEmailData,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[v0] RESEND_API_KEY is not set - skipping confirmation email")
    return false
  }
  if (!to) {
    console.error("[v0] No recipient email - skipping confirmation email")
    return false
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Order confirmed - ${data.orderNumber}`,
      html: buildConfirmationHtml(data),
    })
    if (error) {
      console.error("[v0] Confirmation email send error:", error)
      return false
    }
    console.log(`[v0] Order confirmation email sent for ${data.orderNumber}`)
    return true
  } catch (err) {
    console.error("[v0] Confirmation email exception:", err)
    return false
  }
}

/**
 * Sends the shipping/tracking email once a tracking number is available. Never
 * throws.
 */
export async function sendOrderTrackingEmail(
  to: string,
  data: OrderEmailData,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[v0] RESEND_API_KEY is not set - skipping tracking email")
    return false
  }
  if (!to) {
    console.error("[v0] No recipient email - skipping tracking email")
    return false
  }
  if (!data.trackingNumber) {
    console.error("[v0] No tracking number - skipping tracking email")
    return false
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Your order is on its way - ${data.orderNumber}`,
      html: buildTrackingHtml(data),
    })
    if (error) {
      console.error("[v0] Tracking email send error:", error)
      return false
    }
    console.log(`[v0] Order tracking email sent for ${data.orderNumber}`)
    return true
  } catch (err) {
    console.error("[v0] Tracking email exception:", err)
    return false
  }
}

/**
 * Sends an "order received" email as soon as an order is placed (before
 * payment). Confirms we have the order and are processing it. Never throws.
 */
export async function sendOrderReceivedEmail(
  to: string,
  data: OrderEmailData,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[v0] RESEND_API_KEY is not set - skipping order received email")
    return false
  }
  if (!to) {
    console.error("[v0] No recipient email - skipping order received email")
    return false
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `We received your order - ${data.orderNumber}`,
      html: buildReceivedHtml(data),
    })
    if (error) {
      console.error("[v0] Order received email send error:", error)
      return false
    }
    console.log(`[v0] Order received email sent for ${data.orderNumber}`)
    return true
  } catch (err) {
    console.error("[v0] Order received email exception:", err)
    return false
  }
}

export type OrderStatusKey =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"

const STATUS_COPY: Record<OrderStatusKey, { title: string; subtitle: string; message: string }> = {
  pending: {
    title: "Order Received",
    subtitle: "We&rsquo;ve got your order",
    message:
      "Thank you for your order! We&rsquo;ve received it and it&rsquo;s awaiting confirmation. We&rsquo;ll keep you posted as it progresses.",
  },
  processing: {
    title: "Order Being Prepared",
    subtitle: "We&rsquo;re getting your order ready",
    message:
      "Good news &ndash; your order is now being prepared for delivery. We&rsquo;ll let you know as soon as it&rsquo;s on its way.",
  },
  shipped: {
    title: "Order On Its Way",
    subtitle: "Your order has been dispatched",
    message:
      "Your order is on its way to you! If a tracking number is available, you&rsquo;ll receive it in a separate email.",
  },
  delivered: {
    title: "Order Delivered",
    subtitle: "Your order has arrived",
    message:
      "Your order has been marked as delivered. We hope you love it! Thank you for shopping with Agri Hub SA.",
  },
  cancelled: {
    title: "Order Cancelled",
    subtitle: "Your order has been cancelled",
    message:
      "Your order has been cancelled. If this wasn&rsquo;t expected or you have any questions, please contact us and we&rsquo;ll be happy to help.",
  },
  refunded: {
    title: "Order Refunded",
    subtitle: "Your refund has been processed",
    message:
      "A refund has been processed for your order. Please allow a few business days for it to reflect in your account.",
  },
}

/**
 * Sends a status-update email whenever an order&rsquo;s status changes. Never
 * throws, so a mail failure can never block the fulfillment flow.
 */
export async function sendOrderStatusEmail(
  to: string,
  data: OrderEmailData,
  status: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[v0] RESEND_API_KEY is not set - skipping status email")
    return false
  }
  if (!to) {
    console.error("[v0] No recipient email - skipping status email")
    return false
  }

  const key = (String(status).toLowerCase() as OrderStatusKey)
  const copy = STATUS_COPY[key]
  if (!copy) {
    console.log(`[v0] No status email template for status "${status}" - skipping`)
    return false
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `${copy.title} - ${data.orderNumber}`,
      html: buildStatusHtml(data, copy),
    })
    if (error) {
      console.error("[v0] Status email send error:", error)
      return false
    }
    console.log(`[v0] Order status (${status}) email sent for ${data.orderNumber}`)
    return true
  } catch (err) {
    console.error("[v0] Status email exception:", err)
    return false
  }
}

function itemRows(items: OrderEmailItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #e5e7eb; font-size:14px; color:#1f2937;">
            ${escapeHtml(item.name)}
            <span style="color:#6b7280;">&times; ${item.quantity}</span>
          </td>
          <td style="padding:10px 0; border-bottom:1px solid #e5e7eb; font-size:14px; color:#1f2937; text-align:right; white-space:nowrap;">
            ${formatRand(item.total)}
          </td>
        </tr>`,
    )
    .join("")
}

function totalsBlock(data: OrderEmailData): string {
  const rows: string[] = [
    `<tr><td style="padding:4px 0; font-size:14px; color:#4b5563;">Subtotal</td><td style="padding:4px 0; font-size:14px; color:#4b5563; text-align:right;">${formatRand(data.subtotal)}</td></tr>`,
  ]
  if (data.discount > 0) {
    rows.push(
      `<tr><td style="padding:4px 0; font-size:14px; color:#15803d;">Discount</td><td style="padding:4px 0; font-size:14px; color:#15803d; text-align:right;">-${formatRand(data.discount)}</td></tr>`,
    )
  }
  rows.push(
    `<tr><td style="padding:4px 0; font-size:14px; color:#4b5563;">Shipping</td><td style="padding:4px 0; font-size:14px; color:#4b5563; text-align:right;">${data.shipping > 0 ? formatRand(data.shipping) : "FREE"}</td></tr>`,
  )
  rows.push(
    `<tr><td style="padding:10px 0 0; font-size:16px; font-weight:bold; color:#166534;">Total</td><td style="padding:10px 0 0; font-size:16px; font-weight:bold; color:#166534; text-align:right;">${formatRand(data.total)}</td></tr>`,
  )
  return rows.join("")
}

function shell(headerTitle: string, headerSubtitle: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(headerTitle)}</title>
</head>
<body style="margin:0; padding:0; background:#f4f5f4; font-family: Arial, Helvetica, sans-serif; color:#1f2937;">
  <div style="max-width:600px; margin:0 auto; padding:24px;">
    <div style="background:#166534; padding:32px 24px; border-radius:12px 12px 0 0; text-align:center;">
      <h1 style="margin:0; color:#ffffff; font-size:24px;">${escapeHtml(headerTitle)}</h1>
      <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:15px;">${escapeHtml(headerSubtitle)}</p>
    </div>
    <div style="background:#ffffff; padding:32px 24px; border:1px solid #e5e7eb; border-top:none;">
      ${bodyHtml}
    </div>
    <div style="background:#1f2937; padding:20px 24px; border-radius:0 0 12px 12px; text-align:center;">
      <p style="margin:0; color:#ffffff; font-size:13px;">Agri Hub SA</p>
      <p style="margin:6px 0 0; color:rgba(255,255,255,0.7); font-size:12px;">
        www.agrihubsa.co.za &middot; robert.tshikhudo@gmail.com
      </p>
    </div>
  </div>
</body>
</html>`
}

function buildConfirmationHtml(data: OrderEmailData): string {
  const greeting = data.customerName ? `Hi ${escapeHtml(data.customerName)},` : "Hi there,"
  const body = `
    <p style="margin:0 0 16px; font-size:16px;">${greeting}</p>
    <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">
      Thank you for your order! We&rsquo;ve received your payment and your order is now being prepared.
      You&rsquo;ll receive another email with tracking details as soon as it ships.
    </p>

    <div style="border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin-bottom:24px;">
      <p style="margin:0 0 4px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#15803d;">Order number</p>
      <p style="margin:0; font-size:20px; font-weight:bold; color:#166534;">${escapeHtml(data.orderNumber)}</p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px;">
      ${itemRows(data.items)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:24px;">
      ${totalsBlock(data)}
    </table>

    <div style="text-align:center; margin-bottom:8px;">
      <a href="${BASE_URL}/track" style="display:inline-block; background:#166534; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; font-weight:bold;">
        Track Your Order
      </a>
    </div>
    <p style="margin:16px 0 0; font-size:14px; line-height:1.6; color:#6b7280;">
      Questions about your order? Just reply to this email or contact us at robert.tshikhudo@gmail.com.
    </p>`
  return shell("Order Confirmed", "Thank you for shopping with Agri Hub SA", body)
}

function buildReceivedHtml(data: OrderEmailData): string {
  const greeting = data.customerName ? `Hi ${escapeHtml(data.customerName)},` : "Hi there,"
  const body = `
    <p style="margin:0 0 16px; font-size:16px;">${greeting}</p>
    <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">
      Thank you for your order! We&rsquo;ve received it and our team is on it. This email confirms the details below &ndash;
      we&rsquo;ll notify you again as your order status changes.
    </p>

    <div style="border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin-bottom:24px;">
      <p style="margin:0 0 4px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#15803d;">Order number</p>
      <p style="margin:0; font-size:20px; font-weight:bold; color:#166534;">${escapeHtml(data.orderNumber)}</p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px;">
      ${itemRows(data.items)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:24px;">
      ${totalsBlock(data)}
    </table>

    <div style="text-align:center; margin-bottom:8px;">
      <a href="${BASE_URL}/track" style="display:inline-block; background:#166534; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; font-weight:bold;">
        Track Your Order
      </a>
    </div>
    <p style="margin:16px 0 0; font-size:14px; line-height:1.6; color:#6b7280;">
      Questions about your order? Just reply to this email or contact us at robert.tshikhudo@gmail.com.
    </p>`
  return shell("Order Received", "Thank you for shopping with Agri Hub SA", body)
}

function buildStatusHtml(
  data: OrderEmailData,
  copy: { title: string; subtitle: string; message: string },
): string {
  const greeting = data.customerName ? `Hi ${escapeHtml(data.customerName)},` : "Hi there,"
  const body = `
    <p style="margin:0 0 16px; font-size:16px;">${greeting}</p>
    <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">${copy.message}</p>

    <div style="border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin-bottom:24px;">
      <p style="margin:0 0 4px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#15803d;">Order number</p>
      <p style="margin:0; font-size:20px; font-weight:bold; color:#166534;">${escapeHtml(data.orderNumber)}</p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:24px;">
      ${totalsBlock(data)}
    </table>

    <div style="text-align:center; margin-bottom:8px;">
      <a href="${BASE_URL}/track" style="display:inline-block; background:#166534; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; font-weight:bold;">
        Track Your Order
      </a>
    </div>
    <p style="margin:16px 0 0; font-size:14px; line-height:1.6; color:#6b7280;">
      Questions? Just reply to this email or contact us at robert.tshikhudo@gmail.com.
    </p>`
  return shell(copy.title, copy.subtitle, body)
}

function buildTrackingHtml(data: OrderEmailData): string {
  const greeting = data.customerName ? `Hi ${escapeHtml(data.customerName)},` : "Hi there,"
  const url = trackUrlFor(data)
  const body = `
    <p style="margin:0 0 16px; font-size:16px;">${greeting}</p>
    <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">
      Great news &ndash; your order <strong>${escapeHtml(data.orderNumber)}</strong> has been shipped and is on its way to you.
    </p>

    <div style="border:2px dashed #166534; border-radius:10px; padding:20px; text-align:center; background:#f0fdf4; margin-bottom:24px;">
      <p style="margin:0 0 6px; font-size:13px; letter-spacing:1px; text-transform:uppercase; color:#15803d;">Tracking number</p>
      <p style="margin:0; font-size:24px; font-weight:bold; letter-spacing:2px; color:#166534;">${escapeHtml(data.trackingNumber || "")}</p>
    </div>

    <div style="text-align:center; margin-bottom:8px;">
      <a href="${url}" style="display:inline-block; background:#166534; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; font-weight:bold;">
        Track Your Delivery
      </a>
    </div>
    <p style="margin:16px 0 0; font-size:14px; line-height:1.6; color:#6b7280;">
      You can also track your order anytime at ${BASE_URL}/track using the tracking number above.
    </p>`
  return shell("Your Order Has Shipped", "Track your delivery from Agri Hub SA", body)
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
