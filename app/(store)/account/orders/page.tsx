import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Package, ChevronRight } from "lucide-react"
import Link from "next/link"

async function getOrders() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirect=/account/orders")

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
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return orders || []
}

export default async function OrdersPage() {
  const orders = await getOrders()

  const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
    pending: "secondary",
    processing: "secondary",
    paid: "default",
    shipped: "default",
    delivered: "default",
    cancelled: "destructive",
    refunded: "destructive",
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Orders</h2>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
            <p className="mt-2 text-muted-foreground">
              Start shopping to see your orders here
            </p>
            <Link href="/shop">
              <Button className="mt-4">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{order.order_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items Preview */}
                <div className="space-y-2">
                  {order.order_items.slice(0, 2).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span>{formatPrice(Number(item.total_price))}</span>
                    </div>
                  ))}
                  {order.order_items.length > 2 && (
                    <p className="text-sm text-muted-foreground">
                      + {order.order_items.length - 2} more items
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{formatPrice(Number(order.total))}</p>
                  </div>
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Tracking */}
                {order.tracking_number && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="font-mono text-sm">{order.tracking_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
