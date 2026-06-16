'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Clock, Shield, Truck, Phone, MessageCircle, Star, Gift, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CampaignLandingPageProps {
  // Hero Section
  badge?: string
  headline: string
  highlightedText: string
  subheadline: string
  discount?: string
  promoCode?: string
  endDate?: string
  heroImage?: string
  primaryCTA: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }

  // Benefits
  benefits?: {
    icon: LucideIcon
    title: string
    description: string
  }[]

  // Testimonial
  testimonial?: {
    quote: string
    author: string
    role: string
    rating?: number
  }

  // Styling
  gradientFrom?: string
  gradientTo?: string
}

export function CampaignLandingPage({
  badge = 'Limited Time Offer',
  headline,
  highlightedText,
  subheadline,
  discount,
  promoCode,
  endDate,
  heroImage,
  primaryCTA,
  secondaryCTA,
  benefits,
  testimonial,
  gradientFrom = 'from-primary',
  gradientTo = 'to-emerald-700',
}: CampaignLandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className={cn(
        'relative bg-gradient-to-br text-white overflow-hidden',
        gradientFrom,
        'via-emerald-600',
        gradientTo
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container relative py-16 md:py-24">
          <div className={cn(
            'grid gap-12 items-center',
            heroImage ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto text-center'
          )}>
            {/* Left: Offer Details */}
            <div className={cn(heroImage ? 'text-center lg:text-left' : '')}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Gift className="h-4 w-4" />
                {badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {headline}
                <span className="block text-yellow-300">{highlightedText}</span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
                {subheadline}
              </p>

              {/* Promo Code */}
              {(promoCode || endDate) && (
                <div className="inline-flex flex-col sm:flex-row items-center gap-4 mb-8">
                  {promoCode && (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4">
                      <p className="text-sm text-white/70 mb-1">Use code at checkout:</p>
                      <p className="text-3xl font-mono font-bold tracking-wider">{promoCode}</p>
                    </div>
                  )}
                  {endDate && (
                    <div className="text-sm text-white/80">
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {endDate}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className={cn(
                'flex flex-col sm:flex-row gap-4',
                heroImage ? 'justify-center lg:justify-start' : 'justify-center'
              )}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg font-semibold" asChild>
                  <Link href={primaryCTA.href}>
                    {primaryCTA.text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                {secondaryCTA && (
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg" asChild>
                    <Link href={secondaryCTA.href}>
                      {secondaryCTA.text}
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Featured Product/Image */}
            {heroImage && (
              <div className="relative">
                <div className="relative aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl" />
                  <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <Image
                      src={heroImage}
                      alt="Featured Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Discount Badge */}
                  {discount && (
                    <div className="absolute -top-4 -right-4 bg-yellow-400 text-primary-foreground rounded-full h-24 w-24 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold">{discount}</span>
                      <span className="text-sm font-semibold">OFF</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b bg-card py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <span>Free Delivery over R1,000</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm">
              <Star className="h-5 w-5 text-yellow-500 shrink-0" />
              <span>5,000+ Happy Farmers</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm">
              <Check className="h-5 w-5 text-primary shrink-0" />
              <span>15+ Years Experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {benefits && benefits.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Agri Hub SA is your trusted partner for all agricultural needs.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-8 pb-6">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof - Testimonial */}
      {testimonial && (
        <section className="py-16">
          <div className="container max-w-4xl">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 md:p-12 text-center">
                {testimonial.rating && (
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-6 w-6',
                          star <= testimonial.rating! ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'
                        )}
                      />
                    ))}
                  </div>
                )}
                <blockquote className="text-xl md:text-2xl font-medium mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Urgency & Final CTA */}
      <section className={cn(
        'py-16 bg-gradient-to-r text-white',
        gradientFrom,
        gradientTo
      )}>
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Don&apos;t Miss Out!</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            This offer won&apos;t last forever. Take advantage now before it&apos;s too late.
          </p>

          <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-10 text-lg font-semibold" asChild>
            <Link href={primaryCTA.href}>
              {primaryCTA.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          {promoCode && (
            <p className="text-sm text-white/70 mt-4">
              Use code <span className="font-mono font-bold text-white">{promoCode}</span> at checkout
            </p>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-card border-t">
        <div className="container">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Need Help? Talk to Our Experts</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <a href="tel:+27791099490">
                  <Phone className="h-5 w-5" />
                  079 109 9490
                </a>
              </Button>
              <Button size="lg" className="bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2" asChild>
                <Link href="https://wa.me/27833061529" target="_blank">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
