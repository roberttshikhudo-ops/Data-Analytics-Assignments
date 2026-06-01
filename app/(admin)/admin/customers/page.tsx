import { createClient } from "@/lib/supabase/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"

interface Customer {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: string
  created_at: string
  email?: string
  order_count?: number
  total_spent?: number
}

async function getCustomers() {
  const supabase = await createClient()

  // Get profiles with aggregated order data
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (!profiles) return []

  // Get order stats for each customer
  const customerIds = profiles.map((p) => p.id)
  const { data: orderStats } = await supabase
    .from("orders")
    .select("user_id, total")
    .in("user_id", customerIds)
    .eq("payment_status", "paid")

  // Aggregate stats per customer
  const statsMap = new Map<string, { count: number; total: number }>()
  orderStats?.forEach((order) => {
    if (!order.user_id) return
    const existing = statsMap.get(order.user_id) || { count: 0, total: 0 }
    statsMap.set(order.user_id, {
      count: existing.count + 1,
      total: existing.total + (order.total || 0),
    })
  })

  return profiles.map((profile) => ({
    ...profile,
    order_count: statsMap.get(profile.id)?.count || 0,
    total_spent: statsMap.get(profile.id)?.total || 0,
  }))
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            View and manage customer accounts ({customers.length} total)
          </p>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.first_name && customer.last_name
                    ? `${customer.first_name} ${customer.last_name}`
                    : "No name"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.phone || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={customer.role === "admin" ? "default" : "secondary"}>
                    {customer.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{customer.order_count}</TableCell>
                <TableCell className="text-right">
                  {formatPrice(customer.total_spent || 0)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(customer.created_at), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
