"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import { updateDelivery } from "@/app/(admin)/admin/orders/actions"
import { MapPin, Phone, Package, CheckCircle, Search, Eye } from "lucide-react"

interface DeliveryOrder {
  id: string
  order_number: string
  source: string
  payment_status: string
  total: number
  shipping_method: string
  delivery_status: string
  delivery_area: string | null
  expected_delivery_date: string | null
  delivery_notes: string | null
  shipping_first_name: string | null
  shipping_last_name: string | null
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_province: string | null
  shipping_phone: string | null
  order_items: { id: string }[]
  order_payments: { amount: number }[]
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  out_for_delivery: "Out for delivery",
  collect: "For collection",
}

export function DeliveriesBoard({ orders }: { orders: DeliveryOrder[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const term = search.toLowerCase()
      const name = `${o.shipping_first_name ?? ""} ${o.shipping_last_name ?? ""}`.toLowerCase()
      const matchesSearch =
        !term ||
        o.order_number.toLowerCase().includes(term) ||
        name.includes(term) ||
        (o.delivery_area ?? "").toLowerCase().includes(term) ||
        (o.shipping_city ?? "").toLowerCase().includes(term)
      const matchesStatus = statusFilter === "all" || o.delivery_status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  // Group by area (fall back to city, then "Unassigned")
  const groups = useMemo(() => {
    const map = new Map<string, DeliveryOrder[]>()
    for (const o of filtered) {
      const key = o.delivery_area || o.shipping_city || "Unassigned area"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(o)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  async function markDelivered(o: DeliveryOrder) {
    setBusyId(o.id)
    try {
      await updateDelivery({
        orderId: o.id,
        delivery_status: o.shipping_method === "pickup" ? "collected" : "delivered",
        delivery_area: o.delivery_area || "",
        expected_delivery_date: o.expected_delivery_date,
        delivery_notes: o.delivery_notes || "",
      })
      toast.success(`${o.order_number} marked as delivered`)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update")
    } finally {
      setBusyId(null)
    }
  }

  const totalOutstanding = filtered.reduce((sum, o) => {
    const paid = o.order_payments.reduce((s, p) => s + Number(p.amount), 0)
    return sum + (Number(o.total) - paid)
  }, 0)

  return (
    <div className="space-y-4">
      {/* Summary + filters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Deliveries pending</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Areas</p>
            <p className="text-2xl font-bold">{groups.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Outstanding balance</p>
            <p className="text-2xl font-bold">{formatPrice(totalOutstanding)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, area, city or order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
            <SelectItem value="collect">For collection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No pending deliveries. You are all caught up.
          </CardContent>
        </Card>
      ) : (
        groups.map(([area, list]) => (
          <Card key={area}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                {area}
                <Badge variant="secondary" className="ml-2">
                  {list.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {list.map((o) => {
                const paid = o.order_payments.reduce((s, p) => s + Number(p.amount), 0)
                const balance = Number(o.total) - paid
                return (
                  <div
                    key={o.id}
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {o.shipping_first_name} {o.shipping_last_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {o.order_number}
                        </Badge>
                        {o.source === "manual" && (
                          <Badge variant="secondary" className="text-xs">
                            Manual
                          </Badge>
                        )}
                        {o.shipping_method === "pickup" && (
                          <Badge variant="secondary" className="text-xs">
                            Collection
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {[o.shipping_address_line1, o.shipping_city, o.shipping_province]
                          .filter(Boolean)
                          .join(", ") || "No address"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {o.shipping_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {o.shipping_phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {o.order_items.length} item(s)
                        </span>
                        {o.expected_delivery_date && (
                          <span>
                            Due{" "}
                            {new Date(o.expected_delivery_date).toLocaleDateString("en-ZA")}
                          </span>
                        )}
                      </div>
                      {o.delivery_notes && (
                        <p className="mt-1 text-xs italic text-muted-foreground">
                          {o.delivery_notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(Number(o.total))}</p>
                        {balance > 0 ? (
                          <p className="text-xs text-destructive">
                            {formatPrice(balance)} due
                          </p>
                        ) : (
                          <p className="text-xs text-primary">Paid</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/orders/${o.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => markDelivered(o)}
                          disabled={busyId === o.id}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          {o.shipping_method === "pickup" ? "Collected" : "Delivered"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
