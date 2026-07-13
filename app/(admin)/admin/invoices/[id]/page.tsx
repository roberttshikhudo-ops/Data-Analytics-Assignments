"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Download, Mail, Printer } from "lucide-react"
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

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        // The API returns line items under `invoice_items`; normalize to `items`.
        setInvoice({ ...data, items: data.items ?? data.invoice_items ?? [] })
      } else {
        toast.error("Failed to load invoice")
        router.push("/admin/invoices")
      }
    } catch (error) {
      toast.error("Error loading invoice")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/invoices/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setInvoice((prev) => prev ? { ...prev, status: newStatus } : null)
        toast.success("Invoice status updated")
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      toast.error("Error updating status")
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return
    
    try {
      // Fetch the PDF HTML content
      const response = await fetch(`/api/admin/invoices/${invoice.id}/pdf`)
      if (!response.ok) {
        toast.error("Failed to load invoice")
        return
      }
      
      const html = await response.text()
      
      // Open a new window and write the HTML content
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error("Please allow popups to download PDF")
        return
      }
      
      printWindow.document.write(html)
      printWindow.document.close()
    } catch (error) {
      toast.error("Failed to generate PDF")
    }
  }

  const handleSendEmail = async () => {
    if (!invoice?.client_email) {
      toast.error("No client email address")
      return
    }
    
    setSending(true)
    try {
      const response = await fetch(`/api/admin/invoices/${params.id}/send`, {
        method: "POST",
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || "Invoice sent successfully")
        // Update local status if it was draft
        if (invoice.status === "draft") {
          setInvoice((prev) => prev ? { ...prev, status: "sent" } : null)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to send invoice")
      }
    } catch (error) {
      toast.error("Error sending invoice")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={invoice.status}
            onValueChange={updateStatus}
            disabled={updating}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleSendEmail} disabled={!invoice.client_email || sending}>
            <Mail className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send"}
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
              <p className="text-muted-foreground">
                The Parks Lifestyle Apartments<br />
                Block 38 Unit 2F<br />
                Midrand, Johannesburg, 1685<br />
                Gauteng, South Africa
              </p>
              <p className="mt-2 text-muted-foreground">
                Phone: 083 306 1529<br />
                Email: robert.tshikhudo@gmail.com
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Billing Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-muted-foreground mb-2">BILL TO</h4>
              <p className="font-semibold">{invoice.client_name}</p>
              {invoice.client_company && <p>{invoice.client_company}</p>}
              {invoice.client_address && <p>{invoice.client_address}</p>}
              {(invoice.client_city || invoice.client_province) && (
                <p>
                  {invoice.client_city}
                  {invoice.client_city && invoice.client_province && ", "}
                  {invoice.client_province} {invoice.client_postal_code}
                </p>
              )}
              {invoice.client_email && <p>{invoice.client_email}</p>}
              {invoice.client_phone && <p>{invoice.client_phone}</p>}
            </div>
            <div className="text-right">
              <div className="space-y-1">
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
              {invoice.items.map((item) => (
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-R{invoice.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {invoice.shipping_amount > 0 && (
                <div className="flex justify-between">
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
          {(invoice.notes || invoice.terms || invoice.payment_instructions) && (
            <div className="mt-8 pt-8 border-t space-y-4">
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold mb-1">Notes</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.payment_instructions && (
                <div>
                  <h4 className="font-semibold mb-1">Payment Instructions</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {invoice.payment_instructions}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="font-semibold mb-1">Terms & Conditions</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {invoice.terms}
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
