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
