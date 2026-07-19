"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import { upsertCustomer } from "@/app/(admin)/admin/orders/actions"
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface OrderSummary {
  id: string
  order_number: string
  total: number
  status: string
  payment_status: string
  delivery_status: string
  created_at: string
  order_payments: { amount: number }[]
}

interface CustomerRecord {
  id: string
  name: string
  phone: string | null
  email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  notes: string | null
  orders: OrderSummary[]
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

const emptyForm = {
  id: undefined as string | undefined,
  name: "",
  phone: "",
  email: "",
  address_line1: "",
  address_line2: "",
  city: "",
  province: "",
  postal_code: "",
  notes: "",
}

export function CustomerRecords({ customers }: { customers: CustomerRecord[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return customers.filter(
      (c) =>
        !term ||
        c.name.toLowerCase().includes(term) ||
        (c.phone ?? "").toLowerCase().includes(term) ||
        (c.email ?? "").toLowerCase().includes(term) ||
        (c.city ?? "").toLowerCase().includes(term),
    )
  }, [customers, search])

  function openNew() {
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(c: CustomerRecord) {
    setForm({
      id: c.id,
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      address_line1: c.address_line1 || "",
      address_line2: c.address_line2 || "",
      city: c.city || "",
      province: c.province || "",
      postal_code: c.postal_code || "",
      notes: c.notes || "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    setSaving(true)
    try {
      await upsertCustomer(form)
      toast.success(form.id ? "Customer updated" : "Customer added")
      setDialogOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to save customer")
    } finally {
      setSaving(false)
    }
  }

  function balanceFor(c: CustomerRecord) {
    return c.orders.reduce((sum, o) => {
      const paid = o.order_payments.reduce((s, p) => s + Number(p.amount), 0)
      return sum + (Number(o.total) - paid)
    }, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit customer" : "Add customer"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="f-name">Full name *</Label>
                <Input
                  id="f-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="f-phone">Phone / WhatsApp</Label>
                <Input
                  id="f-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="f-email">Email</Label>
                <Input
                  id="f-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="f-addr1">Address</Label>
                <Input
                  id="f-addr1"
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="f-city">City / Town</Label>
                <Input
                  id="f-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="f-province">Province</Label>
                <Select
                  value={form.province}
                  onValueChange={(v) => setForm({ ...form, province: v })}
                >
                  <SelectTrigger id="f-province">
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
              <div className="sm:col-span-2">
                <Label htmlFor="f-notes">Notes</Label>
                <Textarea
                  id="f-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No customer records yet. Add one, or create a manual order with a new customer.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const balance = balanceFor(c)
            const isOpen = expanded === c.id
            return (
              <Card key={c.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{c.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {c.orders.length} order(s)
                        </Badge>
                        {balance > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {formatPrice(balance)} owing
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {c.email}
                          </span>
                        )}
                        {(c.address_line1 || c.city) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[c.address_line1, c.city, c.province].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                      {c.notes && (
                        <p className="mt-1 text-xs italic text-muted-foreground">{c.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      {c.orders.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpanded(isOpen ? null : c.id)}
                        >
                          History
                          {isOpen ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {isOpen && c.orders.length > 0 && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      {[...c.orders]
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                        )
                        .map((o) => {
                          const paid = o.order_payments.reduce(
                            (s, p) => s + Number(p.amount),
                            0,
                          )
                          const bal = Number(o.total) - paid
                          return (
                            <Link
                              key={o.id}
                              href={`/admin/orders/${o.id}`}
                              className="flex items-center justify-between rounded-lg border p-2 text-sm transition-colors hover:bg-muted"
                            >
                              <div>
                                <p className="font-medium">{o.order_number}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(o.created_at).toLocaleDateString("en-ZA")} &middot;{" "}
                                  <span className="capitalize">{o.status}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatPrice(Number(o.total))}</p>
                                {bal > 0 ? (
                                  <p className="text-xs text-destructive">
                                    {formatPrice(bal)} due
                                  </p>
                                ) : (
                                  <p className="text-xs text-primary">Paid</p>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
