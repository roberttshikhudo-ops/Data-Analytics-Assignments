"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateDelivery } from "@/app/(admin)/admin/orders/actions"
import { Truck } from "lucide-react"

const DELIVERY_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "collect", label: "For collection" },
  { value: "collected", label: "Collected" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  scheduled: "outline",
  out_for_delivery: "outline",
  delivered: "default",
  collect: "secondary",
  collected: "default",
}

export function OrderDeliveryPanel({
  orderId,
  deliveryStatus,
  deliveryArea,
  expectedDeliveryDate,
  deliveryNotes,
}: {
  orderId: string
  deliveryStatus: string
  deliveryArea: string | null
  expectedDeliveryDate: string | null
  deliveryNotes: string | null
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(deliveryStatus || "pending")
  const [area, setArea] = useState(deliveryArea || "")
  const [date, setDate] = useState(expectedDeliveryDate || "")
  const [notes, setNotes] = useState(deliveryNotes || "")

  async function handleSave() {
    setSaving(true)
    try {
      await updateDelivery({
        orderId,
        delivery_status: status,
        delivery_area: area,
        expected_delivery_date: date || null,
        delivery_notes: notes,
      })
      toast.success("Delivery updated")
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update delivery")
    } finally {
      setSaving(false)
    }
  }

  const label = DELIVERY_STATUSES.find((s) => s.value === status)?.label || status

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery
          <Badge variant={statusVariant[status] || "secondary"} className="ml-auto">
            {label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="d-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="d-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="d-area">Delivery area</Label>
          <Input
            id="d-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Midrand"
          />
        </div>
        <div>
          <Label htmlFor="d-date">Expected date</Label>
          <Input
            id="d-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="d-notes">Notes</Label>
          <Input
            id="d-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Gate code, landmark, etc."
          />
        </div>
        <Button size="sm" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Update delivery"}
        </Button>
      </CardContent>
    </Card>
  )
}
