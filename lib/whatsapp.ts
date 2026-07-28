/**
 * Shared helpers for building WhatsApp "click to chat" links used across the
 * admin to notify customers about their order status. This keeps the SA phone
 * number normalisation and message copy consistent everywhere.
 */

/** Converts a local SA number (0XX...) to international format for wa.me. */
export function toWaNumber(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "")
  if (digits.startsWith("+")) return digits.slice(1)
  if (digits.startsWith("27")) return digits
  if (digits.startsWith("0")) return `27${digits.slice(1)}`
  return digits
}

function formatRand(amount: number): string {
  return `R${(Number(amount) || 0).toFixed(2)}`
}

const STATUS_MESSAGE: Record<string, string> = {
  pending: "we have received your order and it is being confirmed",
  processing: "your order is now being prepared",
  shipped: "your order is on its way",
  delivered: "your order has been delivered",
  cancelled: "your order has been cancelled",
  refunded: "your order has been refunded",
}

export interface WhatsAppMessageInput {
  orderNumber: string
  customerName: string | null
  status: string
  deliveryStatus: string
  total: number
  balance: number
}

/** Builds the default order-status update message shown to the customer. */
export function buildOrderStatusMessage({
  orderNumber,
  customerName,
  status,
  deliveryStatus,
  total,
  balance,
}: WhatsAppMessageInput): string {
  const statusLine =
    deliveryStatus === "delivered" || deliveryStatus === "collected"
      ? STATUS_MESSAGE.delivered
      : STATUS_MESSAGE[status] || `your order status is now ${status}`

  return [
    `Hi ${customerName || "there"},`,
    ``,
    `This is Agri Hub SA. An update on your order ${orderNumber}: ${statusLine}.`,
    ``,
    `Order total: ${formatRand(total)}`,
    balance > 0
      ? `Balance outstanding: ${formatRand(balance)}`
      : `Payment: fully paid. Thank you!`,
    ``,
    `Reply here if you have any questions. Thank you for shopping with us!`,
  ].join("\n")
}

export interface ProformaMessageInput {
  orderNumber: string
  customerName: string | null
  total: number
  link: string
}

/** Builds the message used when sending a pro forma invoice link to a client. */
export function buildProformaMessage({
  orderNumber,
  customerName,
  total,
  link,
}: ProformaMessageInput): string {
  return [
    `Hi ${customerName || "there"},`,
    ``,
    `Thank you for your interest in Agri Hub SA. Please find the pro forma invoice for your order ${orderNumber} below.`,
    ``,
    `Amount due: ${formatRand(total)}`,
    ``,
    `View & save your pro forma invoice here:`,
    link,
    ``,
    `Banking details for payment:`,
    `Bank: First National Bank (FNB)`,
    `Account Name: Agri Hub SA`,
    `Account Number: 63014180606`,
    `Branch Code: 250655`,
    `Reference: ${orderNumber}`,
    ``,
    `Once payment is made, kindly send proof of payment here. Thank you!`,
  ].join("\n")
}

export interface InvoiceMessageInput {
  invoiceNumber: string
  customerName: string | null
  total: number
  balance?: number
  link: string
}

/** Builds the message used when sending a tax invoice link to a client. */
export function buildInvoiceMessage({
  invoiceNumber,
  customerName,
  total,
  balance,
  link,
}: InvoiceMessageInput): string {
  const outstanding = typeof balance === "number" ? balance : 0
  return [
    `Hi ${customerName || "there"},`,
    ``,
    `Thank you for shopping with Agri Hub SA. Please find your tax invoice ${invoiceNumber} below.`,
    ``,
    `Invoice total: ${formatRand(total)}`,
    outstanding > 0
      ? `Balance outstanding: ${formatRand(outstanding)}`
      : `Payment: fully paid. Thank you!`,
    ``,
    `View & save your invoice here:`,
    link,
    ``,
    `Reply here if you have any questions. Thank you!`,
  ].join("\n")
}

