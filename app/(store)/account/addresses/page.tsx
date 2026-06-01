"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Pencil, Trash2, Loader2 } from "lucide-react"

interface Address {
  id: string
  label: string
  first_name: string
  last_name: string
  company: string | null
  address_line1: string
  address_line2: string | null
  city: string
  province: string
  postal_code: string
  country: string
  phone: string | null
  is_default_shipping: boolean
  is_default_billing: boolean
}

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
]

export default function AddressesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    label: "Home",
    first_name: "",
    last_name: "",
    company: "",
    address_line1: "",
    address_line2: "",
    city: "",
    province: "",
    postal_code: "",
    phone: "",
  })

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setAddresses(data || [])
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const addressData = {
      user_id: user.id,
      label: formData.label,
      first_name: formData.first_name,
      last_name: formData.last_name,
      company: formData.company || null,
      address_line1: formData.address_line1,
      address_line2: formData.address_line2 || null,
      city: formData.city,
      province: formData.province,
      postal_code: formData.postal_code,
      phone: formData.phone || null,
    }

    if (editingAddress) {
      await supabase
        .from("addresses")
        .update(addressData)
        .eq("id", editingAddress.id)
    } else {
      await supabase.from("addresses").insert(addressData)
    }

    setIsSaving(false)
    setDialogOpen(false)
    resetForm()
    loadAddresses()
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      label: address.label,
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company || "",
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      phone: address.phone || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    await supabase.from("addresses").delete().eq("id", deleteId)
    setDeleteId(null)
    loadAddresses()
  }

  const setAsDefault = async (id: string, type: "shipping" | "billing") => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Clear existing default
    const field = type === "shipping" ? "is_default_shipping" : "is_default_billing"
    await supabase
      .from("addresses")
      .update({ [field]: false })
      .eq("user_id", user.id)

    // Set new default
    await supabase
      .from("addresses")
      .update({ [field]: true })
      .eq("id", id)

    loadAddresses()
  }

  const resetForm = () => {
    setEditingAddress(null)
    setFormData({
      label: "Home",
      first_name: "",
      last_name: "",
      company: "",
      address_line1: "",
      address_line2: "",
      city: "",
      province: "",
      postal_code: "",
      phone: "",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Addresses</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Address Label</Label>
                <Select
                  value={formData.label}
                  onValueChange={(v) => setFormData({ ...formData, label: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Farm">Farm</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company (Optional)</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Address Line 2 (Optional)</Label>
                <Input
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(v) => setFormData({ ...formData, province: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAddress ? "Save Changes" : "Add Address"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No addresses saved</h3>
            <p className="mt-2 text-muted-foreground">
              Add an address for faster checkout
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {address.label}
                    {address.is_default_shipping && (
                      <Badge variant="secondary">Default Shipping</Badge>
                    )}
                    {address.is_default_billing && (
                      <Badge variant="outline">Default Billing</Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(address)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(address.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {address.first_name} {address.last_name}
                  </p>
                  {address.company && <p>{address.company}</p>}
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.province}</p>
                  <p>{address.postal_code}</p>
                  {address.phone && <p className="mt-2">{address.phone}</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  {!address.is_default_shipping && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAsDefault(address.id, "shipping")}
                    >
                      Set as Shipping Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
