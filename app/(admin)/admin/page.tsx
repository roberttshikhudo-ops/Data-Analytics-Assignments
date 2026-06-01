import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

async function getDashboardStats() {
  const supabase = await createClient()

  // Get total products
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  // Get low stock products (threshold of 10 units)
  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id, name, stock_quantity")
    .lte("stock_quantity", 10)
    .gt("stock_quantity", 0)
    .limit(5)

  // Get total orders
  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })

  // Get pending orders
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Get total revenue (paid orders)
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total")
    .eq("payment_status", "paid")

  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get total customers (profiles)
  const { count: customerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer")

  return {
    productCount: productCount || 0,
    orderCount: orderCount || 0,
    pendingOrders: pendingOrders || 0,
    totalRevenue,
    customerCount: customerCount || 0,
    lowStockProducts: lowStockProducts || [],
    recentOrders: recentOrders || [],
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Agri Hub SA Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From paid orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orderCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts.length} low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerCount}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(Number(order.total))}</p>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alert
            </CardTitle>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">Manage</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="h-12 w-12 text-primary mb-2" />
                <p className="text-muted-foreground">All products are well-stocked</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Low stock warning
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {product.stock_quantity} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
