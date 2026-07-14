import Link from "next/link"
import { Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { DeliveriesBoard } from "@/components/admin/deliveries-board"

async function getDeliveries() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      source,
      status,
      payment_status,
      total,
      shipping_method,
      delivery_status,
      delivery_area,
      expected_delivery_date,
      delivery_notes,
      shipping_first_name,
      shipping_last_name,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_province,
      shipping_phone,
      created_at,
      order_items(id),
      order_payments(amount)
    `)
    .not("delivery_status", "in", "(delivered,collected)")
    .order("expected_delivery_date", { ascending: true, nullsFirst: false })

  return orders || []
}

export default async function DeliveriesPage() {
  const orders = await getDeliveries()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deliveries</h1>
          <p className="text-muted-foreground">
            Plan what to deliver, where, and to whom &mdash; grouped by area
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 bg-transparent">
          <Link href="/delivery-plan" target="_blank" rel="noopener noreferrer">
            <Route className="h-4 w-4" />
            Delivery Plan (Print)
          </Link>
        </Button>
      </div>

      <DeliveriesBoard orders={orders} />
    </div>
  )
}
