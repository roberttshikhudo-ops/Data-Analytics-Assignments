import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Package, Truck, MapPin, CreditCard, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OrderStatusUpdater } from "@/components/admin/order-status-updater"
import { CreateShipmentButton } from "@/components/admin/create-shipment-button"
import { OrderPaymentsPanel } from "@/components/admin/order-payments-panel"
import { OrderDeliveryPanel } from "@/components/admin/order-delivery-panel"
import { OrderWhatsAppButton } from "@/components/admin/order-whatsapp-button"

async function getOrder(id: string) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        id,
        product_name,
        product_sku,
        product_image_url,
        quantity,
        unit_price,
        total_price,
        order_item_costs(unit_cost)
      ),
      order_payments(
        id,
        amount,
        method,
        reference,
        paid_at,
        notes
      ),
      customers(
        id,
        name,
        phone,
        email,
        address_line1,
        address_line2,
        city,
        province,
        postal_code
      )
    `)
    .eq("id", id)
    .single()

  return order
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

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
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Order {order.order_number}
          </h1>
          <p className="text-muted-foreground">
            {new Date(order.created_at).toLocaleString("en-ZA")}
          </p>
        </div>
        <div className="flex-1" />
        <Badge variant="outline" className="text-sm capitalize">
          {order.source === "manual" ? "Manual order" : "Website"}
        </Badge>
        <Badge variant={statusColors[order.status]} className="text-sm">
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {item.product_sku && (
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.product_sku}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} x {formatPrice(Number(item.unit_price))}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(Number(item.total_price))}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(Number(order.shipping_cost))}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                    <span>-{formatPrice(Number(order.discount_amount))}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>

                {(() => {
                  const costOfGoods = (order.order_items || []).reduce(
                    (sum: number, it: any) => {
                      const oic = Array.isArray(it.order_item_costs)
                        ? it.order_item_costs[0]
                        : it.order_item_costs
                      return sum + Number(oic?.unit_cost || 0) * Number(it.quantity || 0)
                    },
                    0,
                  )
                  const profit = Number(order.subtotal) - costOfGoods
                  const margin =
                    Number(order.subtotal) > 0
                      ? (profit / Number(order.subtotal)) * 100
                      : 0
                  return (
                    <div className="mt-2 space-y-2 rounded-md bg-muted/50 p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost of goods</span>
                        <span>{formatPrice(costOfGoods)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-primary">
                        <span>Profit {margin > 0 && `(${margin.toFixed(0)}%)`}</span>
                        <span>{formatPrice(profit)}</span>
                      </div>
                      {costOfGoods === 0 && (
                        <p className="text-xs text-muted-foreground text-pretty">
                          Set cost prices on your products to see accurate profit.
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.payment_status}
          />

          {/* Payments (credit / partial tracking) */}
          <OrderPaymentsPanel
            orderId={order.id}
            total={Number(order.total)}
            payments={[...(order.order_payments || [])].sort(
              (a: any, b: any) =>
                new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime(),
            )}
          />

          {/* Delivery planning */}
          <OrderDeliveryPanel
            orderId={order.id}
            deliveryStatus={order.delivery_status}
            deliveryArea={order.delivery_area}
            expectedDeliveryDate={order.expected_delivery_date}
            deliveryNotes={order.delivery_notes}
          />

          {/* Notify customer via WhatsApp */}
          <OrderWhatsAppButton
            orderNumber={order.order_number}
            phone={order.customers?.phone || order.shipping_phone || null}
            customerName={
              order.customers?.name ||
              [order.shipping_first_name, order.shipping_last_name]
                .filter(Boolean)
                .join(" ") ||
              null
            }
            status={order.status}
            deliveryStatus={order.delivery_status}
            total={Number(order.total)}
            balance={
              Number(order.total) -
              (order.order_payments || []).reduce(
                (sum: number, p: any) => sum + Number(p.amount || 0),
                0,
              )
            }
          />

          {/* Create shipment (only for paid delivery orders without tracking yet) */}
          {!order.tracking_number &&
            order.shipping_method !== "pickup" &&
            order.payment_status === "paid" && (
              <CreateShipmentButton orderId={order.id} />
            )}

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customers ? (
                <div className="text-sm">
                  <p className="font-medium">{order.customers.name}</p>
                  {order.customers.phone && <p>{order.customers.phone}</p>}
                  {order.customers.email && (
                    <p className="text-muted-foreground">{order.customers.email}</p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    Saved customer
                  </Badge>
                </div>
              ) : order.user_id ? (
                <p className="text-muted-foreground">Registered User</p>
              ) : (
                <div>
                  <p className="font-medium">Guest Order</p>
                  <p className="text-muted-foreground">{order.guest_email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">
                  {order.shipping_first_name} {order.shipping_last_name}
                </p>
                {order.shipping_company && <p>{order.shipping_company}</p>}
                <p>{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                <p>
                  {order.shipping_city}, {order.shipping_province}
                </p>
                <p>{order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
                {order.shipping_phone && <p className="mt-2">{order.shipping_phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="capitalize">{order.payment_method || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                    {order.payment_status}
                  </Badge>
                </div>
                {order.payment_reference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{order.payment_reference}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          {order.tracking_number && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm">{order.tracking_number}</p>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Track Shipment
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
