import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { OrdersTable } from "@/components/admin/orders-table"

async function getOrders() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        id,
        product_name,
        quantity,
        unit_price,
        total_price
      ),
      order_payments(
        amount
      )
    `)
    .order("created_at", { ascending: false })

  return orders || []
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <Link href="/admin/orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      <OrdersTable orders={orders} />
    </div>
  )
}
