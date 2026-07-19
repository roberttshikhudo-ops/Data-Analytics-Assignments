"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatPrice } from "@/lib/utils"
import { createManualOrder } from "@/app/(admin)/admin/orders/actions"
import { Plus, Trash2, Search, UserPlus, Check, ChevronsUpDown, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
}

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  province: string | null
  postal_code: string | null
}

interface LineItem {
  key: string
  product_id: string | null
  product_name: string
  product_image_url: string | null
  quantity: number
  unit_price: number
}

const PROVINCES = [
  "Gauteng",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Western Cape",
  "Northern Cape",
]

export function ManualOrderForm({
  products,
  customers,
}: {
  products: Product[]
  customers: Customer[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Customer selection
  const [customerMode, setCustomerMode] = useState<"existing" | "new">(
    customers.length > 0 ? "existing" : "new",
  )
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    province: "",
    postal_code: "",
    notes: "",
  })

  // Line items
  const [items, setItems] = useState<LineItem[]>([])
  const [productPickerOpen, setProductPickerOpen] = useState(false)

  // Order-level fields
  const [shippingMethod, setShippingMethod] = useState("delivery")
  const [shippingCost, setShippingCost] = useState("0")
  const [discountAmount, setDiscountAmount] = useState("0")
  const [deliveryArea, setDeliveryArea] = useState("")
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [orderNotes, setOrderNotes] = useState("")

  // Initial payment
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState("cash")
  const [payReference, setPayReference] = useState("")
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0),
    [items],
  )
  const total =
    subtotal + (Number(shippingCost) || 0) - (Number(discountAmount) || 0)
  const balance = total - (Number(payAmount) || 0)

  function addProduct(product: Product) {
    setItems((prev) => {
      const existing = prev.find((it) => it.product_id === product.id)
      if (existing) {
        return prev.map((it) =>
          it.product_id === product.id ? { ...it, quantity: it.quantity + 1 } : it,
        )
      }
      return [
        ...prev,
        {
          key: `${product.id}-${Date.now()}`,
          product_id: product.id,
          product_name: product.name,
          product_image_url: product.image_url,
          quantity: 1,
          unit_price: Number(product.price),
        },
      ]
    })
    setProductPickerOpen(false)
  }

  function updateItem(key: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)))
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key))
  }

  async function handleSubmit() {
    // Validation
    if (customerMode === "existing" && !selectedCustomerId) {
      toast.error("Please select a customer")
      return
    }
    if (customerMode === "new" && !newCustomer.name.trim()) {
      toast.error("Please enter the customer's name")
      return
    }
    if (items.length === 0) {
      toast.error("Add at least one product")
      return
    }

    setSaving(true)
    try {
      const result = await createManualOrder({
        customerId: customerMode === "existing" ? selectedCustomerId : null,
        newCustomer: customerMode === "new" ? newCustomer : null,
        items: items.map((it) => ({
          product_id: it.product_id,
          product_name: it.product_name,
          product_sku: null,
          product_image_url: it.product_image_url,
          quantity: it.quantity,
          unit_price: it.unit_price,
        })),
        shippingCost: Number(shippingCost) || 0,
        discountAmount: Number(discountAmount) || 0,
        deliveryArea,
        expectedDeliveryDate: expectedDeliveryDate || null,
        deliveryNotes,
        shippingMethod,
        orderNotes,
        initialPayment:
          Number(payAmount) > 0
            ? {
                amount: Number(payAmount),
                method: payMethod,
                reference: payReference,
                paid_at: payDate,
              }
            : null,
      })
      toast.success(`Order ${result.orderNumber} created`)
      router.push(`/admin/orders/${result.orderId}`)
      router.refresh()
    } catch (err: any) {
      console.log("[v0] createManualOrder error:", err?.message)
      toast.error(err?.message || "Failed to create order")
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: customer + items */}
      <div className="space-y-6 lg:col-span-2">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={customerMode === "existing" ? "default" : "outline"}
                size="sm"
                onClick={() => setCustomerMode("existing")}
                disabled={customers.length === 0}
              >
                <Search className="mr-2 h-4 w-4" />
                Existing customer
              </Button>
              <Button
                type="button"
                variant={customerMode === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setCustomerMode("new")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                New customer
              </Button>
            </div>

            {customerMode === "existing" ? (
              <div className="space-y-3">
                <Popover open={customerPickerOpen} onOpenChange={setCustomerPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-transparent font-normal"
                    >
                      {selectedCustomer ? selectedCustomer.name : "Select a customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search customers..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={`${c.name} ${c.phone ?? ""}`}
                              onSelect={() => {
                                setSelectedCustomerId(c.id)
                                setCustomerPickerOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomerId === c.id ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <span className="flex flex-col">
                                <span>{c.name}</span>
                                {c.phone && (
                                  <span className="text-xs text-muted-foreground">{c.phone}</span>
                                )}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedCustomer && (
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    {selectedCustomer.phone && <p>{selectedCustomer.phone}</p>}
                    {selectedCustomer.address_line1 && (
                      <p className="text-muted-foreground">
                        {[
                          selectedCustomer.address_line1,
                          selectedCustomer.city,
                          selectedCustomer.province,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="c-name">Full name *</Label>
                  <Input
                    id="c-name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="e.g. Thandi Mokoena"
                  />
                </div>
                <div>
                  <Label htmlFor="c-phone">Phone / WhatsApp</Label>
                  <Input
                    id="c-phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="083 000 0000"
                  />
                </div>
                <div>
                  <Label htmlFor="c-email">Email</Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c-addr1">Address</Label>
                  <Input
                    id="c-addr1"
                    value={newCustomer.address_line1}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, address_line1: e.target.value })
                    }
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="c-city">City / Town</Label>
                  <Input
                    id="c-city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="c-province">Province</Label>
                  <Select
                    value={newCustomer.province}
                    onValueChange={(v) => setNewCustomer({ ...newCustomer, province: v })}
                  >
                    <SelectTrigger id="c-province">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Products</CardTitle>
            <Popover open={productPickerOpen} onOpenChange={setProductPickerOpen}>
              <PopoverTrigger asChild>
                <Button type="button" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add product
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandList>
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {products.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.name}
                          onSelect={() => addProduct(p)}
                          className="gap-2"
                        >
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image_url || "/placeholder.svg"}
                              alt={p.name}
                              className="h-8 w-8 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <span className="flex-1 truncate">{p.name}</span>
                          <span className="text-muted-foreground">
                            {formatPrice(Number(p.price))}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No products added yet. Click &quot;Add product&quot; to begin.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.key}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {it.product_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.product_image_url || "/placeholder.svg"}
                        alt={it.product_name}
                        className="h-12 w-12 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(it.unit_price * it.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <Label className="sr-only">Qty</Label>
                        <Input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            updateItem(it.key, {
                              quantity: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                        />
                      </div>
                      <div className="w-24">
                        <Label className="sr-only">Price</Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={it.unit_price}
                          onChange={(e) =>
                            updateItem(it.key, { unit_price: Number(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(it.key)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Fulfilment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="ship-method">Method</Label>
              <Select value={shippingMethod} onValueChange={setShippingMethod}>
                <SelectTrigger id="ship-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Deliver to customer</SelectItem>
                  <SelectItem value="pickup">Collection / pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="delivery-area">Delivery area</Label>
              <Input
                id="delivery-area"
                value={deliveryArea}
                onChange={(e) => setDeliveryArea(e.target.value)}
                placeholder="e.g. Midrand, Soweto"
              />
            </div>
            <div>
              <Label htmlFor="expected-date">Expected delivery date</Label>
              <Input
                id="expected-date"
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="delivery-notes">Delivery notes</Label>
              <Input
                id="delivery-notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Gate code, landmark, etc."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: summary + payment */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="h-8 w-24 text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Discount</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="h-8 w-24 text-right"
              />
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Initial payment (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Leave the amount empty for a full-credit order. You can add more payments later.
            </p>
            <div>
              <Label htmlFor="pay-amount">Amount received</Label>
              <Input
                id="pay-amount"
                type="number"
                min={0}
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pay-method">Method</Label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger id="pay-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="eft">EFT / Bank</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pay-date">Date</Label>
                <Input
                  id="pay-date"
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pay-ref">Reference (optional)</Label>
              <Input
                id="pay-ref"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
              />
            </div>
            {Number(payAmount) > 0 && (
              <div className="flex justify-between rounded-lg bg-muted/50 p-2 text-sm font-medium">
                <span>Balance after payment</span>
                <span className={balance > 0 ? "text-destructive" : "text-primary"}>
                  {formatPrice(balance)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <div>
              <Label htmlFor="order-notes">Order notes</Label>
              <Textarea
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Anything to remember about this order"
                rows={3}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={saving}>
              {saving ? "Creating..." : "Create order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
