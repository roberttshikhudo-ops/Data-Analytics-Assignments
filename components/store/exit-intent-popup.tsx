'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, Gift, Mail, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STORAGE_KEY = 'exit-intent-shown'
const COOLDOWN_DAYS = 7 // Don't show again for 7 days after dismissing

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const shouldShowPopup = useCallback(() => {
    if (typeof window === 'undefined') return false

    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (lastShown) {
      const lastShownDate = new Date(lastShown)
      const daysSinceShown = (Date.now() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceShown < COOLDOWN_DAYS) {
        return false
      }
    }

    // Don't show if user is already subscribed
    const subscribed = localStorage.getItem('newsletter-subscribed')
    if (subscribed) return false

    return true
  }, [])

  const markAsShown = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
  }, [])

  useEffect(() => {
    if (!shouldShowPopup()) return

    let hasTriggered = false

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves towards the top of the page
      if (e.clientY <= 0 && !hasTriggered) {
        hasTriggered = true
        setIsOpen(true)
        markAsShown()
      }
    }

    // Add a delay before activating exit intent
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
    }, 5000) // Wait 5 seconds before activating

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [shouldShowPopup, markAsShown])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual newsletter signup
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mark as subscribed
      localStorage.setItem('newsletter-subscribed', 'true')
      setIsSubscribed(true)

      toast.success('Welcome! Check your email for your discount code.')

      // Close after showing success
      setTimeout(() => {
        setIsOpen(false)
      }, 3000)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        {/* Header Banner */}
        <div className="relative h-32 bg-gradient-to-br from-primary to-emerald-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Gift className="h-12 w-12 mx-auto mb-2 animate-bounce" />
              <p className="font-bold text-xl">Wait! Don&apos;t Leave Yet!</p>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {!isSubscribed ? (
            <>
              <DialogHeader className="text-center mb-4">
                <DialogTitle className="text-2xl font-bold">
                  Get 10% Off Your First Order
                </DialogTitle>
                <p className="text-muted-foreground mt-2">
                  Subscribe to our newsletter and receive an exclusive discount code, plus early access to sales and new products.
                </p>
              </DialogHeader>

              {/* Benefits */}
              <div className="space-y-2 mb-6">
                {[
                  'Exclusive discounts and offers',
                  'Early access to sales',
                  'Farming tips and guides',
                  'New product announcements',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Subscribing...'
                  ) : (
                    <>
                      Get My 10% Discount
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
              </p>

              <button
                onClick={handleClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground mt-3 py-2"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">You&apos;re All Set!</h3>
              <p className="text-muted-foreground mb-4">
                Check your email for your exclusive 10% discount code. Use it at checkout on your first order.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your discount code:</p>
                <p className="text-2xl font-mono font-bold text-primary">WELCOME10</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
