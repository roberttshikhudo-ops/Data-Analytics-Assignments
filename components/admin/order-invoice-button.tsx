"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderInvoiceButtonProps {
  orderId: string
  existingInvoiceId?: string | null
}

export function OrderInvoiceButton({ orderId, existingInvoiceId }: OrderInvoiceButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleGenerate() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/invoices/from-order/${orderId}`, {
        method: "POST",
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to generate invoice")
        setIsLoading(false)
        return
      }

      toast.success(data.message || "Invoice ready")
      router.push(`/admin/invoices/${data.invoice.id}`)
    } catch (error) {
      console.error("[v0] Error generating invoice:", error)
      toast.error("Something went wrong generating the invoice")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Tax Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {existingInvoiceId ? (
          <Button asChild variant="outline" className="w-full">
            <a href={`/admin/invoices/${existingInvoiceId}`}>
              <FileText className="mr-2 h-4 w-4" />
              View invoice
            </a>
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Generating..." : "Generate invoice"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
