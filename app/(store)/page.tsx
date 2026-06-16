import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, Truck, Shield, Phone, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard, ProductCardSkeleton } from '@/components/store/product-card'
import { CategoryCard } from '@/components/store/category-card'
import { HeroVideo } from '@/components/store/hero-video'
import { TestimonialsSection } from '@/components/store/testimonials-section'
import { createClient } from '@/lib/supabase/server'

async function getFeaturedProducts() {
  const supabase = await createClient()
  const select = '*, category:categories(*)'

  // Seasonal curation: surface the products in highest demand during winter -
  // cozy bedding, warmers, gardening tools, and Protek pest/Terminex control.
  const [bedding, warmers, gardening, pestControl] = await Promise.all([
    supabase
      .from('products')
      .select(select)
      .eq('is_active', true)
      .or(
        'name.ilike.%comforter%,name.ilike.%blanket%,name.ilike.%throw%,name.ilike.%quilt%,name.ilike.%bedspread%,name.ilike.%duvet%,name.ilike.%fleece%,name.ilike.%corduroy%'
      )
      .limit(16),
    supabase
      .from('products')
      .select(select)
      .eq('is_active', true)
      .or('name.ilike.%heater%,name.ilike.%warmer%,name.ilike.%heating%')
      .limit(6),
    supabase
      .from('products')
      .select(select)
      .eq('is_active', true)
      .or(
        'name.ilike.%spade%,name.ilike.%garden fork%,name.ilike.%rake%,name.ilike.%shovel%,name.ilike.%hoe%,name.ilike.%secateur%,name.ilike.%pruner%,name.ilike.%garden tool%'
      )
      .limit(6),
    supabase
      .from('products')
      .select(select)
      .eq('is_active', true)
      .or(
        'name.ilike.%terminex%,name.ilike.%knox%,name.ilike.%kill-all%,name.ilike.%spray-kill%,name.ilike.%scatterkill%'
      )
      .limit(6),
  ])

  // Prefer items that are on sale / flagged featured first within each group.
  const rank = (arr: any[]) =>
    [...(arr || [])].sort((a, b) => {
      const score = (p: any) => (p.compare_at_price ? 2 : 0) + (p.is_featured ? 1 : 0)
      return score(b) - score(a)
    })

  const beddingR = rank(bedding.data || [])
  const warmersR = rank(warmers.data || [])
  const gardeningR = rank(gardening.data || [])
  const pestR = rank(pestControl.data || [])

  // Balanced winter mix across the four groups.
  const selection: any[] = []
  const seen = new Set<string>()
  const take = (arr: any[], n: number) => {
    for (const p of arr) {
      if (n <= 0) break
      if (!seen.has(p.id)) {
        seen.add(p.id)
        selection.push(p)
        n--
      }
    }
  }

  take(beddingR, 4)
  take(warmersR, 2)
  take(gardeningR, 1)
  take(pestR, 1)

  // Fill any remaining slots from the combined winter pool.
  if (selection.length < 8) {
    for (const p of [...beddingR, ...warmersR, ...gardeningR, ...pestR]) {
      if (selection.length >= 8) break
      if (!seen.has(p.id)) {
        seen.add(p.id)
        selection.push(p)
      }
    }
  }

  return selection.slice(0, 8)
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

async function getSeedImages() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('image_url')
    .eq('is_active', true)
    .or('name.ilike.%seed%,name.ilike.%seedling%,name.ilike.%mbeu%')

  const unique = Array.from(
    new Set((data || []).map((p) => p.image_url).filter(Boolean))
  ) as string[]

  return unique
}

async function getDealsProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .not('compare_at_price', 'is', null)
    .limit(4)
  
  return data || []
}

export default async function HomePage() {
  const [featuredProducts, categories, dealsProducts, seedImages] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getDealsProducts(),
    getSeedImages(),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Video Section */}
      <HeroVideo seedImages={seedImages} />

      {/* Trust Badges */}
      <section className="border-y bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-base">Free Delivery</p>
                <p className="text-sm text-muted-foreground">On orders over R1,500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-base">Quality Guarantee</p>
                <p className="text-sm text-muted-foreground">100% genuine products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-black p-4">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-base text-black">Expert Support</p>
                <p className="text-sm text-black/70">Farming advice included</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-base">Sustainable</p>
                <p className="text-sm text-muted-foreground">Eco-friendly options</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Shop by Category</h2>
              <p className="text-lg text-muted-foreground mt-2">Find what you need for your farm</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/shop">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Winter Essentials</h2>
              <p className="text-lg text-muted-foreground mt-2">Stay warm and ready this season</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/shop?featured=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Suspense>
        </div>
      </section>

      {/* Special Deals */}
      {dealsProducts.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Winter Specials</h2>
                <p className="text-lg text-muted-foreground mt-2">Stay warm and save on these great products</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/deals">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {dealsProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Testimonials */}
      <TestimonialsSection />

      {/* CTA Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Need Help Choosing?</h2>
          <p className="mt-4 text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re growing crops, building your dream home, or upgrading your lifestyle - 
            our experts are here to guide you. Get personalized recommendations for agriculture, 
            hardware, and lifestyle products tailored to your unique needs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-black text-white hover:bg-black/90" asChild>
              <Link href="/contact">
                Talk to an Expert
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-black bg-black text-white hover:bg-black/90" asChild>
              <a href="tel:+27791099490">
                <Phone className="mr-2 h-4 w-4" />
                079 109 9490
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
