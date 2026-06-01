'use client'

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

interface ProductGalleryProps {
  product: Product
}

export function ProductGallery({ product }: ProductGalleryProps) {
  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-primary/5 to-accent/5">
            <ShoppingCart className="h-24 w-24" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.compare_at_price && product.compare_at_price > product.price && (
            <Badge variant="destructive">
              -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
            </Badge>
          )}
          {product.is_featured && <Badge className="bg-primary">Featured</Badge>}
          {product.stock_quantity <= 0 && (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>
      </div>
    </div>
  )
}
