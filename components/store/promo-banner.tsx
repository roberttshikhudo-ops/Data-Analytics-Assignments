'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Tag, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Promotion {
  id: string
  title: string
  description: string
  code?: string
  link?: string
  linkText?: string
  endDate?: Date
  backgroundColor?: string
  textColor?: string
  type: 'banner' | 'announcement' | 'sale'
}

// You can update this array to manage promotions
// In production, this could come from a CMS or database
const activePromotions: Promotion[] = [
  {
    id: 'winter-sale-2024',
    title: 'Winter Sale',
    description: 'Get 15% off all seeds and fertilizers',
    code: 'WINTER15',
    link: '/shop/seeds',
    linkText: 'Shop Now',
    endDate: new Date('2024-08-31'),
    type: 'sale',
  },
]

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <Clock className="h-3 w-3 mr-1" />
      <span>{timeLeft.days}d</span>
      <span>:</span>
      <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
      <span>:</span>
      <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
      <span>:</span>
      <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
    </div>
  )
}

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentPromo, setCurrentPromo] = useState<Promotion | null>(null)

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem('promo-banner-dismissed')
    if (dismissed) {
      setIsVisible(false)
      return
    }

    // Find an active promotion
    const now = new Date()
    const active = activePromotions.find(
      (promo) => !promo.endDate || promo.endDate > now
    )
    setCurrentPromo(active || null)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('promo-banner-dismissed', 'true')
  }

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
  }

  if (!isVisible || !currentPromo) return null

  return (
    <div
      className={cn(
        'relative bg-gradient-to-r from-primary via-emerald-600 to-primary text-primary-foreground',
        'py-2.5 px-4'
      )}
    >
      <div className="container">
        <div className="flex items-center justify-center gap-4 text-sm">
          {/* Icon */}
          <Tag className="h-4 w-4 shrink-0 hidden sm:block" />

          {/* Content */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="font-semibold">{currentPromo.title}:</span>
            <span>{currentPromo.description}</span>

            {/* Promo Code */}
            {currentPromo.code && (
              <button
                onClick={() => copyCode(currentPromo.code!)}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-md font-mono font-bold transition-colors"
                title="Click to copy"
              >
                {currentPromo.code}
              </button>
            )}

            {/* Countdown Timer */}
            {currentPromo.endDate && (
              <div className="hidden md:flex items-center border-l border-white/30 pl-3 ml-1">
                <CountdownTimer endDate={currentPromo.endDate} />
              </div>
            )}

            {/* CTA Link */}
            {currentPromo.link && (
              <Link
                href={currentPromo.link}
                className="inline-flex items-center gap-1 font-semibold hover:underline underline-offset-2"
              >
                {currentPromo.linkText || 'Learn More'}
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Alternative: Sticky Sale Banner for special campaigns
export function SaleBanner({ 
  title = "Flash Sale",
  discount = "20%",
  description = "On selected items",
  link = "/shop",
  endDate,
}: {
  title?: string
  discount?: string
  description?: string
  link?: string
  endDate?: Date
}) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-3">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black">{discount}</span>
            <span className="text-lg font-bold">OFF</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div>
              <span className="font-semibold">{title}</span>
              <span className="mx-2">-</span>
              <span>{description}</span>
            </div>
            
            {endDate && (
              <div className="bg-black/20 px-3 py-1 rounded-full">
                <CountdownTimer endDate={endDate} />
              </div>
            )}
            
            <Link href={link}>
              <Button 
                size="sm" 
                className="bg-white text-red-600 hover:bg-white/90 font-semibold"
              >
                Shop Sale
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 h-6 w-6 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
