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

/** Builds a full wa.me link, or "" when there is no usable phone number. */
export function buildWaLink(phone: string | null | undefined, message: string): string {
  if (!phone) return ""
  const waNumber = toWaNumber(phone)
  if (!waNumber) return ""
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}
