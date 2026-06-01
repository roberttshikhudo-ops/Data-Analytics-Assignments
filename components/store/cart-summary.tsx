'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Truck, Tag, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_RATES } from '@/lib/types'

export function CartSummary() {
  const { items, subtotal } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)

  const standardShipping = SHIPPING_RATES.standard
  const isFreeShipping = subtotal >= standardShipping.freeThreshold
  const shippingCost = isFreeShipping ? 0 : standardShipping.price
  const total = subtotal + shippingCost - couponDiscount

  const handleApplyCoupon = () => {
    // TODO: Validate coupon via API
    // For now, just show it's applied
    if (couponCode.trim()) {
      setCouponApplied(true)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          {isFreeShipping ? (
            <span className="text-success-foreground font-medium">FREE</span>
          ) : (
            <span>{formatPrice(shippingCost)}</span>
          )}
        </div>

        {/* Coupon discount */}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm text-success-foreground">
            <span>Coupon Discount</span>
            <span>-{formatPrice(couponDiscount)}</span>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        {/* Free shipping progress */}
        {!isFreeShipping && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>
                Add {formatPrice(standardShipping.freeThreshold - subtotal)} more for free shipping!
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min((subtotal / standardShipping.freeThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Coupon code */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" />
            Have a coupon code?
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="uppercase"
            />
            <Button 
              variant="outline" 
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || couponApplied}
            >
              Apply
            </Button>
          </div>
          {couponApplied && (
            <p className="text-xs text-success-foreground">Coupon applied!</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">
            Proceed to Checkout
          </Link>
        </Button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-3 w-3" />
            <span>Fast delivery</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
