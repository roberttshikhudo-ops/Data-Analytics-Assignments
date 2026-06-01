'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const { 
    items, 
    itemCount, 
    subtotal, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeItem 
  } = useCart()

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add some products to get started
              </p>
            </div>
            <Button asChild onClick={closeCart}>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight line-clamp-2">
                        {item.name}
                      </h4>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          SKU: {item.sku}
                        </p>
                      )}
                      <p className="font-semibold text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Button asChild size="lg" onClick={closeCart}>
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild onClick={closeCart}>
                  <Link href="/cart">
                    View Full Cart
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Free delivery on orders over R1,500
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
