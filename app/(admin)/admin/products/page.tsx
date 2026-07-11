import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Image } from "lucide-react"
import { ProductsTable } from "@/components/admin/products-table"
import { CatalogueDownloadButton } from "@/components/admin/catalogue-download-button"
import { CatalogueDownloadButtonTwo } from "@/components/admin/catalogue-download-button-2"
import { CatalogueDownloadButtonThree } from "@/components/admin/catalogue-download-button-3"
import { CatalogueDownloadButtonThreeC } from "@/components/admin/catalogue-download-button-3c"
import { CatalogueDownloadButtonFour } from "@/components/admin/catalogue-download-button-4"
import { CatalogueDownloadButtonFive } from "@/components/admin/catalogue-download-button-5"
import { CatalogueDownloadButtonFleece } from "@/components/admin/catalogue-download-button-fleece"
import { CatalogueDownloadButtonThrows } from "@/components/admin/catalogue-download-button-throws"
import { CatalogueDownloadButtonBlankets } from "@/components/admin/catalogue-download-button-blankets"

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
          <CatalogueDownloadButton />
          <CatalogueDownloadButtonTwo />
          <CatalogueDownloadButtonThree />
          <CatalogueDownloadButtonThreeC />
          <CatalogueDownloadButtonFour />
          <CatalogueDownloadButtonFive />
          <CatalogueDownloadButtonFleece />
          <CatalogueDownloadButtonThrows />
          <CatalogueDownloadButtonBlankets />
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
