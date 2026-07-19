"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import { addPayment, deletePayment } from "@/app/(admin)/admin/orders/actions"
import { Wallet, Plus, Trash2 } from "lucide-react"

interface Payment {
  id: string
  amount: number
  method: string
  reference: string | null
  paid_at: string
  notes: string | null
}

export function OrderPaymentsPanel({
  orderId,
  total,
  payments,
}: {
  orderId: string
  total: number
  payments: Payment[]
}) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("cash")
  const [reference, setReference] = useState("")
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10))

  const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const balance = total - paid
  const status = paid <= 0 ? "unpaid" : paid >= total ? "paid" : "partial"
  const statusVariant =
    status === "paid" ? "default" : status === "partial" ? "secondary" : "destructive"

  async function handleAdd() {
    if (!(Number(amount) > 0)) {
      toast.error("Enter a payment amount greater than 0")
      return
    }
    setSaving(true)
    try {
      await addPayment({
        orderId,
        amount: Number(amount),
        method,
        reference,
        paid_at: paidAt,
        notes: "",
      })
      toast.success("Payment recorded")
      setAmount("")
      setReference("")
      setAdding(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to record payment")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(paymentId: string) {
    try {
      await deletePayment(paymentId, orderId)
      toast.success("Payment removed")
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove payment")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Payments
          <Badge variant={statusVariant} className="ml-auto capitalize">
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid so far</span>
            <span>{formatPrice(paid)}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Balance due</span>
            <span className={balance > 0 ? "text-destructive" : "text-primary"}>
              {formatPrice(balance)}
            </span>
          </div>
        </div>

        {/* History */}
        {payments.length > 0 && (
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{formatPrice(Number(p.amount))}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.paid_at).toLocaleDateString("en-ZA")} &middot;{" "}
                    <span className="capitalize">{p.method}</span>
                    {p.reference ? ` · ${p.reference}` : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add payment */}
        {adding ? (
          <div className="space-y-3 rounded-lg border p-3">
            <div>
              <Label htmlFor="add-amount">Amount</Label>
              <Input
                id="add-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="add-method">Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id="add-method">
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
                <Label htmlFor="add-date">Date</Label>
                <Input
                  id="add-date"
                  type="date"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="add-ref">Reference (optional)</Label>
              <Input
                id="add-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={saving}>
                {saving ? "Saving..." : "Save payment"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record a payment
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
