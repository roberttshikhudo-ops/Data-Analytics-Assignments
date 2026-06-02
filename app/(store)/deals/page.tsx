import { Metadata } from 'next'
import Link from 'next/link'
import { Tag, Clock, Percent, Truck, ArrowRight, Snowflake } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/product-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Deals & Special Offers | Agri Hub SA',
  description: 'Shop the best deals on agricultural supplies. Save big on seeds, fertilizers, equipment, and more at Agri Hub SA.',
}

const promotions = [
  {
    id: 1,
    title: 'Seasonal Planting Sale',
    description: 'Up to 25% off on all seeds and seedlings. Perfect time to prepare for the growing season.',
    discount: '25% OFF',
    code: 'PLANT25',
    validUntil: 'End of month',
    bgColor: 'bg-primary',
  },
  {
    id: 2,
    title: 'Bulk Fertilizer Deal',
    description: 'Buy 5 bags of fertilizer, get 1 FREE. Stock up and save on your farm essentials.',
    discount: 'BUY 5 GET 1',
    code: 'BULK6',
    validUntil: 'While stocks last',
    bgColor: 'bg-amber-600',
  },
  {
    id: 3,
    title: 'Free Delivery',
    description: 'Free nationwide delivery on all orders over R1,500. No code needed.',
    discount: 'FREE SHIPPING',
    code: null,
    validUntil: 'Ongoing',
    bgColor: 'bg-emerald-600',
  },
]

async function getDealsProducts() {
  const supabase = await createClient()
  
  // Get products with compare_at_price (on sale) and featured products
  const { data: saleProducts } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      images:product_images(url, alt_text, is_primary)
    `)
    .eq('is_active', true)
    .not('compare_at_price', 'is', null)
    .gt('compare_at_price', 0)
    .order('created_at', { ascending: false })
    .limit(8)

  // Get winter specials (comforters, bedspreads, blankets, heaters)
  const { data: winterProducts } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      images:product_images(url, alt_text, is_primary)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .or('name.ilike.%comforter%,name.ilike.%bedspread%,name.ilike.%blanket%,name.ilike.%heater%,name.ilike.%duvet%')
    .order('created_at', { ascending: false })
    .limit(12)

  // Get other featured products (excluding winter items)
  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      images:product_images(url, alt_text, is_primary)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .not('name', 'ilike', '%comforter%')
    .not('name', 'ilike', '%bedspread%')
    .not('name', 'ilike', '%blanket%')
    .not('name', 'ilike', '%heater%')
    .is('compare_at_price', null)
    .order('created_at', { ascending: false })
    .limit(4)

  return {
    saleProducts: (saleProducts || []) as Product[],
    winterProducts: (winterProducts || []) as Product[],
    featuredProducts: (featuredProducts || []) as Product[],
  }
}

export default async function DealsPage() {
  const { saleProducts, winterProducts, featuredProducts } = await getDealsProducts()
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-destructive text-destructive-foreground py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">
              Limited Time Offers
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Deals & Special Offers
            </h1>
            <p className="mt-4 text-lg opacity-90">
              Save big on quality agricultural supplies. Check out our latest promotions 
              and discounted products below.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-destructive/50 to-transparent hidden lg:block" />
      </section>

      {/* Promotion Cards */}
      <section className="py-12 bg-muted/50">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {promotions.map((promo) => (
              <Card key={promo.id} className={`${promo.bgColor} text-white border-0 overflow-hidden`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-3 bg-white/20 text-white hover:bg-white/30">
                        {promo.discount}
                      </Badge>
                      <h3 className="text-xl font-bold">{promo.title}</h3>
                      <p className="mt-2 text-sm opacity-90">{promo.description}</p>
                    </div>
                    <Tag className="h-8 w-8 opacity-50" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    {promo.code ? (
                      <div>
                        <p className="text-xs opacity-75">Use code:</p>
                        <p className="font-mono font-bold">{promo.code}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">Automatic discount</p>
                    )}
                    <div className="text-right">
                      <p className="text-xs opacity-75 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {promo.validUntil}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-5 w-5 text-destructive" />
                  <Badge variant="destructive">On Sale</Badge>
                </div>
                <h2 className="text-2xl font-bold md:text-3xl">Discounted Products</h2>
                <p className="mt-1 text-muted-foreground">
                  Grab these deals before they&apos;re gone
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/shop?sale=true">
                  View All Sale Items
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button asChild>
                <Link href="/shop?sale=true">View All Sale Items</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Winter Specials Section */}
      {winterProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-950/30 dark:to-slate-900/50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Snowflake className="h-5 w-5 text-blue-600" />
                  <Badge className="bg-blue-600 hover:bg-blue-700">Winter Specials</Badge>
                </div>
                <h2 className="text-2xl font-bold md:text-3xl">Stay Warm This Winter</h2>
                <p className="mt-1 text-muted-foreground">
                  Cozy comforters, bedspreads, blankets and more to keep you warm
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/shop/home-living">
                  View All Winter Items
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {winterProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button asChild>
                <Link href="/shop/home-living">View All Winter Items</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products / Staff Picks */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">Staff Picks</h2>
                <p className="mt-1 text-muted-foreground">
                  Our team&apos;s top recommendations for your farm
                </p>
              </div>
            </div>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {saleProducts.length === 0 && winterProducts.length === 0 && featuredProducts.length === 0 && (
        <section className="py-16 md:py-24">
          <div className="container text-center">
            <Tag className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">No Active Deals</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Check back soon for our latest promotions and special offers. 
              In the meantime, browse our full product catalog.
            </p>
            <Button asChild className="mt-6">
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Newsletter / Deals Alert */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-75" />
            <h2 className="text-2xl font-bold md:text-3xl">Never Miss a Deal</h2>
            <p className="mt-2 opacity-90">
              Sign up for our newsletter to receive exclusive offers, seasonal 
              promotions, and farming tips straight to your inbox.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
            <p className="mt-3 text-xs opacity-75">
              By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
