import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductCard, ProductCardSkeleton } from '@/components/store/product-card'
import { ShopFilters } from '@/components/store/shop-filters'
import { ShopSort } from '@/components/store/shop-sort'
import type { Product, Category } from '@/lib/types'
import { Suspense } from 'react'
import { groupBeddingCategory } from '@/lib/bedding-category-sections'

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

  // The "Bedding and Kitchenware" category (slug home-living) mixes bedding,
  // kitchenware and general goods, so we present it grouped: bedding by series
  // first, then kitchenware, then everything else. All other categories keep
  // the standard flat grid.
  const grouped = slug === 'home-living' ? groupBeddingCategory(products as Product[]) : null

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
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-medium">No products found in this category</p>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : grouped ? (
              <GroupedProducts groups={grouped} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product as Product} priority={index < 6} />
                ))}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function GroupedProducts({
  groups,
}: {
  groups: ReturnType<typeof groupBeddingCategory>
}) {
  let rendered = 0

  const Section = ({ title, items }: { title: string; items: Product[] }) => {
    const startIndex = rendered
    rendered += items.length
    return (
      <section aria-labelledby={`section-${title}`} className="scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <h2 id={`section-${title}`} className="text-xl font-semibold">
            {title}
          </h2>
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={startIndex + i < 6}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-12">
      {/* Bedding, grouped by series */}
      {groups.bedding.length > 0 && (
        <div className="space-y-10">
          <h2 className="sr-only">Bedding</h2>
          {groups.bedding.map((s) => (
            <Section key={s.title} title={s.title} items={s.products} />
          ))}
        </div>
      )}

      {/* Kitchenware */}
      {groups.kitchenware.length > 0 && (
        <Section title="Kitchenware" items={groups.kitchenware} />
      )}

      {/* Everything else */}
      {groups.general.length > 0 && (
        <Section title="General" items={groups.general} />
      )}
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
