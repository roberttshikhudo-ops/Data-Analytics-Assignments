import { createClient } from "@/lib/supabase/server"
import { ProductCostEditor } from "@/components/admin/product-cost-editor"

async function getProducts() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku, price, cost_price, category_id, categories(name)")
    .order("name")

  return products || []
}

async function getCategories() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  return categories || []
}

export default async function ProductCostsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Product Cost Prices</h1>
        <p className="text-muted-foreground text-pretty">
          Enter what you pay for each product so profit can be calculated on every sale. Filter by
          category, type each cost, then save.
        </p>
      </div>

      <ProductCostEditor products={products as any} categories={categories} />
    </div>
  )
}
