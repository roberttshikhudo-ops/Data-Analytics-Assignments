import Link from 'next/link'
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Clock,
  Flame,
  MessageCircle,
  Phone,
  ShoppingBag,
  PackageCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/product-card'
import { CountdownTimer } from '@/components/marketing/countdown-timer'
import { FloatingBedding } from '@/components/marketing/floating-bedding'
import { ProductMarquee } from '@/components/marketing/product-marquee'
import { Button } from '@/components/ui/button'
import { calculateDiscount } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { SALES_WHATSAPP_NUMBER } from '@/lib/whatsapp'

// A genuine 24-hour window: ends at 23:59 tonight. If fewer than 3 hours remain
// when a visitor lands, roll to 23:59 tomorrow so the urgency stays meaningful.
export function getFlashEndDate(): string {
  const now = new Date()
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  if (end.getTime() - now.getTime() < 3 * 60 * 60 * 1000) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000)
  }
  return end.toISOString()
}

export async function getFlashProducts(): Promise<Product[]> {
  const supabase = await createClient()

  // Discounted winter-bedding heroes with stock and images — the real deals.
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('is_active', true)
    .gt('stock_quantity', 0)
    .not('compare_at_price', 'is', null)
    .gt('compare_at_price', 0)
    .or(
      'name.ilike.%comforter%,name.ilike.%blanket%,name.ilike.%throw%,name.ilike.%duvet%,name.ilike.%fleece%,name.ilike.%corduroy%,name.ilike.%bedspread%,name.ilike.%quilt%',
    )
    .order('is_featured', { ascending: false })
    .order('compare_at_price', { ascending: false, nullsFirst: false })
    .limit(12)

  return (data || []) as Product[]
}

// Hand-picked "flying" hero products, in display order:
// 1) Generic Reversible Comforter, 2) MOMO, 3) RARA, 4) Moffy,
// 5) Fleece throw (R265), 6) Fleece throw (R255).
const HERO_SLUGS = [
  '5pcs-generic-reversible-comforters-grey',
  'momo-002-super-king-quilt-set',
  'rara-002-super-king-quilt-set',
  'moffy-001',
  'fleece-blanket-throw-teal-200cm-by-230cm',
  'fleece-throw-180x200-grey',
] as const

export async function getFlashHeroProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .in('slug', HERO_SLUGS as unknown as string[])

  const bySlug = new Map((data || []).map((p) => [p.slug, p as Product]))
  // Preserve the curated order and drop any that aren't found.
  return HERO_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean) as Product[]
}

/**
 * The full 24-Hour Winter Bedding Flash Sale experience.
 *
 * - Standalone landing page (`/promo/flash-sale`) renders it with all sections.
 * - Homepage renders it with `embedded` so it appears first without the
 *   duplicate final-CTA countdown or the fixed mobile order bar (the homepage
 *   has its own navigation and continues with the rest of the store below).
 */
