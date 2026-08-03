import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Image, DollarSign } from "lucide-react"
import { ProductsTable } from "@/components/admin/products-table"
import { CatalogueDownloadButtonSix } from "@/components/admin/catalogue-download-button-6"
import { CatalogueDownloadButtonFleece } from "@/components/admin/catalogue-download-button-fleece"
import { CatalogueDownloadButtonThrows } from "@/components/admin/catalogue-download-button-throws"
import { CatalogueDownloadButtonBlankets } from "@/components/admin/catalogue-download-button-blankets"
import { CatalogueDownloadButtonSheetsCovers } from "@/components/admin/catalogue-download-button-sheets-covers"
import { CatalogueDownloadButtonKids } from "@/components/admin/catalogue-download-button-kids"
import { CatalogueDownloadButtonKitchenware } from "@/components/admin/catalogue-download-button-kitchenware"
import { PosterDownloadButton } from "@/components/admin/poster-download-button"

async function getProducts() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories(name)
    `)
    .order("created_at", { ascending: false })

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

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <CatalogueDownloadButtonSix />
          <CatalogueDownloadButtonFleece />
          <CatalogueDownloadButtonThrows />
          <CatalogueDownloadButtonBlankets />
          <CatalogueDownloadButtonSheetsCovers />
          <CatalogueDownloadButtonKids />
          <CatalogueDownloadButtonKitchenware />
          <PosterDownloadButton />
          <Link href="/admin/products/costs">
            <Button variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Set Cost Prices
            </Button>
          </Link>
          <Link href="/admin/products/images">
            <Button variant="outline">
              <Image className="mr-2 h-4 w-4" />
              Manage Images
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <ProductsTable products={products} categories={categories} />
    </div>
  )
}