/** Builds a full wa.me link, or "" when there is no usable phone number. */
export function buildWaLink(phone: string | null | undefined, message: string): string {
  if (!phone) return ""
  const waNumber = toWaNumber(phone)
  if (!waNumber) return ""
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}

/* -------------------------------------------------------------------------- */
/*  Owner purchase alerts via the Meta WhatsApp Cloud API                     */
/* -------------------------------------------------------------------------- */

// Number that receives owner alerts (defaults to the store owner's number).
const DEFAULT_ALERT_NUMBER = "27833061529"

/**
 * WhatsApp template parameters must be single-line: Meta rejects values with
 * newlines, tabs, or 4+ consecutive spaces. This flattens any such text.
 */
function sanitizeParam(value: string): string {
  return (value || "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{4,}/g, "   ")
    .trim()
    .slice(0, 900) // stay well under WhatsApp's per-parameter limit
}

export interface PurchaseAlertInput {
  orderNumber: string
  total: number
  customerName: string | null
  customerPhone: string | null
  items: { name: string; quantity: number }[]
  fulfilment: string
}

/** Builds the human-readable alert body (used for the free-form fallback + logs). */
export function buildPurchaseAlertMessage(input: PurchaseAlertInput): string {
  const itemLines = input.items.length
    ? input.items.map((it) => `- ${it.quantity}x ${it.name}`).join("\n")
    : "- (no items listed)"
  return [
    `New online order paid on Agri Hub SA!`,
    ``,
    `Order: ${input.orderNumber}`,
    `Total: ${formatRand(input.total)}`,
    `Customer: ${input.customerName || "Guest"}`,
    `Phone: ${input.customerPhone || "N/A"}`,
    `Fulfilment: ${input.fulfilment}`,
    ``,
    `Items:`,
    itemLines,
  ].join("\n")
}

/** The six ordered template parameters matching the `order_alert` template body. */
function buildTemplateParams(input: PurchaseAlertInput): string[] {
  const itemsSummary = input.items.length
    ? input.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")
    : "No items listed"
  return [
    input.orderNumber,
    formatRand(input.total),
    input.customerName || "Guest",
    input.customerPhone || "N/A",
    itemsSummary,
    input.fulfilment,
  ].map(sanitizeParam)
}

/**
 * Sends a WhatsApp alert to the store owner about a successful online purchase
 * using the Meta Cloud API. Prefers an approved message template (reliable, no
 * 24-hour window restriction) and falls back to a free-form text message.
 *
 * This never throws: notification failures must not break the payment webhook.
 */
export async function sendOwnerPurchaseAlert(
  input: PurchaseAlertInput,
): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const to = toWaNumber(process.env.WHATSAPP_ALERT_NUMBER || DEFAULT_ALERT_NUMBER)

  if (!token || !phoneNumberId) {
    console.log(
      "[v0] WhatsApp alert skipped: WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set.",
    )
    return
  }

  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0"
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`
  const templateName = process.env.WHATSAPP_ALERT_TEMPLATE || "order_alert"
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "en_US"

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    return { ok: res.ok, status: res.status, text }
  }

  try {
    // Preferred: approved template message.
    const templatePayload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: templateLang },
        components: [
          {
            type: "body",
            parameters: buildTemplateParams(input).map((text) => ({
              type: "text",
              text,
            })),
          },
        ],
      },
    }

    const templateResult = await post(templatePayload)
    if (templateResult.ok) {
      console.log(`[v0] WhatsApp purchase alert sent for order ${input.orderNumber}`)
      return
    }

    console.error(
      `[v0] WhatsApp template send failed (${templateResult.status}): ${templateResult.text}. Trying free-form fallback.`,
    )

    // Fallback: free-form text (works only within a 24h customer-initiated window).
    const textResult = await post({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: buildPurchaseAlertMessage(input) },
    })

    if (!textResult.ok) {
      console.error(
        `[v0] WhatsApp free-form fallback also failed (${textResult.status}): ${textResult.text}`,
      )
    }
  } catch (error) {
    console.error("[v0] WhatsApp purchase alert error:", error)
  }
}
