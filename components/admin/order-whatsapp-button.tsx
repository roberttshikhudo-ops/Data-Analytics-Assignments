"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface OrderWhatsAppButtonProps {
  orderNumber: string
  phone: string | null
  customerName: string | null
  status: string
  deliveryStatus: string
  total: number
  balance: number
}

const STATUS_MESSAGE: Record<string, string> = {
  pending: "we have received your order and it is being confirmed",
  processing: "your order is now being prepared",
  shipped: "your order is on its way",
  delivered: "your order has been delivered",
  cancelled: "your order has been cancelled",
  refunded: "your order has been refunded",
}

/** Converts a local SA number (0XX...) to international format for wa.me. */
function toWaNumber(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "")
  if (digits.startsWith("+")) return digits.slice(1)
  if (digits.startsWith("27")) return digits
  if (digits.startsWith("0")) return `27${digits.slice(1)}`
  return digits
}

function formatRand(amount: number): string {
  return `R${(Number(amount) || 0).toFixed(2)}`
}

export function OrderWhatsAppButton({
  orderNumber,
  phone,
  customerName,
  status,
  deliveryStatus,
  total,
  balance,
}: OrderWhatsAppButtonProps) {
  const statusLine =
    deliveryStatus === "delivered"
      ? STATUS_MESSAGE.delivered
      : STATUS_MESSAGE[status] || `your order status is now ${status}`

  const defaultMessage = [
    `Hi ${customerName || "there"},`,
    ``,
    `This is Agri Hub SA. An update on your order ${orderNumber}: ${statusLine}.`,
    ``,
    `Order total: ${formatRand(total)}`,
    balance > 0 ? `Balance outstanding: ${formatRand(balance)}` : `Payment: fully paid. Thank you!`,
    ``,
    `Reply here if you have any questions. Thank you for shopping with us!`,
  ].join("\n")

  const [message, setMessage] = useState(defaultMessage)

  const waNumber = phone ? toWaNumber(phone) : ""
  const href = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
    : ""

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notify via WhatsApp</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {phone ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="wa-message" className="text-xs text-muted-foreground">
                Message to {phone}
              </Label>
              <Textarea
                id="wa-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="text-sm"
              />
            </div>
            <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5b]">
              <a href={href} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Open in WhatsApp
              </a>
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No phone number on this order. Add a phone number to the customer to send a WhatsApp update.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
