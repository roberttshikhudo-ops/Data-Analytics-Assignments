'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { formatCurrency } from '@/lib/invoice'
import { toast } from 'sonner'

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
}

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Client info
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientCity, setClientCity] = useState('')
  const [clientProvince, setClientProvince] = useState('')
  const [clientPostalCode, setClientPostalCode] = useState('')

  // Invoice details
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('draft')

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ])

  // Additional
  const [discountAmount, setDiscountAmount] = useState(0)
  const [shippingAmount, setShippingAmount] = useState(0)
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  const [paymentInstructions, setPaymentInstructions] = useState('')

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/admin/invoices/${params.id}`)
        if (!res.ok) {
          toast.error('Failed to load invoice')
          router.push('/admin/invoices')
          return
        }
        const data = await res.json()

        setInvoiceNumber(data.invoice_number ?? '')
        setClientName(data.client_name ?? '')
        setClientEmail(data.client_email ?? '')
        setClientPhone(data.client_phone ?? '')
        setClientCompany(data.client_company ?? '')
        setClientAddress(data.client_address ?? '')
        setClientCity(data.client_city ?? '')
        setClientProvince(data.client_province ?? '')
        setClientPostalCode(data.client_postal_code ?? '')
        setInvoiceDate(data.invoice_date ? data.invoice_date.split('T')[0] : '')
        setDueDate(data.due_date ? data.due_date.split('T')[0] : '')
        setStatus(data.status ?? 'draft')
        setDiscountAmount(Number(data.discount_amount) || 0)
        setShippingAmount(Number(data.shipping_amount) || 0)
        setNotes(data.notes ?? '')
        setTerms(data.terms ?? '')
        setPaymentInstructions(data.payment_instructions ?? '')

        const lineItems = data.items ?? data.invoice_items ?? []
        setItems(
          lineItems.length > 0
            ? lineItems.map((item: any) => ({
                description: item.description ?? '',
                quantity: Number(item.quantity) || 1,
                unit_price: Number(item.unit_price) || 0,
              }))
            : [{ description: '', quantity: 1, unit_price: 0 }],
        )
      } catch (error) {
        toast.error('Error loading invoice')
        router.push('/admin/invoices')
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [params.id, router])

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const total = subtotal - discountAmount + shippingAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientName.trim()) {
      toast.error('Please enter a client name')
      return
    }

    if (items.some((item) => !item.description.trim())) {
      toast.error('Please fill in all item descriptions')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/invoices/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail || null,
          client_phone: clientPhone || null,
          client_company: clientCompany || null,
          client_address: clientAddress || null,
          client_city: clientCity || null,
          client_province: clientProvince || null,
          client_postal_code: clientPostalCode || null,
          invoice_date: invoiceDate,
          due_date: dueDate || null,
          status,
          discount_amount: discountAmount,
          shipping_amount: shippingAmount,
          notes: notes || null,
          terms: terms || null,
          payment_instructions: paymentInstructions || null,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update invoice')
      }

      toast.success('Invoice updated successfully')
      router.push(`/admin/invoices/${params.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update invoice')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/invoices/${params.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Invoice</h1>
          <p className="text-muted-foreground">{invoiceNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientCompany">Company</Label>
              <Input
                id="clientCompany"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="079 123 4567"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clientAddress">Address</Label>
              <Input
                id="clientAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientCity">City</Label>
              <Input
                id="clientCity"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
                placeholder="Johannesburg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientProvince">Province</Label>
              <Select value={clientProvince} onValueChange={setClientProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                  <SelectItem value="Free State">Free State</SelectItem>
                  <SelectItem value="Gauteng">Gauteng</SelectItem>
                  <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                  <SelectItem value="Limpopo">Limpopo</SelectItem>
                  <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                  <SelectItem value="North West">North West</SelectItem>
                  <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                  <SelectItem value="Western Cape">Western Cape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPostalCode">Postal Code</Label>
              <Input
                id="clientPostalCode"
                value={clientPostalCode}
                onChange={(e) => setClientPostalCode(e.target.value)}
                placeholder="2000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5 space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Product or service description"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Unit Price (R)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Total</Label>
                  <Input
                    value={formatCurrency(item.quantity * item.unit_price)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="border-t pt-4 mt-6">
              <div className="flex flex-col items-end gap-2">
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <span>Subtotal:</span>
                  <span className="text-right font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm items-center">
                  <span>Discount (R):</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-32 text-right"
                  />
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm items-center">
                  <span>Shipping (R):</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingAmount}
                    onChange={(e) => setShippingAmount(parseFloat(e.target.value) || 0)}
                    className="w-32 text-right"
                  />
                </div>
                <div className="grid grid-cols-2 gap-8 text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-right">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for the client..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentInstructions">Payment Instructions</Label>
              <Textarea
                id="paymentInstructions"
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/admin/invoices/${params.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
