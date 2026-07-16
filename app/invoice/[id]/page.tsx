import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { BUSINESS_INFO, formatCurrency, formatDate } from "@/lib/invoice"
import { ProformaPrintButton } from "@/components/proforma-print-button"

export const dynamic = "force-dynamic"

// Public, no-login tax invoice page so phone / manual clients can open the link
// we send them over WhatsApp. Rendered with the service-role client and only
// selects the invoice fields that are safe to share — never cost or profit.
async function getInvoice(id: string) {
  // A malformed id should 404 rather than throw a DB error.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null

  const supabase = createAdminClient()
  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      invoice_type,
      status,
      invoice_date,
      due_date,
      client_name,
      client_email,
      client_phone,
      client_company,
      client_address,
      client_city,
      client_province,
      client_postal_code,
      client_country,
      subtotal,
      discount_amount,
      shipping_amount,
      total,
      notes,
      terms,
      payment_instructions,
      invoice_items(
        id,
        description,
        quantity,
        unit_price,
        total_price
      )
    `,
    )
    .eq("id", id)
    .single()

  return invoice
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) {
    notFound()
  }

  const items = invoice.invoice_items || []

  const addressLines = [
    invoice.client_company,
    invoice.client_address,
    [invoice.client_city, invoice.client_province].filter(Boolean).join(", "),
    invoice.client_postal_code,
    invoice.client_country,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-muted/40 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        {/* Action bar (hidden when printing) */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <p className="text-sm text-muted-foreground text-pretty">
            This is your tax invoice. Use the button to print or save it as a PDF.
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
              <p className="text-lg font-bold uppercase tracking-wide">Tax Invoice</p>
              <p className="text-muted-foreground">{invoice.invoice_number}</p>
              <p className="text-muted-foreground">{formatDate(invoice.invoice_date)}</p>
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
              <p className="font-medium">{invoice.client_name}</p>
              {addressLines.map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {line}
                </p>
              ))}
              {invoice.client_phone && (
                <p className="text-sm text-muted-foreground">{invoice.client_phone}</p>
              )}
              {invoice.client_email && (
                <p className="text-sm text-muted-foreground">{invoice.client_email}</p>
              )}
            </div>
          </section>

          {/* Items */}
          <section>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y bg-muted/50 text-left print:bg-transparent">
                  <th className="py-2 pl-2 font-semibold">Description</th>
                  <th className="py-2 text-center font-semibold">Qty</th>
                  <th className="py-2 text-right font-semibold">Unit Price</th>
                  <th className="py-2 pr-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b align-middle">
                    <td className="py-3 pl-2 font-medium">{item.description}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">
                      {formatCurrency(Number(item.unit_price))}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {formatCurrency(Number(item.total_price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals */}
          <section className="flex justify-end py-6">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(invoice.subtotal))}</span>
              </div>
              {Number(invoice.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-{formatCurrency(Number(invoice.discount_amount))}</span>
                </div>
              )}
              {Number(invoice.shipping_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(Number(invoice.shipping_amount))}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(Number(invoice.total))}</span>
              </div>
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
                  Reference: <span className="font-medium">{invoice.invoice_number}</span>
                </p>
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {invoice.payment_instructions ||
                  invoice.notes ||
                  `Thank you for your business. Please use the invoice number as your payment reference and send proof of payment via WhatsApp.`}
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
