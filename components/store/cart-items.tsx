'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'

export function CartItems() {
  const { items, isLoading, updateQuantity, removeItem, clearCart } = useCart()

  if (isLoading) {
    return <CartItemsSkeleton />
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground mt-2">Add some products to get started</p>
          <Button asChild className="mt-6">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </p>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      {/* Items */}
      <Card>
        <CardContent className="divide-y p-0">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4">
              {/* Image */}
              <div className="relative h-24 w-24 rounded-lg bg-muted overflow-hidden shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/products/${item.productId}`} 
                  className="font-medium hover:text-primary transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                {item.sku && (
                  <p className="text-xs text-muted-foreground mt-1">SKU: {item.sku}</p>
                )}
                <p className="font-semibold mt-2">{formatPrice(item.price)}</p>

                {/* Quantity controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="w-10 h-8 flex items-center justify-center text-sm font-medium border-x">
                      {item.quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Continue shopping */}
      <Button variant="outline" asChild className="w-full">
        <Link href="/shop">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>
      </Button>
    </div>
  )
}

function CartItemsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <Card>
        <CardContent className="divide-y p-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
