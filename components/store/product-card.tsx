'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye, MessageCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { ProductQuickView } from '@/components/store/product-quick-view'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { buildProductWaLink } from '@/lib/whatsapp'
import type { Product } from '@/lib/types'
import type { ProductGroup } from '@/lib/product-variants'

// Tiny neutral blur placeholder so a color paints instantly while the
// optimized image streams in — avoids blank/grey boxes on first visit.
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWFlN2UxIi8+PC9zdmc+'

interface ProductCardProps {
  product: Product
  /** Optional pre-computed variant group (colour siblings collapsed to one card). */
  group?: ProductGroup
  /** Eagerly load this image (use for the first row of above-the-fold cards). */
  priority?: boolean
}

export function ProductCard({ product, group, priority = false }: ProductCardProps) {
  const { addItem } = useCart()

  // Fall back to a trivial single-variant group for legacy call sites.
  const g: ProductGroup = group ?? {
    id: product.id,
    name: product.name,
    primary: product,
    hasVariants: false,
    variants: [{ product, label: product.name, colorKey: 'default', swatch: '#d8c7a8', kind: 'color' }],
  }

  // Show image thumbnails (instead of solid colour dots) when any variant is
  // design-based (e.g. Moffy 001–005), OR when two variants share the same
  // swatch colour — e.g. "White & Silver" vs "White & Gold" would otherwise
  // render identical dots, so thumbnails keep them distinguishable.
  const hasDuplicateSwatch =
    new Set(g.variants.map((v) => v.colorKey)).size !== g.variants.length
  const useThumbnails = g.variants.some((v) => v.kind === 'design') || hasDuplicateSwatch

  const [activeIndex, setActiveIndex] = useState(0)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const active = g.variants[activeIndex]?.product ?? g.primary
  const { isInWishlist, isLoading: wishlistLoading, toggleWishlist } = useWishlist(active.id)

  const discount = calculateDiscount(active.price, active.compare_at_price)
  const isOutOfStock = active.stock_quantity <= 0
  const isLowStock = active.stock_quantity > 0 && active.stock_quantity <= 10
  const displayName = g.hasVariants ? g.name : active.name
  // "New" and "Low Stock" badges are only shown for carpets.
  const isCarpet =
    /\bcarpet/i.test(active.name) ||
    /\bcarpet/i.test(g.name) ||
    /\bcarpet/i.test(active.category?.name ?? '')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const productUrl = baseUrl ? `${baseUrl}/products/${active.slug}` : undefined

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) return
    addItem({
      productId: active.id,
      name: active.name,
      price: active.price,
      image: active.image_url,
      sku: active.sku,
      stock: active.stock_quantity,
    })
  }

  return (
    <Card className="group relative flex flex-col overflow-hidden border-border/50 transition-colors hover:border-primary/30">
      <Link href={`/products/${active.slug}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {active.image_url ? (
            <Image
              src={active.image_url}
              alt={displayName}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              quality={60}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 text-muted-foreground">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {discount && (
              <Badge variant="destructive" className="text-xs">
                -{discount}%
              </Badge>
            )}
            {active.is_featured && <Badge className="bg-primary text-xs">Featured</Badge>}
            {active.is_new && !isOutOfStock && isCarpet && (
              <Badge className="bg-accent text-accent-foreground text-xs">New</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
            {isLowStock && !isOutOfStock && isCarpet && (
              <Badge
                variant="outline"
                className="border-warning bg-warning/10 text-xs text-warning-foreground"
              >
                Low Stock
              </Badge>
            )}
            {active.availability === 'online_only' && (
              <Badge variant="outline" className="border-blue-300 bg-blue-500/10 text-xs text-blue-700">
                Online Only
              </Badge>
            )}
            {active.availability === 'in_store_only' && (
              <Badge variant="outline" className="border-amber-300 bg-amber-500/10 text-xs text-amber-700">
                In-Store Only
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              disabled={wishlistLoading}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isInWishlist}
              onClick={(e) => {
                e.preventDefault()
                toggleWishlist()
              }}
            >
              <Heart className={cn('h-4 w-4', isInWishlist && 'fill-primary text-primary')} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault()
                setQuickViewOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-4">
          {/* Category */}
          {active.category && (
            <p className="mb-1 text-sm text-muted-foreground">{active.category.name}</p>
          )}

          {/* Name */}
          <h3 className="line-clamp-2 min-h-[3rem] text-base font-medium leading-snug transition-colors group-hover:text-primary">
            {displayName}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold">{formatPrice(active.price)}</span>
            {active.compare_at_price && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(active.compare_at_price)}
              </span>
            )}
          </div>

          {/* Variant selector: image thumbnails for designs, colour dots otherwise */}
          {g.hasVariants && (
            <div className="mt-3 flex items-center gap-1.5">
              {g.variants.slice(0, 5).map((v, i) =>
                useThumbnails ? (
                  <button
                    key={v.product.id}
                    type="button"
                    aria-label={`View ${v.label}`}
                    aria-pressed={i === activeIndex}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveIndex(i)
                    }}
                    className={cn(
                      'relative h-8 w-8 overflow-hidden rounded-md border shadow-sm transition-transform hover:scale-110',
                      i === activeIndex ? 'ring-2 ring-primary ring-offset-1' : 'border-border',
                    )}
                  >
                    {v.product.image_url ? (
                      <Image
                        src={v.product.image_url}
                        alt={v.label}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-muted text-[10px]">
                        {v.label}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    key={v.product.id}
                    type="button"
                    aria-label={`View ${v.label}`}
                    aria-pressed={i === activeIndex}
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveIndex(i)
                    }}
                    className={cn(
                      'relative h-6 w-6 rounded-full border shadow-sm transition-transform hover:scale-110',
                      i === activeIndex ? 'ring-2 ring-primary ring-offset-1' : 'border-border',
                    )}
                    style={{ backgroundColor: v.swatch }}
                  >
                    {i === activeIndex && (
                      <Check
                        className={cn(
                          'absolute inset-0 m-auto h-3 w-3',
                          v.colorKey === 'white' || v.colorKey === 'cream' || v.colorKey === 'ivory'
                            ? 'text-black'
                            : 'text-white',
                        )}
                      />
                    )}
                  </button>
                ),
              )}
              {g.variants.length > 5 && (
                <span className="text-xs text-muted-foreground">+{g.variants.length - 5}</span>
              )}
            </div>
          )}
        </CardContent>
      </Link>

      {/* Actions */}
      <div className="flex flex-col gap-2 px-4 pb-4">
        <Button
          className="w-full"
          variant={isOutOfStock ? 'secondary' : 'default'}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full gap-2 border-[#25D366]/40 text-[#075E54] hover:bg-[#25D366]/10 hover:text-[#075E54]"
        >
          <a
            href={buildProductWaLink(active.name, active.price, productUrl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            Order on WhatsApp
          </a>
        </Button>
      </div>

      <ProductQuickView
        group={g}
        activeIndex={activeIndex}
        onSelectVariant={setActiveIndex}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </Card>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-24" />
      </CardContent>
      <div className="space-y-2 px-4 pb-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  )
}
