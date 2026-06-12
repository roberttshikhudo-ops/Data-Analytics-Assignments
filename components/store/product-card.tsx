'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { isInWishlist, isLoading: wishlistLoading, toggleWishlist } = useWishlist(product.id)
  const discount = calculateDiscount(product.price, product.compare_at_price)
  const isOutOfStock = product.stock_quantity <= 0
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) return
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      sku: product.sku,
      stock: product.stock_quantity,
    })
  }

  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
      <Link href={`/products/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-primary/5 to-accent/5">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && (
              <Badge variant="destructive" className="text-xs">
                -{discount}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-primary text-xs">Featured</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning text-xs">
                Low Stock
              </Badge>
            )}
            {product.availability === "online_only" && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300 text-xs">
                Online Only
              </Badge>
            )}
            {product.availability === "in_store_only" && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300 text-xs">
                In-Store Only
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-sm text-muted-foreground mb-1">
              {product.category.name}
            </p>
          )}
          
          {/* Name */}
          <h3 className="font-medium text-base leading-snug line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-bold text-xl">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {!isOutOfStock && (
            <p className={`text-sm mt-1 ${isLowStock ? 'text-warning-foreground' : 'text-muted-foreground'}`}>
              {isLowStock ? `Only ${product.stock_quantity} left` : 'In Stock'}
            </p>
          )}
        </CardContent>
      </Link>

      {/* Add to cart button */}
      <div className="px-4 pb-4">
        <Button
          className="w-full"
          variant={isOutOfStock ? 'secondary' : 'default'}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </Card>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-24" />
      </CardContent>
      <div className="px-4 pb-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  )
}
