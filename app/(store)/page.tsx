import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, Truck, Shield, Phone, Leaf, MessageCircle, Sparkles, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard, ProductCardSkeleton } from '@/components/store/product-card'
import { CategoryCard } from '@/components/store/category-card'
import { HeroVideo } from '@/components/store/hero-video'
import { TestimonialsSection } from '@/components/store/testimonials-section'
import { FlashSaleContent } from '@/components/marketing/flash-sale-content'
import { groupProductVariants } from '@/lib/product-variants'
import { buildBulkQuoteWaLink } from '@/lib/whatsapp'
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

  take(beddingR, 6)
  take(warmersR, 3)
  take(gardeningR, 2)
  take(pestR, 2)

  // Fill any remaining slots from the combined winter pool.
  if (selection.length < 12) {
    for (const p of [...beddingR, ...warmersR, ...gardeningR, ...pestR]) {
      if (selection.length >= 12) break
      if (!seen.has(p.id)) {
        seen.add(p.id)
        selection.push(p)
      }
    }
  }

  return selection.slice(0, 12)
}

async function getNewArrivals() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(12)

  return data || []
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
    .limit(8)

  return data || []
}

export default async function HomePage() {
  const [featuredProducts, newArrivals, categories, dealsProducts, seedImages] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
    getDealsProducts(),
    getSeedImages(),
  ])

  const featuredGroups = groupProductVariants(featuredProducts).slice(0, 8)
  const newArrivalGroups = groupProductVariants(newArrivals).slice(0, 8)
  const dealsGroups = groupProductVariants(dealsProducts).slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Flash Sale — first thing every visitor sees */}
      <FlashSaleContent embedded />

      {/* Hero Video Section */}
      <HeroVideo seedImages={seedImages} />

      {/* Trust Badges */}
      <section className="border-y bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-medium">Free Delivery</p>
                <p className="text-sm text-muted-foreground">On orders over R1,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-medium">Quality Guarantee</p>
                <p className="text-sm text-muted-foreground">100% genuine products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-medium">Order on WhatsApp</p>
                <p className="text-sm text-muted-foreground">Fast, secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-medium">Expert Support</p>
                <p className="text-sm text-muted-foreground">Farming advice included</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Shop by Category</h2>
              <p className="mt-2 text-lg text-muted-foreground">Everything for your farm, home and lifestyle</p>
            </div>
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

      {/* New Arrivals */}
      {newArrivalGroups.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-foreground">
                  <Sparkles className="h-4 w-4" />
                  Just In
                </div>
                <h2 className="text-3xl font-bold md:text-4xl">New Arrivals</h2>
                <p className="mt-2 text-lg text-muted-foreground">The latest additions to our catalogue</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/shop?sort=newest">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {newArrivalGroups.map((grp, index) => (
                <ProductCard key={grp.id} product={grp.primary} group={grp} priority={index < 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Winter Essentials</h2>
              <p className="mt-2 text-lg text-muted-foreground">Stay warm and ready this season</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/shop?featured=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {featuredGroups.map((grp, index) => (
                <ProductCard key={grp.id} product={grp.primary} group={grp} priority={index < 4} />
              ))}
            </div>
          </Suspense>
        </div>
      </section>

      {/* Bulk / Wholesale Quote CTA */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="container flex flex-col items-center gap-6 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-4">
            <div className="hidden rounded-full bg-primary/15 p-4 sm:block">
              <PackageCheck className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-balance md:text-3xl">Buying in bulk?</h2>
              <p className="mt-1 max-w-xl text-pretty text-secondary-foreground/80">
                Farms, resellers and businesses get sharper pricing on larger quantities. Send us your
                list and we&apos;ll come back with a tailored quote.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="h-14 shrink-0 gap-2 bg-[#25D366] px-8 text-lg font-semibold text-white hover:bg-[#20BD5A]"
          >
            <a href={buildBulkQuoteWaLink()} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Request a Bulk Quote
            </a>
          </Button>
        </div>
      </section>

      {/* Special Deals */}
      {dealsGroups.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">Winter Specials</h2>
                <p className="mt-2 text-lg text-muted-foreground">Save on these great products</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/deals">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {dealsGroups.map((grp) => (
                <ProductCard key={grp.id} product={grp.primary} group={grp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Testimonials */}
      <TestimonialsSection />

      {/* CTA Banner */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Need Help Choosing?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/90">
            Whether you&apos;re growing crops, building your dream home, or upgrading your lifestyle -
            our experts are here to guide you. Get personalized recommendations for agriculture,
            hardware, and lifestyle products tailored to your unique needs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-black text-white hover:bg-black/90" asChild>
              <Link href="/contact">Talk to an Expert</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-black bg-black text-white hover:bg-black/90"
              asChild
            >
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