export async function FlashSaleContent({ embedded = false }: { embedded?: boolean }) {
  const [products, heroProducts] = await Promise.all([
    getFlashProducts(),
    getFlashHeroProducts(),
  ])
  const endDate = getFlashEndDate()

  // Fall back to the general deal list if any curated hero product is missing.
  const floatingProducts = heroProducts.length >= 4 ? heroProducts : products

  // Real "up to X% off" headline computed from live prices.
  const maxDiscount = products.reduce((max, p) => {
    const d = calculateDiscount(p.price, p.compare_at_price) ?? 0
    return d > max ? d : max
  }, 0)

  const steps = [
    {
      icon: ShoppingBag,
      title: 'Pick your bedding',
      text: 'Browse the deals below and tap a product to see full details.',
    },
    {
      icon: MessageCircle,
      title: 'Order in seconds',
      text: 'Checkout online, or tap “Order on WhatsApp” and we’ll do the rest.',
    },
    {
      icon: PackageCheck,
      title: 'Delivered to you',
      text: 'Fast, tracked nationwide delivery straight to your door.',
    },
  ]

  const trust = [
    { icon: Clock, label: 'Today only — ends midnight' },
    { icon: Truck, label: 'Nationwide delivery' },
    { icon: ShieldCheck, label: 'Secure payment' },
    { icon: MessageCircle, label: 'Order on WhatsApp' },
  ]

  return (
    <div className={`flex flex-col ${embedded ? '' : 'pb-20 md:pb-0'}`}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />

        <div className="container relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          {/* Left: copy + countdown + CTAs */}
          <div className="text-center md:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold">
              <Flame className="h-4 w-4" />
              24-Hour Flash Sale
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight md:text-6xl">
              Winter Bedding Sale
              {maxDiscount > 0 && (
                <span className="mt-2 block text-emerald-400">Save up to {maxDiscount}% — Today Only</span>
              )}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-white/85 md:mx-0">
              Cozy corduroy comforters, plush fleece throws and warm winter blankets at their
              lowest prices. When the timer hits zero, the deals are gone.
            </p>

            {/* Countdown */}
            <div className="mt-8">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/70">
                Offer ends in
              </p>
              <CountdownTimer endDate={endDate} className="flex justify-center md:justify-start" />
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Button
                size="lg"
                className="h-14 bg-emerald-500 px-8 text-lg font-semibold text-white hover:bg-emerald-600"
                asChild
              >
                <Link href="#deals">
                  Shop the Deals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="h-14 gap-2 bg-[#25D366] px-8 text-lg font-semibold text-white hover:bg-[#20BD5A]"
                asChild
              >
                <Link href="/order">
                  <MessageCircle className="h-5 w-5" />
                  Order on WhatsApp
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: floating real bedding products */}
          <div className="relative">
            <FloatingBedding products={floatingProducts} />
          </div>
        </div>
      </section>

      {/* Moving product ribbon */}
      {products.length > 0 && (
        <section className="border-b bg-background py-6">
          <p className="container mb-4 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Tap any product to grab the deal
          </p>
          <ProductMarquee products={products} />
        </section>
      )}

      {/* Trust bar */}
      <section className="border-b bg-card py-6">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
          {trust.map((item) => (
            <div key={item.label} className="flex items-center justify-center gap-3 text-sm">
              <item.icon className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-pretty text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Deals grid */}
      <section id="deals" className="scroll-mt-20 py-12 md:py-16">
        <div className="container">
          <div className="mb-8 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-sm font-semibold text-red-600">
              <Flame className="h-4 w-4" />
              Hot Winter Deals
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Grab These Before Midnight</h2>
            <p className="mx-auto mt-1 max-w-xl text-muted-foreground">
              Limited stock at these prices. Once they&apos;re gone, they&apos;re gone.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-medium">Fresh winter deals are loading.</p>
              <Button className="mt-4" asChild>
                <Link href="/shop/home-living">Browse all bedding</Link>
              </Button>
            </div>
          )}

          <div className="mt-10 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop/home-living">
                See all bedding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="bg-muted/40 py-12 md:py-16">
        <div className="container">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Ordering Is Easy</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="absolute right-4 top-4 text-3xl font-bold text-muted-foreground/20">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — standalone landing page only */}
      {!embedded && (
        <section className="bg-gradient-to-r from-slate-900 to-emerald-900 py-16 text-white">
          <div className="container text-center">
            <h2 className="text-balance text-3xl font-bold md:text-4xl">The Clock Is Ticking</h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-white/85">
              These flash-sale prices disappear at midnight. Order now and stay warm this winter for
              less.
            </p>

            <div className="mt-8">
              <CountdownTimer endDate={endDate} className="flex justify-center" />
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-14 bg-emerald-500 px-10 text-lg font-semibold text-white hover:bg-emerald-600"
                asChild
              >
                <Link href="#deals">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="h-14 gap-2 bg-[#25D366] px-8 text-lg font-semibold text-white hover:bg-[#20BD5A]"
                asChild
              >
                <Link href="/order">
                  <MessageCircle className="h-5 w-5" />
                  Order on WhatsApp
                </Link>
              </Button>
            </div>

            <div className="mt-6">
              <Button variant="link" className="text-white/80 hover:text-white" asChild>
                <a href={`tel:+${SALES_WHATSAPP_NUMBER}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call / WhatsApp: 083 306 1529
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Sticky mobile order bar — standalone landing page only */}
      {!embedded && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-background/95 p-3 backdrop-blur md:hidden">
          <Button className="flex-1" asChild>
            <Link href="#deals">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Shop Deals
            </Link>
          </Button>
          <Button className="flex-1 gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]" asChild>
            <Link href="/order">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
