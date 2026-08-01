import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, Truck, Shield, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard, ProductCardSkeleton } from '@/components/store/product-card'
import { CategoryCard } from '@/components/store/category-card'
import { groupProductVariants } from '@/lib/product-variants'
import { createClient } from '@/lib/supabase/server'

const HOME_LIVING_CATEGORY_ID = '099152dd-3ae4-4033-a201-92218245e22a'

async function getHomeLivingProducts() {
  const supabase = await createClient()

  // Fetch reversible comforters explicitly (they're older rows that fall
  // outside the most-recent slice) so we can feature them first, plus a slice
  // of the newest products for variety.
  const [reversible, recent] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .eq('category_id', HOME_LIVING_CATEGORY_ID)
      .ilike('name', '%reversible%')
      .order('name')
      .limit(60),
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .eq('category_id', HOME_LIVING_CATEGORY_ID)
      .order('created_at', { ascending: false })
      .limit(48),
  ])

  // Merge with reversible comforters first, de-duplicating by id.
  const merged = [...(reversible.data || []), ...(recent.data || [])]
  const seen = new Set<string>()
  return merged.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return data || []
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getHomeLivingProducts(), getCategories()])

  const grouped = groupProductVariants(products)

  // Feature reversible comforters first, then the rest of the range (a natural
  // mix of cookware, bedding and homeware) in its existing order.
  const isReversible = (name: string) => /reversible/i.test(name)
  const productGroups = [
    ...grouped.filter((grp) => isReversible(grp.name)),
    ...grouped.filter((grp) => !isReversible(grp.name)),
  ]

  return (
    <div className="flex flex-col">
      {/* Trust Badges */}
      <section className="border-b bg-card">
        <div className="container py-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Free Delivery</p>
                <p className="text-sm text-muted-foreground">On orders over R1,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Quality Guarantee</p>
                <p className="text-sm text-muted-foreground">100% genuine products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Order on WhatsApp</p>
                <p className="text-sm text-muted-foreground">Fast, secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-10">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold md:text-4xl">Bedding and Kitchenware</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Quality cookware, bedding and homeware - shop the full range below
            </p>
          </div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {productGroups.map((grp, index) => (
                <ProductCard key={grp.id} product={grp.primary} group={grp} priority={index < 8} />
              ))}
            </div>
          </Suspense>
        </div>
      </section>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section className="border-t py-12 bg-muted/30">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-bold md:text-3xl">Shop by Category</h2>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/shop">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
