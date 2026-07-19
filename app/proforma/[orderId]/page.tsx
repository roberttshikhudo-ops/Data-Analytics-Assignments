import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { BUSINESS_INFO, formatCurrency, formatDate } from "@/lib/invoice"
import { ProformaPrintButton } from "@/components/proforma-print-button"

export const dynamic = "force-dynamic"

// Public, unguessable-by-UUID pro forma page. No login required so phone /
// manual clients can open the link we send them over WhatsApp. Rendered with
// the service-role client, and only ever selects non-sensitive fields — never
// cost or profit.
async function getOrder(orderId: string) {
  // A malformed id should 404 rather than throw a DB error.
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null

  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      created_at,
      subtotal,
      shipping_cost,
      discount_amount,
      coupon_code,
      total,
      shipping_first_name,
      shipping_last_name,
      shipping_company,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_province,
      shipping_postal_code,
      shipping_country,
      shipping_phone,
      guest_email,
      order_items(
        id,
        product_name,
        product_sku,
        product_image_url,
        quantity,
        unit_price,
        total_price,
        products(image_url)
      ),
      order_payments(amount),
      customers(name, email, phone)
    `,
    )
    .eq("id", orderId)
    .single()

  return order
}

export default async function ProformaPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const order = await getOrder(orderId)

  if (!order) {
    notFound()
  }

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers

  const clientName =
    customer?.name ||
    [order.shipping_first_name, order.shipping_last_name].filter(Boolean).join(" ") ||
    "Customer"

  const clientPhone = customer?.phone || order.shipping_phone
  const clientEmail = customer?.email || order.guest_email

  const total = Number(order.total)
  const amountPaid = (order.order_payments || []).reduce(
    (sum: number, p: any) => sum + Number(p.amount || 0),
    0,
  )
  const balanceDue = total - amountPaid
  // Only surface paid/balance when a partial payment has actually been made.
  const isPartiallyPaid = amountPaid > 0 && amountPaid < total

  const addressLines = [
    order.shipping_company,
    order.shipping_address_line1,
    order.shipping_address_line2,
    [order.shipping_city, order.shipping_province].filter(Boolean).join(", "),
    order.shipping_postal_code,
    order.shipping_country,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-muted/40 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        {/* Action bar (hidden when printing) */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <p className="text-sm text-muted-foreground text-pretty">
            This is your pro forma invoice. Use the button to print or save it as a PDF.
          </p>
          <ProformaPrintButton />
        </div>

        {/* Document */}
        <article className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm print:border-0 print:shadow-none print:p-0">
          {/* Header */}
          <header className="flex flex-col gap-6 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/agri-hub-logo.png"
                alt={`${BUSINESS_INFO.name} logo`}
                className="h-16 w-16 rounded object-contain"
              />
              <div>
                <h1 className="text-xl font-bold">{BUSINESS_INFO.name}</h1>
                <p className="max-w-xs text-xs text-muted-foreground text-pretty">
                  {BUSINESS_INFO.tagline}
                </p>
              </div>
            </div>
            <div className="text-sm sm:text-right">
              <p className="text-lg font-bold uppercase tracking-wide">Pro Forma Invoice</p>
              <p className="text-muted-foreground">Order {order.order_number}</p>
              <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
          </header>

          {/* Parties */}
          <section className="grid gap-6 py-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                From
              </h2>
              <p className="font-medium">{BUSINESS_INFO.name}</p>
              <p className="text-sm text-muted-foreground">{BUSINESS_INFO.fullAddress}</p>
              <p className="text-sm text-muted-foreground">{BUSINESS_INFO.phone}</p>
              <p className="text-sm text-muted-foreground">{BUSINESS_INFO.email}</p>
            </div>
            <div className="sm:text-right">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Bill To
              </h2>
              <p className="font-medium">{clientName}</p>
              {addressLines.map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {line}
                </p>
              ))}
              {clientPhone && <p className="text-sm text-muted-foreground">{clientPhone}</p>}
              {clientEmail && <p className="text-sm text-muted-foreground">{clientEmail}</p>}
            </div>
          </section>

          {/* Items */}
          <section>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y bg-muted/50 text-left print:bg-transparent">
                  <th className="py-2 pl-2 font-semibold">Item</th>
                  <th className="py-2 text-center font-semibold">Qty</th>
                  <th className="py-2 text-right font-semibold">Unit Price</th>
                  <th className="py-2 pr-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item: any) => {
                  const product = Array.isArray(item.products)
                    ? item.products[0]
                    : item.products
                  const imageSrc = item.product_image_url || product?.image_url
                  return (
                    <tr key={item.id} className="border-b align-middle">
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-3">
                          {imageSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageSrc || "/placeholder.svg"}
                              alt={item.product_name}
                              className="h-12 w-12 rounded border object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded border bg-muted" />
                          )}
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            {item.product_sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {item.product_sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">
                        {formatCurrency(Number(item.unit_price))}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        {formatCurrency(Number(item.total_price))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          {/* Totals */}
          <section className="flex justify-end py-6">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(Number(order.shipping_cost))}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Discount {order.coupon_code ? `(${order.coupon_code})` : ""}
                  </span>
                  <span>-{formatCurrency(Number(order.discount_amount))}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {isPartiallyPaid && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span>-{formatCurrency(amountPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <span>Balance Due</span>
                    <span>{formatCurrency(balanceDue)}</span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Payment details */}
          <section className="grid gap-6 border-t pt-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Banking Details
              </h2>
              <div className="text-sm leading-relaxed">
                <p>Bank: First National Bank (FNB)</p>
                <p>Account Name: Agri Hub SA</p>
                <p>Account Number: 63014180606</p>
                <p>Branch Code: 250655</p>
                <p>
                  Reference: <span className="font-medium">{order.order_number}</span>
                </p>
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                This is a pro forma invoice and is not a tax invoice. Goods remain the
                property of {BUSINESS_INFO.name} until paid in full. Please use the order
                number as your payment reference and send proof of payment via WhatsApp.
              </p>
            </div>
          </section>

          <footer className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
            {BUSINESS_INFO.name} · {BUSINESS_INFO.phone} · {BUSINESS_INFO.email}
          </footer>
        </article>
      </div>
    </div>
  )
}
