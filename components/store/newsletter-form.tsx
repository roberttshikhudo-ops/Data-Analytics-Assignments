'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function NewsletterForm({ source = 'footer' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSubscribed(true)
      toast.success(
        data.alreadySubscribed
          ? "You're already subscribed! Use code WELCOME10 at checkout."
          : 'Welcome to Agri Hub SA! Use code WELCOME10 for 10% off your first order.'
      )
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (subscribed) {
    return (
      <div className="flex w-full max-w-md items-center gap-3 rounded-lg bg-primary/15 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Check className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm text-secondary-foreground">
          You&apos;re in! Use code <span className="font-mono font-bold text-primary">WELCOME10</span> for 10% off your first order.
        </p>
      </div>
    )
  }

  return (
    <form className="flex w-full max-w-md gap-2" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
        className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
      />
      <Button
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  )
}
