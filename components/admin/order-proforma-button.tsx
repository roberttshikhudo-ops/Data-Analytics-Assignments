"use client"

import { useMemo, useState } from "react"
import { FileText, MessageCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildProformaMessage, buildWaLink } from "@/lib/whatsapp"

interface OrderProformaButtonProps {
  orderId: string
  orderNumber: string
  phone: string | null
  customerName: string | null
  total: number
}

export function OrderProformaButton({
  orderId,
  orderNumber,
  phone,
  customerName,
  total,
}: OrderProformaButtonProps) {
  // Prefer the configured public domain; fall back to the current origin so
  // the link is always correct in preview and production.
  const [origin] = useState(() => {
    if (typeof window !== "undefined") {
      return process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    }
    return process.env.NEXT_PUBLIC_APP_URL || ""
  })

  const proformaUrl = `${origin}/proforma/${orderId}`

  const waHref = useMemo(() => {
    const message = buildProformaMessage({
      orderNumber,
      customerName,
      total,
      link: proformaUrl,
    })
    return buildWaLink(phone, message)
  }, [orderNumber, customerName, total, proformaUrl, phone])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Pro Forma Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild variant="outline" className="w-full">
          <a href={proformaUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview pro forma
          </a>
        </Button>

        {phone ? (
          <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5b]">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send via WhatsApp
            </a>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add a phone number to this order to send the pro forma via WhatsApp.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
