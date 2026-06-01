import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/store/product-gallery'
import { ProductInfo } from '@/components/store/product-info'
import { ProductTabs } from '@/components/store/product-tabs'
import { RelatedProducts } from '@/components/store/related-products'
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/schema-markup'
import type { Product } from '@/lib/types'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description')
    .eq('slug', slug)
    .single()

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.name,
    description: product.short_description || `Buy ${product.name} at Agri Hub SA`,
  }
}

async function getProduct(slug: string) {
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return product as Product | null
}

async function getRelatedProducts(categoryId: string | null, productId: string) {
  if (!categoryId) return []
  
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(4)

  return (data || []) as Product[]
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id)

  // Build breadcrumb data for schema
  const breadcrumbItems = [
    { name: 'Home', url: 'https://agrihubsa.co.za/' },
    { name: 'Shop', url: 'https://agrihubsa.co.za/shop' },
  ]
  if (product.category) {
    breadcrumbItems.push({
      name: product.category.name,
      url: `https://agrihubsa.co.za/shop/${product.category.slug}`,
    })
  }
  breadcrumbItems.push({
    name: product.name,
    url: `https://agrihubsa.co.za/products/${slug}`,
  })

  const productUrl = `https://agrihubsa.co.za/products/${slug}`

  return (
    <>
      {/* SEO Schema Markup */}
      <ProductSchema product={product} url={productUrl} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/shop/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product content */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <ProductGallery product={product} />

        {/* Info */}
        <ProductInfo product={product} />
      </div>

      {/* Tabs (Description, Specifications, Reviews) */}
      <div className="mt-12">
        <ProductTabs product={product} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
    </>
  )
}
