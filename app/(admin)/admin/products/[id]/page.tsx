import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"
import { notFound } from "next/navigation"

async function getProduct(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()
  if (!data) return data

  // Cost price is stored in the admin-only product_costs table.
  const { data: cost } = await supabase
    .from("product_costs")
    .select("cost_price")
    .eq("product_id", id)
    .maybeSingle()

  return { ...data, cost_price: cost?.cost_price ?? null }
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")
  return data || []
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
        <p className="text-muted-foreground">Update product details</p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  )
}
