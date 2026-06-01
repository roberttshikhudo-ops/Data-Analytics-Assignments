import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Heart, MapPin } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

async function getAccountData() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirect=/account")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: wishlistCount } = await supabase
    .from("wishlists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: addressCount } = await supabase
    .from("addresses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return {
    user,
    profile,
    recentOrders: recentOrders || [],
    orderCount: orderCount || 0,
    wishlistCount: wishlistCount || 0,
    addressCount: addressCount || 0,
  }
}

export default async function AccountPage() {
  const data = await getAccountData()

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {data.profile?.first_name?.[0] || data.user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              Welcome, {data.profile?.first_name || "Customer"}!
            </h2>
            <p className="text-muted-foreground">{data.user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/account/orders">
          <Card className="transition-colors hover:border-primary">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.orderCount}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/account/wishlist">
          <Card className="transition-colors hover:border-primary">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.wishlistCount}</p>
                <p className="text-sm text-muted-foreground">Wishlist Items</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/account/addresses">
          <Card className="transition-colors hover:border-primary">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.addressCount}</p>
                <p className="text-sm text-muted-foreground">Saved Addresses</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/account/orders">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No orders yet</p>
              <Link href="/shop">
                <Button className="mt-4">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
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
                    <p className="text-sm capitalize text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
