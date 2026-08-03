'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Zap, MessageCircle, Minus, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCart } from '@/hooks/use-cart'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { buildProductWaLink } from '@/lib/whatsapp'
import type { ProductGroup } from '@/lib/product-variants'

interface ProductQuickViewProps {
  group: ProductGroup
  activeIndex: number
  onSelectVariant: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductQuickView({
  group,
  activeIndex,
  onSelectVariant,
  open,
  onOpenChange,
}: ProductQuickViewProps) {
  const { addItem, openCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const active = group.variants[activeIndex]?.product ?? group.primary
  const hasDuplicateSwatch =
    new Set(group.variants.map((v) => v.colorKey)).size !== group.variants.length
  const useThumbnails = group.variants.some((v) => v.kind === 'design') || hasDuplicateSwatch
  const discount = calculateDiscount(active.price, active.compare_at_price)
  const isOutOfStock = active.stock_quantity <= 0
  const maxQty = Math.max(1, active.stock_quantity)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const productUrl = baseUrl ? `${baseUrl}/products/${active.slug}` : undefined

  const addActive = () => {
    if (isOutOfStock) return
    addItem(
      {
        productId: active.id,
        name: active.name,
        price: active.price,
        image: active.image_url,
        sku: active.sku,
        stock: active.stock_quantity,
      },
      quantity,
    )
  }

  const handleBuyNow = () => {
    addActive()
    onOpenChange(false)
    openCart()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            {active.image_url ? (
              <Image
                src={active.image_url}
                alt={active.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12" />
              </div>
            )}
            {discount && (
              <Badge variant="destructive" className="absolute left-3 top-3">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col p-6">
            <DialogHeader className="text-left">
              {active.category && (
                <p className="text-sm text-muted-foreground">{active.category.name}</p>
              )}
              <DialogTitle className="text-balance text-xl leading-snug">
                {group.hasVariants ? group.name : active.name}
              </DialogTitle>
              {active.short_description && (
                <DialogDescription className="text-pretty">
                  {active.short_description}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPrice(active.price)}</span>
              {active.compare_at_price && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(active.compare_at_price)}
                </span>
              )}
            </div>

            {/* Variant selector */}
            {group.hasVariants && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium">
                  {useThumbnails ? 'Design' : 'Colour'}:{' '}
                  <span className="text-muted-foreground">{group.variants[activeIndex]?.label}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.variants.map((v, i) =>
                    useThumbnails ? (
                      <button
                        key={v.product.id}
                        type="button"
                        onClick={() => onSelectVariant(i)}
                        aria-label={`Select ${v.label}`}
                        aria-pressed={i === activeIndex}
                        className={cn(
                          'relative h-12 w-12 overflow-hidden rounded-md border shadow-sm transition-transform hover:scale-110',
                          i === activeIndex ? 'ring-2 ring-primary ring-offset-2' : 'border-border',
                        )}
                      >
                        {v.product.image_url ? (
                          <Image src={v.product.image_url} alt={v.label} fill className="object-cover" sizes="48px" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-muted text-xs">
                            {v.label}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        key={v.product.id}
                        type="button"
                        onClick={() => onSelectVariant(i)}
                        aria-label={`Select ${v.label}`}
                        aria-pressed={i === activeIndex}
                        className={cn(
                          'relative h-8 w-8 rounded-full border shadow-sm transition-transform hover:scale-110',
                          i === activeIndex ? 'ring-2 ring-primary ring-offset-2' : 'border-border',
                        )}
                        style={{ backgroundColor: v.swatch }}
                      >
                        {i === activeIndex && (
                          <Check
                            className={cn(
                              'absolute inset-0 m-auto h-4 w-4',
                              v.colorKey === 'white' || v.colorKey === 'cream' || v.colorKey === 'ivory'
                                ? 'text-black'
                                : 'text-white',
                            )}
                          />
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-medium">Qty</span>
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {!isOutOfStock ? (
                <span className="text-sm text-muted-foreground">
                  {active.stock_quantity <= 10 ? `Only ${active.stock_quantity} left` : 'In stock'}
                </span>
              ) : (
                <span className="text-sm text-destructive">Out of stock</span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={addActive} disabled={isOutOfStock} className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button onClick={handleBuyNow} disabled={isOutOfStock} variant="secondary" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Buy Now
                </Button>
              </div>
              <Button
                asChild
                variant="outline"
                className="gap-2 border-[#25D366]/40 text-[#075E54] hover:bg-[#25D366]/10 hover:text-[#075E54]"
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
              <Button asChild variant="link" className="h-auto justify-start p-0 text-sm">
                <Link href={`/products/${active.slug}`} onClick={() => onOpenChange(false)}>
                  View full details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
