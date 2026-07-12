"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Wallet,
  Percent,
  Calendar,
} from "lucide-react"

interface TopProduct {
  name: string
  sales: number
  revenue: number
  profit: number
}

interface RecentOrder {
  id: string
  customer: string
  total: number
  status: string
  date: string
}

interface ReportData {
  totalRevenue: number
  productRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  totalOrders: number
  totalProducts: number
  topProducts: TopProduct[]
  recentOrders: RecentOrder[]
}

const EXCLUDED_STATUSES = ["cancelled", "refunded"]

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const [data, setData] = useState<ReportData>({
    totalRevenue: 0,
    productRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    totalOrders: 0,
    totalProducts: 0,
    topProducts: [],
    recentOrders: [],
  })
  const supabase = createClient()

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true)

      const daysAgo = Number.parseInt(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)
      const startIso = startDate.toISOString()

      // Orders in period (exclude cancelled/refunded from financials)
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, status")
        .gte("created_at", startIso)

      const validOrders =
        orders?.filter((o: any) => !EXCLUDED_STATUSES.includes(o.status)) || []

      const totalRevenue = validOrders.reduce(
        (sum: number, o: any) => sum + (Number(o.total) || 0),
        0,
      )
      const totalOrders = validOrders.length

      // Products count
      const { data: products } = await supabase.from("products").select("id, name")
      const totalProducts = products?.length || 0

      // Order items in period with cost snapshot, joined to their order
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, product_name, quantity, unit_price, unit_cost, orders!inner(created_at, status)")
        .gte("orders.created_at", startIso)

      const itemsInScope =
        orderItems?.filter(
          (it: any) => !EXCLUDED_STATUSES.includes(it.orders?.status),
        ) || []

      let productRevenue = 0
      let totalCost = 0
      const productMap: Record<
        string,
        { name: string; sales: number; revenue: number; profit: number }
      > = {}

      for (const it of itemsInScope as any[]) {
        const qty = Number(it.quantity) || 0
        const price = Number(it.unit_price) || 0
        const cost = Number(it.unit_cost) || 0
        const lineRevenue = price * qty
        const lineProfit = (price - cost) * qty

        productRevenue += lineRevenue
        totalCost += cost * qty

        const key = it.product_id || it.product_name || "unknown"
        if (!productMap[key]) {
          productMap[key] = {
            name: it.product_name || products?.find((p: any) => p.id === it.product_id)?.name || "Unknown Product",
            sales: 0,
            revenue: 0,
            profit: 0,
          }
        }
        productMap[key].sales += qty
        productMap[key].revenue += lineRevenue
        productMap[key].profit += lineProfit
      }

      const totalProfit = productRevenue - totalCost
      const profitMargin = productRevenue > 0 ? (totalProfit / productRevenue) * 100 : 0

      const topProducts = Object.values(productMap)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5)

      // Recent orders
      const { data: recentOrdersData } = await supabase
        .from("orders")
        .select("id, total, status, created_at, shipping_first_name, shipping_last_name, customers(name)")
        .order("created_at", { ascending: false })
        .limit(5)

      const recentOrders: RecentOrder[] =
        recentOrdersData?.map((order: any) => ({
          id: order.id.slice(0, 8),
          customer:
            order.customers?.name ||
            `${order.shipping_first_name ?? ""} ${order.shipping_last_name ?? ""}`.trim() ||
            "Guest",
          total: Number(order.total) || 0,
          status: order.status,
          date: new Date(order.created_at).toLocaleDateString(),
        })) || []

      setData({
        totalRevenue,
        productRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        totalOrders,
        totalProducts,
        topProducts,
        recentOrders,
      })

      setLoading(false)
    }

    fetchReportData()
  }, [period, supabase])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Sales, profit, and performance analytics</p>
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

      {/* Profit-focused overview */}
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
            <p className="text-xs text-muted-foreground">Incl. shipping, excl. cancelled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : formatCurrency(data.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">Cost of products sold</p>
          </CardContent>
        </Card>

        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? "..." : formatCurrency(data.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Product revenue minus cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {loading ? "..." : `${data.profitMargin.toFixed(1)}%`}
              {!loading && data.profitMargin > 0 && (
                <TrendingUp className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">On product sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Product Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : formatCurrency(data.productRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Excl. shipping</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : data.totalProducts}</div>
            <p className="text-xs text-muted-foreground">In catalogue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products by Profit */}
        <Card>
          <CardHeader>
            <CardTitle>Most Profitable Products</CardTitle>
            <CardDescription>Top performers by profit in this period</CardDescription>
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
                  <div key={index} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.sales} sold &middot; {formatCurrency(product.revenue)} revenue
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-primary">{formatCurrency(product.profit)}</p>
                      <p className="text-xs text-muted-foreground">profit</p>
                    </div>
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
                      <p className="text-xs text-muted-foreground">
                        {order.customer} - {order.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "shipped"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
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
