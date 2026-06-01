import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductCard, ProductCardSkeleton } from '@/components/store/product-card'
import { ShopFilters } from '@/components/store/shop-filters'
import { ShopSort } from '@/components/store/shop-sort'
import type { Product, Category } from '@/lib/types'
import { Suspense } from 'react'

interface CategoryPageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{
    sort?: string
    minPrice?: string
    maxPrice?: string
    page?: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: category.name,
    description: category.description || `Shop ${category.name} at Agri Hub SA`,
  }
}

async function getCategoryWithProducts(slug: string, searchParams: Awaited<CategoryPageProps['searchParams']>) {
  const supabase = await createClient()
  
  // Get category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) return null

  // Get products in category
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', category.id)
    .eq('is_active', true)

  // Apply filters
  if (searchParams.minPrice) {
    query = query.gte('price', parseFloat(searchParams.minPrice))
  }

  if (searchParams.maxPrice) {
    query = query.lte('price', parseFloat(searchParams.maxPrice))
  }

  // Apply sorting
  switch (searchParams.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'name-asc':
      query = query.order('name', { ascending: true })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data: products } = await query

  return { category, products: products || [] }
}

async function getAllCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  
  return (data || []) as Category[]
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params
  const resolvedSearchParams = await searchParams
  
  const [result, allCategories] = await Promise.all([
    getCategoryWithProducts(slug, resolvedSearchParams),
    getAllCategories(),
  ])

  if (!result) {
    notFound()
  }

  const { category, products } = result

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <ShopFilters 
            categories={allCategories} 
            currentCategory={slug}
            minPrice={resolvedSearchParams.minPrice}
            maxPrice={resolvedSearchParams.maxPrice}
          />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort */}
          <div className="flex items-center justify-between mb-6">
            <ShopSort currentSort={resolvedSearchParams.sort} />
          </div>

          {/* Products */}
          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as Product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg font-medium">No products found in this category</p>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
