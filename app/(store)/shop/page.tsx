import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductCardSkeleton } from '@/components/store/product-card'
import { ShopFilters } from '@/components/store/shop-filters'
import { ShopSort } from '@/components/store/shop-sort'
import { ProgressiveProducts, type ProductSection } from '@/components/store/progressive-products'
import { groupBeddingCategory } from '@/lib/bedding-category-sections'
import { createClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of agricultural supplies including seeds, fertilizers, equipment, and more.',
}

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    brand?: string
    featured?: string
    new?: string
    search?: string
    page?: string
  }>
}

async function getProducts(searchParams: Awaited<ShopPageProps['searchParams']>) {
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)

  // Apply filters
  if (searchParams.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single()
    
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  if (searchParams.featured === 'true') {
    query = query.eq('is_featured', true)
  }

  // Filter by products with discounts
  if (searchParams.new === 'true') {
    query = query.not('compare_at_price', 'is', null)
  }

  if (searchParams.minPrice) {
    query = query.gte('price', parseFloat(searchParams.minPrice))
  }

  if (searchParams.maxPrice) {
    query = query.lte('price', parseFloat(searchParams.maxPrice))
  }

  // Brand filter removed - not in current schema

  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
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

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  
  return (data || []) as Category[]
}

// Brand filtering removed - not in current schema

// Bedding & Kitchenware always leads the "All Products" view.
const LEAD_CATEGORY_SLUG = 'home-living'

/**
 * Groups all products by their category for the unfiltered "Shop All" view.
 * Bedding and Kitchenware is placed first (and expanded into its bedding
 * series, then Kitchenware, then General), followed by every other category
 * in display order, and finally anything without an active category.
 */
function buildShopSections(
  products: Product[],
  categories: Category[],
): ProductSection[] {
  // Bucket products by category id.
  const byCategory = new Map<string, Product[]>()
  const uncategorised: Product[] = []
  for (const p of products) {
    if (p.category_id) {
      const bucket = byCategory.get(p.category_id)
      if (bucket) bucket.push(p)
      else byCategory.set(p.category_id, [p])
    } else {
      uncategorised.push(p)
    }
  }

  // Order categories: lead category first, then the rest in display order.
  const ordered = [...categories].sort((a, b) => {
    if (a.slug === LEAD_CATEGORY_SLUG) return -1
    if (b.slug === LEAD_CATEGORY_SLUG) return 1
    return (a.display_order ?? 0) - (b.display_order ?? 0)
  })

  const sections: ProductSection[] = []
  for (const cat of ordered) {
    const items = byCategory.get(cat.id)
    if (!items || items.length === 0) continue

    if (cat.slug === LEAD_CATEGORY_SLUG) {
      // Expand bedding into its series, then kitchenware, then general.
      const grouped = groupBeddingCategory(items)
      for (const s of grouped.bedding) {
        sections.push({ title: s.title, products: s.products })
      }
      if (grouped.kitchenware.length > 0) {
        sections.push({ title: 'Kitchenware', products: grouped.kitchenware })
      }
      if (grouped.general.length > 0) {
        sections.push({ title: 'General', products: grouped.general })
      }
    } else {
      sections.push({ title: cat.name, products: items })
    }
  }

  if (uncategorised.length > 0) {
    sections.push({ title: 'Other', products: uncategorised })
  }

  return sections
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const currentCategory = categories.find(c => c.slug === params.category)

  // When browsing all products (no specific category selected), present them
  // grouped by category with Bedding and Kitchenware first. When a single
  // category is selected, keep an ungrouped grid.
  const sections: ProductSection[] = params.category
    ? [{ title: null, products }]
    : buildShopSections(products, categories)

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {currentCategory ? currentCategory.name : 'All Products'}
        </h1>
        {currentCategory?.description && (
          <p className="text-muted-foreground mt-2">{currentCategory.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <ShopFilters 
            categories={categories} 
            currentCategory={params.category}
            minPrice={params.minPrice}
            maxPrice={params.maxPrice}
          />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort and view options */}
          <div className="flex items-center justify-between mb-6">
            <ShopSort currentSort={params.sort} />
          </div>

          {/* Products */}
          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <ProgressiveProducts sections={sections} />
            ) : (
              <div className="text-center py-16">
                <p className="text-lg font-medium">No products found</p>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or search terms
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
