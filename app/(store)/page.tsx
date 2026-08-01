import Link from 'next/link'
import { ArrowRight, Truck, Shield, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/store/product-card'
import { CategoryCard } from '@/components/store/category-card'
import { buildCuratedGroup, type ProductGroup } from '@/lib/product-variants'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

const HOME_LIVING_CATEGORY_ID = '099152dd-3ae4-4033-a201-92218245e22a'

// Featured families in the exact order requested. Each row is 3 cards on
// desktop: row 1 = comforters, row 2 = comforters, row 3 = cookware,
// row 4 = chairs & folding tables.
const FEATURED_FAMILIES: { id: string; name: string; match: RegExp }[] = [
  { id: 'moffy', name: 'Moffy 7pcs Super King Comforter', match: /^moffy\b/i },
  { id: 'rara', name: 'RARA Super King Quilt Set', match: /\brara\b/i },
  { id: 'generic-reversible', name: '5pcs Generic Reversible Comforters', match: /generic reversible/i },
  { id: '9pcs', name: '9pcs Comforter Set', match: /^9pcs comforter set/i },
  { id: 'momo', name: 'MOMO Super King Quilt Set', match: /\bmomo\b/i },
  { id: 'geometric', name: '5pcs Geometric Comforter', match: /geometric comforter/i },
  { id: '8pcs-cookware', name: '8pcs Non-Stick Granite Cookware Pot Set', match: /^8pcs non-stick granite cookware/i },
  { id: '10pcs-cookware', name: '10pcs Granite Non-Stick Cookware Set', match: /^10pcs granite non-stick cookware/i },
  { id: 'luna-cookware', name: 'Luna Marble 10pcs Premium Cookware Set', match: /^luna marble/i },
  { id: 'fortis-chair', name: 'Fortis 6-Pack Folding Chair', match: /^fortis 6-pack folding chair/i },
  { id: 'foldable-table', name: 'Foldable Table', match: /^foldable table/i },
]

async function getCategoryProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('category_id', HOME_LIVING_CATEGORY_ID)
    .order('name')

  return (data || []) as Product[]
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
  const [products, categories] = await Promise.all([getCategoryProducts(), getCategories()])

  const featured = FEATURED_FAMILIES.map((f) =>
    buildCuratedGroup(f.id, f.name, products.filter((p) => f.match.test(p.name))),
  ).filter((g): g is ProductGroup => g !== null)

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

      {/* Featured Product Grid */}
      <section className="py-10">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold md:text-4xl">Bedding and Kitchenware</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Quality comforters, cookware and homeware - tap a design or colour to switch
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {featured.map((grp, index) => (
              <ProductCard key={grp.id} product={grp.primary} group={grp} priority={index < 6} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/shop">
                View all products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
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
