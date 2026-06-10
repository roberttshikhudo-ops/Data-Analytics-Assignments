"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Play, Truck, ShieldCheck, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const heroSlides = [
  {
    title: "Agricultural",
    subtitle: "Seeds, Feeds & Farming Essentials",
    image: "/images/hero/hero-agriculture.png",
  },
  {
    title: "Hardware",
    subtitle: "Tools & Equipment for Every Job",
    image: "/images/hero/hero-hardware.png",
  },
  {
    title: "Lifestyle",
    subtitle: "Home, Kitchen & Personal Care",
    image: "/images/hero/hero-lifestyle.png",
  },
]

const stats = [
  { value: "1000+", label: "Products" },
  { value: "9", label: "Provinces" },
  { value: "24/7", label: "Support" },
  { value: "Free", label: "Delivery*" },
]

export function HeroVideo({ seedImages = [] }: { seedImages?: string[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Positions for floating seed images across the hero background
  const floatPositions = [
    { top: "12%", left: "6%", size: "h-24 w-24 md:h-32 md:w-32", anim: "animate-float", delay: "0s" },
    { top: "55%", left: "12%", size: "h-20 w-20 md:h-28 md:w-28", anim: "animate-float-delayed", delay: "0.4s" },
    { top: "20%", right: "8%", size: "h-28 w-28 md:h-40 md:w-40", anim: "animate-float-delayed", delay: "0.8s" },
    { top: "62%", right: "14%", size: "h-24 w-24 md:h-32 md:w-32", anim: "animate-float", delay: "1.2s" },
    { top: "38%", right: "4%", size: "h-16 w-16 md:h-24 md:w-24", anim: "animate-float", delay: "1.6s" },
    { top: "78%", left: "40%", size: "h-16 w-16 md:h-24 md:w-24", anim: "animate-float-delayed", delay: "2s" },
  ]

  // Repeat seed images so we always fill the available float positions
  const floatingSeeds =
    seedImages.length > 0
      ? floatPositions.map((pos, i) => ({ ...pos, image: seedImages[i % seedImages.length] }))
      : []

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-secondary">
      {/* Animated Background Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            currentSlide === index ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 animate-slow-zoom"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/60" />
        </div>
      ))}

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-secondary/50" />

      {/* Floating Seed Products Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingSeeds.length > 0 ? (
          floatingSeeds.map((seed, index) => (
            <div
              key={index}
              className={cn("absolute rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10", seed.size, seed.anim)}
              style={{
                top: seed.top,
                left: seed.left,
                right: seed.right,
                animationDelay: seed.delay,
              }}
            >
              <img
                src={seed.image || "/placeholder.svg"}
                alt="Seeds we stock"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
          ))
        ) : (
          <>
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-pulse" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-4xl">
          {/* Category Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground mb-6 transition-all duration-500",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <Play className="h-4 w-4 fill-current" />
            {heroSlides[currentSlide].subtitle}
          </div>

          {/* Main Headline */}
          <h1
            className={cn(
              "text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 transition-all duration-700 delay-100",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Your{" "}
            <span className="text-primary">
              {heroSlides[currentSlide].title}
            </span>
            <br />
            Innovation Partner
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              "text-xl md:text-2xl text-white/80 max-w-2xl mb-8 leading-relaxed transition-all duration-700 delay-200",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Powering South Africa&apos;s farms, homes, and businesses with seamless 
            digital ordering and nationwide delivery.
          </p>

          {/* CTA Buttons */}
          <div
            className={cn(
              "flex flex-wrap gap-4 mb-12 transition-all duration-700 delay-300",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90" asChild>
              <Link href="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
              asChild
            >
              <Link href="/contact">Get Expert Advice</Link>
            </Button>
          </div>

          {/* Stats Bar */}
          <div
            className={cn(
              "grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/20 transition-all duration-700 delay-400",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              currentSlide === index
                ? "w-12 bg-primary"
                : "w-2 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Quick Features */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary to-transparent pt-16 pb-24">
        <div className="container">
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 text-white/80">
              <Truck className="h-6 w-6 text-primary shrink-0" />
              <span className="text-sm hidden md:block">Free Delivery Over R1,500</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
              <span className="text-sm hidden md:block">Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <Headphones className="h-6 w-6 text-primary shrink-0" />
              <span className="text-sm hidden md:block">Expert Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
