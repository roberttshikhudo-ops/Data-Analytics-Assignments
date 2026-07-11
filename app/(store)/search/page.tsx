import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/product-card'
import { SearchIcon } from 'lucide-react'
import Link from 'next/link'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q?.trim() || ''
  const category = params.category

  let products: any[] = []
  let categories: any[] = []

  if (query.length >= 2) {
    const supabase = await createClient()

    // Search products
    let productsQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        compare_at_price,
        image_url,
        is_active,
        is_featured,
        is_new,
        short_description,
        stock_quantity,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
      .order('is_featured', { ascending: false })
      .order('name')

    if (category) {
      productsQuery = productsQuery.eq('categories.slug', category)
    }

    const { data: productsData } = await productsQuery
    products = productsData || []

    // Search categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(5)

    categories = categoriesData || []
  }

  return (
    <div className="container py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {query ? (
            <>Search results for &quot;{query}&quot;</>
          ) : (
            'Search Products'
          )}
        </h1>
        {query && (
          <p className="text-muted-foreground">
            Found {products.length} product{products.length !== 1 ? 's' : ''}
            {categories.length > 0 && ` and ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
          </p>
        )}
      </div>

      {/* No query message */}
      {!query && (
        <div className="text-center py-16">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Start searching</h2>
          <p className="text-muted-foreground">
            Enter at least 2 characters to search for products
          </p>
        </div>
      )}

      {/* Query but no results */}
      {query && products.length === 0 && categories.length === 0 && (
        <div className="text-center py-16">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn&apos;t find any products matching &quot;{query}&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            Try searching with different keywords or browse our categories
          </p>
          <Link
            href="/shop"
            className="inline-block mt-4 text-primary hover:underline"
          >
            Browse all products
          </Link>
        </div>
      )}

      {/* Category matches */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}`}
                className="px-4 py-2 bg-muted rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Product results */}
      {products.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 8} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  
  return {
    title: query ? `Search: ${query} | Agri Hub SA` : 'Search | Agri Hub SA',
    description: query 
      ? `Search results for "${query}" at Agri Hub SA` 
      : 'Search for agricultural products, tools, and supplies at Agri Hub SA',
  }
}
