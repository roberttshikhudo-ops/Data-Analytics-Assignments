'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { createStripeCheckoutSession, confirmStripePayment } from '@/app/actions/stripe'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutData {
  email: string
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    addressLine1: string
    addressLine2?: string
    city: string
    province: string
    postalCode: string
    phone?: string
  }
  billingAddress?: {
    firstName: string
    lastName: string
    company?: string
    addressLine1: string
    addressLine2?: string
    city: string
    province: string
    postalCode: string
    phone?: string
  }
  couponCode?: string
  notes?: string
}

interface StripeCheckoutProps {
  checkoutData: CheckoutData
  onSuccess: (orderNumber: string) => void
  onError: (error: string) => void
}

export function StripeCheckout({ checkoutData, onSuccess, onError }: StripeCheckoutProps) {
  const { items: cart, clearCart, isLoading: cartLoading } = useCart()
  const router = useRouter()
  const [sessionData, setSessionData] = useState<{
    clientSecret: string
    orderId: string
    orderNumber: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const initializeCheckout = useCallback(async () => {
    if (sessionData?.clientSecret) {
      return sessionData.clientSecret
    }

    setIsLoading(true)
    try {
      const result = await createStripeCheckoutSession({
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        ...checkoutData,
      })

      setSessionData(result)
      return result.clientSecret
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize checkout'
      onError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [cart, checkoutData, sessionData, onError])

  const handleComplete = useCallback(async () => {
    if (!sessionData) return

    setIsComplete(true)
    try {
      const result = await confirmStripePayment(sessionData.clientSecret!)
      if (result.success) {
        clearCart()
        onSuccess(sessionData.orderNumber)
        router.push(`/checkout/success?order=${sessionData.orderNumber}`)
      }
    } catch (error) {
      console.error('Payment confirmation error:', error)
    }
  }, [sessionData, clearCart, onSuccess, router])

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-semibold">Payment Successful!</h3>
        <p className="text-muted-foreground">Redirecting to order confirmation...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button onClick={() => router.push('/shop')} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div id="stripe-checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret: initializeCheckout,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
