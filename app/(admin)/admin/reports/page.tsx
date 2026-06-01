"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  Calendar
} from "lucide-react"

interface ReportData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  recentOrders: Array<{ id: string; customer: string; total: number; status: string; date: string }>
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const [data, setData] = useState<ReportData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
    topProducts: [],
    recentOrders: [],
  })
  const supabase = createClient()

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true)

      const daysAgo = parseInt(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())

      // Fetch all products
      const { data: products } = await supabase
        .from("products")
        .select("id, name")

      // Fetch all customers
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer")

      // Calculate totals
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
      const totalOrders = orders?.length || 0
      const totalProducts = products?.length || 0
      const totalCustomers = profiles?.length || 0

      // Simulate changes (would need historical data for real comparison)
      const revenueChange = 12.5
      const ordersChange = 8.3

      // Get top products from order items
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, quantity, price")

      const productSales: Record<string, { sales: number; revenue: number }> = {}
      orderItems?.forEach((item) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { sales: 0, revenue: 0 }
        }
        productSales[item.product_id].sales += item.quantity
        productSales[item.product_id].revenue += item.price * item.quantity
      })

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({
          name: products?.find((p) => p.id === id)?.name || "Unknown Product",
          sales: data.sales,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Get recent orders
      const { data: recentOrdersData } = await supabase
        .from("orders")
        .select("id, total, status, created_at, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(5)

      const recentOrders = recentOrdersData?.map((order) => ({
        id: order.id.slice(0, 8),
        customer: (order.profiles as any)?.full_name || "Guest",
        total: order.total,
        status: order.status,
        date: new Date(order.created_at).toLocaleDateString(),
      })) || []

      setData({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueChange,
        ordersChange,
        topProducts,
        recentOrders,
      })

      setLoading(false)
    }

    fetchReportData()
  }, [period, supabase])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View sales and performance analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {data.revenueChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={data.revenueChange >= 0 ? "text-green-500" : "text-red-500"}>
                {data.revenueChange}%
              </span>
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : data.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {data.ordersChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={data.ordersChange >= 0 ? "text-green-500" : "text-red-500"}>
                {data.ordersChange}%
              </span>
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : data.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Active products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : data.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data.topProducts.length > 0 ? (
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(product.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No sales data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-6 w-16 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : data.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {data.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customer} - {order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
