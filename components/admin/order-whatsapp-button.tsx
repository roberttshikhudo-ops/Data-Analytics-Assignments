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
import { buildOrderStatusMessage, buildWaLink } from "@/lib/whatsapp"

interface OrderWhatsAppButtonProps {
  orderNumber: string
  phone: string | null
  customerName: string | null
  status: string
  deliveryStatus: string
  total: number
  balance: number
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
  const defaultMessage = buildOrderStatusMessage({
    orderNumber,
    customerName,
    status,
    deliveryStatus,
    total,
    balance,
  })

  const [message, setMessage] = useState(defaultMessage)

  const href = buildWaLink(phone, message)

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
