'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Heart, Truck, Shield, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SocialShare } from '@/components/store/social-share'
import { useCart } from '@/hooks/use-cart'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  
  const discount = calculateDiscount(product.price, product.compare_at_price)
  const isOutOfStock = product.stock_quantity <= 0
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10

  const handleAddToCart = async () => {
    if (isOutOfStock) return
    
    await addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      sku: product.sku,
      stock: product.stock_quantity,
    }, quantity)
    
    toast.success(`${product.name} added to cart`, {
      description: `Quantity: ${quantity}`,
    })
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="space-y-6">
      {/* Category */}
      <div className="flex items-center gap-2 text-sm">
        {product.category && (
          <Link 
            href={`/shop/${product.category.slug}`}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>
        )}
      </div>

      {/* Name */}
      <h1 className="text-2xl md:text-3xl font-bold text-balance">{product.name}</h1>

      {/* SKU */}
      {product.sku && (
        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
        {product.compare_at_price && (
          <span className="text-xl text-muted-foreground line-through">
            {formatPrice(product.compare_at_price)}
          </span>
        )}
        {discount && (
          <Badge variant="destructive">Save {discount}%</Badge>
        )}
      </div>

      {/* Short description */}
      {product.short_description && (
        <p className="text-muted-foreground">{product.short_description}</p>
      )}

      <Separator />

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
        ) : isLowStock ? (
          <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning text-sm">
            Only {product.stock_quantity} left in stock
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-success/10 text-success-foreground border-success text-sm">
            In Stock ({product.stock_quantity} available)
          </Badge>
        )}
      </div>

      {/* Quantity & Add to cart */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Quantity selector */}
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-r-none"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isOutOfStock}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="w-16 h-12 flex items-center justify-center font-medium border-x">
            {quantity}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-l-none"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= product.stock_quantity || isOutOfStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to cart button */}
        <Button
          size="lg"
          className="flex-1 h-12"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="gap-2">
          <Heart className="h-4 w-4" />
          Add to Wishlist
        </Button>
      </div>

      {/* Social Share */}
      <div className="pt-2">
        <SocialShare 
          title={product.name} 
          description={product.short_description || undefined}
          imageUrl={product.image_url || undefined}
        />
      </div>

      <Separator />

      {/* Trust badges */}
      <div className="grid gap-4">
        <div className="flex items-center gap-3 text-sm">
          <Truck className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-medium">Free delivery on orders over R1,500</p>
            <p className="text-muted-foreground">Standard delivery: 5-7 business days</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-medium">Quality Guarantee</p>
            <p className="text-muted-foreground">100% genuine products</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <RotateCcw className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-medium">Easy Returns</p>
            <p className="text-muted-foreground">30-day return policy</p>
          </div>
        </div>
      </div>
    </div>
  )
}
