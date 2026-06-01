"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { toast } from "sonner"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Invoice {
  id: string
  invoice_number: string
  invoice_type: string
  status: string
  invoice_date: string
  due_date: string | null
  client_name: string
  client_email: string | null
  client_phone: string | null
  client_company: string | null
  client_address: string | null
  client_city: string | null
  client_province: string | null
  client_postal_code: string | null
  subtotal: number
  discount_amount: number
  shipping_amount: number
  total: number
  notes: string | null
  terms: string | null
  payment_instructions: string | null
  created_at: string
  items: InvoiceItem[]
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
}

export default function CustomerInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else {
        toast.error("Invoice not found")
        router.push("/account/invoices")
      }
    } catch (error) {
      toast.error("Error loading invoice")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/account/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
            <p className="text-muted-foreground">
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
              <p className="text-lg font-semibold mt-1">{invoice.invoice_number}</p>
              <Badge className={statusColors[invoice.status]}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold">Agri Hub SA</h3>
              <p className="text-muted-foreground text-sm">
                The Parks Lifestyle Apartments<br />
                Block 38 Unit 2F<br />
                Midrand, Johannesburg, 1685<br />
                Gauteng, South Africa
              </p>
              <p className="mt-2 text-muted-foreground text-sm">
                Phone: 079 109 9490<br />
                Email: info@agrihubsa.co.za
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Billing Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-muted-foreground text-sm mb-2">BILL TO</h4>
              <p className="font-semibold">{invoice.client_name}</p>
              {invoice.client_company && <p className="text-sm">{invoice.client_company}</p>}
              {invoice.client_address && <p className="text-sm">{invoice.client_address}</p>}
              {(invoice.client_city || invoice.client_province) && (
                <p className="text-sm">
                  {invoice.client_city}
                  {invoice.client_city && invoice.client_province && ", "}
                  {invoice.client_province} {invoice.client_postal_code}
                </p>
              )}
              {invoice.client_email && <p className="text-sm">{invoice.client_email}</p>}
              {invoice.client_phone && <p className="text-sm">{invoice.client_phone}</p>}
            </div>
            <div className="text-right">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Invoice Date:</span>{" "}
                  <span className="font-semibold">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </span>
                </p>
                {invoice.due_date && (
                  <p>
                    <span className="text-muted-foreground">Due Date:</span>{" "}
                    <span className="font-semibold">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    R{item.unit_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    R{item.total_price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-R{invoice.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {invoice.shipping_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>R{invoice.shipping_amount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>R{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.payment_instructions) && (
            <div className="mt-8 pt-8 border-t space-y-4">
              {invoice.payment_instructions && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Payment Instructions</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {invoice.payment_instructions}
                  </p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Notes</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
            <p>Thank you for your business!</p>
            <p className="mt-1">
              Agri Hub SA - Your Agricultural, Hardware and Lifestyle Innovation Partner
            </p>
            <p>www.agrihubsa.co.za</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
