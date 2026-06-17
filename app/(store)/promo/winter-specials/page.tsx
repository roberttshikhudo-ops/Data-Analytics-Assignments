import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Truck,
  Shield,
  Star,
  Snowflake,
  Phone,
  MessageCircle,
  Flame,
  Sparkles,
  BadgePercent,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/product-card'
import { CountdownTimer } from '@/components/marketing/countdown-timer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

const OFFER_TITLE = 'Winter Specials at Agri Hub SA'
const OFFER_DESCRIPTION =
  'Stay warm for less this winter. Shop cozy corduroy comforters, fleece throws, blankets and home essentials — plus FREE delivery on orders over R1,000.'

export const metadata: Metadata = {
  title: OFFER_TITLE,
  description: OFFER_DESCRIPTION,
  openGraph: {
    title: OFFER_TITLE,
    description: OFFER_DESCRIPTION,
    images: ['/images/promo/winter-specials-hero.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: OFFER_TITLE,
    description: OFFER_DESCRIPTION,
    images: ['/images/promo/winter-specials-hero.png'],
  },
}

// Offer ends at the close of the current month (auto-refreshes monthly so the
// countdown never shows an expired campaign).
function getOfferEndDate(): string {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return end.toISOString()
}

const PRODUCT_SELECT = `
  *,
  category:categories(name, slug),
  images:product_images(url, alt_text, is_primary)
`

async function getCampaignProducts() {
  const supabase = await createClient()

  // Winter bedding & warmth products
  const { data: winterProducts } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .or(
      'name.ilike.%comforter%,name.ilike.%bedspread%,name.ilike.%blanket%,name.ilike.%throw%,name.ilike.%duvet%,name.ilike.%fleece%,name.ilike.%corduroy%,name.ilike.%heater%,name.ilike.%warmer%'
    )
    .order('compare_at_price', { ascending: false, nullsFirst: false })
    .limit(8)

  // Anything on sale (has a compare-at price)
  const { data: saleProducts } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .not('compare_at_price', 'is', null)
    .gt('compare_at_price', 0)
    .order('created_at', { ascending: false })
    .limit(8)

  return {
    winterProducts: (winterProducts || []) as Product[],
    saleProducts: (saleProducts || []) as Product[],
  }
}

export default async function WinterSpecialsPage() {
  const { winterProducts, saleProducts } = await getCampaignProducts()
  const endDate = getOfferEndDate()

  const trustItems = [
    { icon: Truck, label: 'FREE delivery over R1,000' },
    { icon: Shield, label: 'Quality guaranteed' },
    { icon: Star, label: 'Trusted by 5,000+ customers' },
    { icon: Snowflake, label: 'Winter essentials in stock' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="container relative grid gap-10 py-14 md:py-20 lg:grid-cols-2 lg:items-center">
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Snowflake className="h-4 w-4" />
              Limited-Time Winter Event
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Stay Warm for Less
              <span className="mt-2 block text-emerald-400">Winter Specials Are Here</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-white/85 lg:mx-0">
              {OFFER_DESCRIPTION}
            </p>

            {/* Countdown */}
            <div className="mt-8">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/70">
                Hurry — offer ends in:
              </p>
              <CountdownTimer endDate={endDate} className="flex justify-center lg:justify-start" />
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                className="h-14 bg-emerald-500 px-8 text-lg font-semibold text-white hover:bg-emerald-600"
                asChild
              >
                <Link href="/shop/home-living">
                  Shop Winter Deals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 border-2 border-white/40 bg-transparent px-8 text-lg text-white hover:bg-white/10"
                asChild
              >
                <Link href="/deals">View All Specials</Link>
              </Button>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
              <Image
                src="/images/promo/winter-specials-hero.png"
                alt="Cozy winter bedroom with plush corduroy comforter and fleece throw from Agri Hub SA"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-3 -top-3 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-emerald-500 text-center shadow-lg sm:-right-4 sm:-top-4">
              <span className="text-xs font-medium uppercase">Free</span>
              <span className="text-lg font-bold leading-none">Delivery</span>
              <span className="text-[10px]">over R1,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b bg-card py-6">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-3 text-sm">
                <item.icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-pretty">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Winter products */}
      {winterProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <Badge className="bg-orange-500 hover:bg-orange-600">Winter Favourites</Badge>
                </div>
                <h2 className="text-2xl font-bold md:text-3xl">Cozy Up This Season</h2>
                <p className="mt-1 text-muted-foreground">
                  Our most-loved comforters, throws and blankets to keep you warm.
                </p>
              </div>
              <Button variant="outline" asChild className="hidden shrink-0 sm:flex">
                <Link href="/shop/home-living">
                  Shop All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {winterProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Free delivery value banner */}
      <section className="bg-emerald-600 py-10 text-white">
        <div className="container flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-4">
            <Truck className="h-10 w-10 shrink-0" />
            <div>
              <h3 className="text-xl font-bold md:text-2xl">Spend R1,000, Get FREE Delivery</h3>
              <p className="text-white/85">
                Stock up on winter essentials and we&apos;ll ship them to your door — anywhere in South
                Africa, on us.
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="h-12 shrink-0 bg-white px-8 font-semibold text-emerald-700 hover:bg-white/90"
            asChild
          >
            <Link href="/shop">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* On sale products */}
      {saleProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <BadgePercent className="h-5 w-5 text-destructive" />
                  <Badge variant="destructive">On Sale Now</Badge>
                </div>
                <h2 className="text-2xl font-bold md:text-3xl">More Ways to Save</h2>
                <p className="mt-1 text-muted-foreground">
                  Marked-down prices across bedding and farm essentials.
                </p>
              </div>
              <Button variant="outline" asChild className="hidden shrink-0 sm:flex">
                <Link href="/deals">
                  See All Deals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social proof */}
      <section className="bg-muted/40 py-14">
        <div className="container max-w-4xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center md:p-12">
              <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
              <div className="mb-4 flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-balance text-xl font-medium md:text-2xl">
                &ldquo;The corduroy comforter set is unbelievably soft and warm. Delivery was fast and
                free. Agri Hub has become my go-to for home essentials!&rdquo;
              </blockquote>
              <div className="mt-6">
                <p className="font-semibold">Nomsa Dlamini</p>
                <p className="text-sm text-muted-foreground">Verified Customer, Gauteng</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA + contact */}
      <section className="bg-gradient-to-r from-slate-900 to-emerald-900 py-16 text-white">
        <div className="container text-center">
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Winter Won&apos;t Wait — Neither Should the Savings
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-white/85">
            These prices are for a limited time only. Grab your winter essentials before the offer ends.
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
              <Link href="/shop/home-living">
                Shop Winter Specials
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="h-14 gap-2 bg-[#25D366] px-8 text-lg font-semibold text-white hover:bg-[#20BD5A]"
              asChild
            >
              <Link
                href="https://wa.me/27833061529?text=Hi!%20I%27m%20interested%20in%20the%20Winter%20Specials."
                target="_blank"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp Us
              </Link>
            </Button>
          </div>

          <div className="mt-6">
            <Button variant="link" className="text-white/80 hover:text-white" asChild>
              <a href="tel:+27791099490">
                <Phone className="mr-2 h-4 w-4" />
                Call us: 079 109 9490
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
