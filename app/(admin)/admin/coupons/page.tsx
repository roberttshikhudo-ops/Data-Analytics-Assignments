"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"

interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: "percentage" | "fixed"
  discount_value: number
  minimum_order_amount: number | null
  maximum_discount: number | null
  usage_limit: number | null
  usage_count: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    minimum_order_amount: "",
    maximum_discount: "",
    usage_limit: "",
    expires_at: "",
    is_active: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  async function fetchCoupons() {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to load coupons")
      return
    }

    setCoupons(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        minimum_order_amount: formData.minimum_order_amount
          ? parseFloat(formData.minimum_order_amount)
          : null,
        maximum_discount: formData.maximum_discount
          ? parseFloat(formData.maximum_discount)
          : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expires_at: formData.expires_at || null,
        is_active: formData.is_active,
      }

      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(payload)
          .eq("id", editingCoupon.id)

        if (error) throw error
        toast.success("Coupon updated successfully")
      } else {
        const { error } = await supabase.from("coupons").insert(payload)
        if (error) throw error
        toast.success("Coupon created successfully")
      }

      setIsDialogOpen(false)
      setEditingCoupon(null)
      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error("Failed to save coupon")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    const { error } = await supabase.from("coupons").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete coupon")
      return
    }

    toast.success("Coupon deleted successfully")
    fetchCoupons()
  }

  function resetForm() {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 10,
      minimum_order_amount: "",
      maximum_discount: "",
      usage_limit: "",
      expires_at: "",
      is_active: true,
    })
  }

  function openEditDialog(coupon: Coupon) {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_order_amount: coupon.minimum_order_amount?.toString() || "",
      maximum_discount: coupon.maximum_discount?.toString() || "",
      usage_limit: coupon.usage_limit?.toString() || "",
      expires_at: coupon.expires_at?.split("T")[0] || "",
      is_active: coupon.is_active,
    })
    setIsDialogOpen(true)
  }

  function openCreateDialog() {
    setEditingCoupon(null)
    resetForm()
    setIsDialogOpen(true)
  }

  function getCouponStatus(coupon: Coupon) {
    if (!coupon.is_active) return { label: "Inactive", variant: "secondary" as const }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { label: "Expired", variant: "destructive" as const }
    }
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { label: "Exhausted", variant: "outline" as const }
    }
    return { label: "Active", variant: "default" as const }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Create Coupon"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., SAVE10"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g., 10% off all orders"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (R)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">Value</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimum_order_amount">Minimum Order (R)</Label>
                  <Input
                    id="minimum_order_amount"
                    type="number"
                    value={formData.minimum_order_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, minimum_order_amount: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="maximum_discount">Max Discount (R)</Label>
                  <Input
                    id="maximum_discount"
                    type="number"
                    value={formData.maximum_discount}
                    onChange={(e) =>
                      setFormData({ ...formData, maximum_discount: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, usage_limit: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="expires_at">Expiry Date</Label>
                  <Input
                    id="expires_at"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData({ ...formData, expires_at: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCoupon ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon)
              return (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : formatPrice(coupon.discount_value)}
                  </TableCell>
                  <TableCell>
                    {coupon.usage_count}
                    {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.expires_at
                      ? format(new Date(coupon.expires_at), "MMM d, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(coupon)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No coupons found. Create your first coupon.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
