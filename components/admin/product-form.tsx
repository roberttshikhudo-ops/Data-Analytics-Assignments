"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { slugify } from "@/lib/utils"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ImageUpload } from "./image-upload"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
}

type ProductAvailability = 'both' | 'online_only' | 'in_store_only'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  stock_quantity: number
  low_stock_threshold: number
  weight: number | null
  weight_unit: string
  category_id: string | null
  brand: string | null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  meta_title: string | null
  meta_description: string | null
  image_url: string | null
  availability?: ProductAvailability
}

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!product

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    short_description: product?.short_description || "",
    price: product?.price?.toString() || "",
    compare_at_price: product?.compare_at_price?.toString() || "",
    cost_price: product?.cost_price?.toString() || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    stock_quantity: product?.stock_quantity?.toString() || "0",
    low_stock_threshold: product?.low_stock_threshold?.toString() || "5",
    weight: product?.weight?.toString() || "",
    weight_unit: product?.weight_unit || "kg",
    category_id: product?.category_id || "",
    brand: product?.brand || "",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_new: product?.is_new ?? false,
    meta_title: product?.meta_title || "",
    meta_description: product?.meta_description || "",
    image_url: product?.image_url || "",
    availability: product?.availability || "both" as ProductAvailability,
  })

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: !isEditing ? slugify(value) : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const productData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      short_description: formData.short_description || null,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      sku: formData.sku || null,
      barcode: formData.barcode || null,
      stock_quantity: parseInt(formData.stock_quantity),
      low_stock_threshold: parseInt(formData.low_stock_threshold),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      weight_unit: formData.weight_unit,
      category_id: formData.category_id || null,
      brand: formData.brand || null,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      is_new: formData.is_new,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      image_url: formData.image_url || null,
    }

    let error
    let data
    if (isEditing) {
      const result = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id)
        .select()
      error = result.error
      data = result.data
    } else {
      const result = await supabase.from("products").insert(productData).select()
      error = result.error
      data = result.data
    }

    if (error) {
      console.error("[v0] Error saving product:", error)
      toast.error(`Failed to save product: ${error.message}`)
      setIsLoading(false)
      return
    }

    console.log("[v0] Product saved successfully:", data)
    toast.success(isEditing ? "Product updated successfully" : "Product created successfully")
    router.push("/admin/products")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1" />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Product"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief product summary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ZAR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare_at_price">Compare at Price</Label>
                  <Input
                    id="compare_at_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    placeholder="Original price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="Your cost"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Stock Keeping Unit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_unit">Weight Unit</Label>
                  <Select
                    value={formData.weight_unit}
                    onValueChange={(v) => setFormData({ ...formData, weight_unit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="SEO title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  placeholder="SEO description"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">Featured</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_new">New Arrival</Label>
                <Switch
                  id="is_new"
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Where is this product available?</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(v) => setFormData({ ...formData, availability: v as ProductAvailability })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both Online & In-Store</SelectItem>
                    <SelectItem value="online_only">Online Only</SelectItem>
                    <SelectItem value="in_store_only">In-Store Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.availability === "online_only" && "This product can only be purchased online."}
                  {formData.availability === "in_store_only" && "This product is only available at physical stores."}
                  {formData.availability === "both" && "This product is available everywhere."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
