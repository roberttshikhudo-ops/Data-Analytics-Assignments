"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatPrice } from "@/lib/utils"
import { MoreHorizontal, Eye, Search, Truck, Package, CheckCircle, XCircle } from "lucide-react"

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  status: string
  payment_status: string
  payment_method: string | null
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total: number
  shipping_first_name: string | null
  shipping_last_name: string | null
  shipping_city: string | null
  shipping_province: string | null
  tracking_number: string | null
  created_at: string
  order_items: OrderItem[]
}

interface OrdersTableProps {
  orders: Order[]
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  processing: "outline",
  paid: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
}

const paymentStatusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "destructive",
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  const filteredOrders = orders.filter((order) => {
    const searchTerm = search.toLowerCase()
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm) ||
      order.shipping_first_name?.toLowerCase().includes(searchTerm) ||
      order.shipping_last_name?.toLowerCase().includes(searchTerm) ||
      order.guest_email?.toLowerCase().includes(searchTerm)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPayment = paymentFilter === "all" || order.payment_status === paymentFilter
    return matchesSearch && matchesStatus && matchesPayment
  })

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
    router.refresh()
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    await supabase
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", orderId)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order #, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.shipping_first_name} {order.shipping_last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_city}, {order.shipping_province}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.order_items.length} items</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(Number(order.total))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentStatusColors[order.payment_status]}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-ZA")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "processing")}>
                          <Package className="mr-2 h-4 w-4" />
                          Mark Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "shipped")}>
                          <Truck className="mr-2 h-4 w-4" />
                          Mark Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Delivered
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
