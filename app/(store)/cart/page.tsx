import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItems } from '@/components/store/cart-items'
import { CartSummary } from '@/components/store/cart-summary'

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review items in your shopping cart',
}

export default function CartPage() {
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/shop">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review your items before checkout
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <CartItems />
        </div>

        {/* Order summary */}
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
