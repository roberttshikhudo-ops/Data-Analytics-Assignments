"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Loader2 } from "lucide-react"

export function CreateShipmentButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provisional, setProvisional] = useState(false)

  const handleCreate = async (force = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/shipping/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, force }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Failed to create shipment")
        return
      }
      // A provisional number means Fastway was unreachable and a fallback
      // tracking number was generated - the admin can retry for a real waybill.
      if (data.provisional) {
        setProvisional(true)
      } else {
        router.refresh()
      }
    } catch {
      setError("Failed to create shipment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Fulfillment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Create a Fastway shipment for this order. A tracking number is generated
          automatically and emailed to the customer.
        </p>
        <Button onClick={() => handleCreate(false)} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating shipment...
            </>
          ) : (
            <>
              <Truck className="mr-2 h-4 w-4" />
              Create Fastway Shipment
            </>
          )}
        </Button>
        {provisional && (
          <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              A provisional tracking number was generated because Fastway could not be
              reached. The customer has been emailed. Retry to create the real Fastway
              waybill once the connection is available.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreate(true)}
              disabled={isLoading}
            >
              Retry Fastway waybill
            </Button>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
