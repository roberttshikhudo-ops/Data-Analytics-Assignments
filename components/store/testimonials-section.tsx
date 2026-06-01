'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  name: string
  role: string
  location: string
  image?: string
  rating: number
  text: string
  productCategory?: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Thabo Mokoena',
    role: 'Commercial Farmer',
    location: 'Limpopo Province',
    rating: 5,
    text: 'Agri Hub SA has transformed our farming operation. The quality of seeds and fertilizers is exceptional, and their delivery is always on time. Our maize yield increased by 40% this season!',
    productCategory: 'Seeds & Fertilizers',
  },
  {
    id: '2',
    name: 'Sarah van der Berg',
    role: 'Homestead Owner',
    location: 'Mpumalanga',
    rating: 5,
    text: 'As a small-scale farmer, finding quality products at affordable prices was always a challenge. Agri Hub changed that for me. Their customer service is incredible and the products are top-notch.',
    productCategory: 'Garden & Tools',
  },
  {
    id: '3',
    name: 'Emmanuel Ndlovu',
    role: 'Livestock Farmer',
    location: 'Free State',
    rating: 5,
    text: 'The animal health products from Agri Hub have made a significant difference in our herd health. The expert advice from their team helped us choose the right supplements for our cattle.',
    productCategory: 'Animal Health',
  },
  {
    id: '4',
    name: 'Linda Mashaba',
    role: 'Greenhouse Operator',
    location: 'Gauteng',
    rating: 5,
    text: 'I have been sourcing my irrigation equipment from Agri Hub for 3 years now. Reliable products, competitive prices, and they always have stock. Highly recommend!',
    productCategory: 'Irrigation & Plumbing',
  },
  {
    id: '5',
    name: 'Johan Pretorius',
    role: 'Construction Contractor',
    location: 'North West',
    rating: 5,
    text: 'The hardware and PPE products are exactly what we need on site. Quality is consistent and their bulk pricing has saved our company thousands of rands.',
    productCategory: 'Hardware & PPE',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary font-semibold mb-2 tracking-wide uppercase text-sm">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of satisfied farmers, contractors, and businesses who trust Agri Hub SA for their agricultural and hardware needs.
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="relative max-w-4xl mx-auto">
          <Card className="bg-card border-0 shadow-xl">
            <CardContent className="p-8 md:p-12">
              {/* Quote Icon */}
              <div className="absolute -top-6 left-8 md:left-12">
                <div className="bg-primary rounded-full p-3">
                  <Quote className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="pt-4">
                <p className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-8">
                  &ldquo;{testimonials[currentIndex].text}&rdquo;
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {testimonials[currentIndex].image ? (
                        <Image
                          src={testimonials[currentIndex].image}
                          alt={testimonials[currentIndex].name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-primary">
                          {testimonials[currentIndex].name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Name & Info */}
                    <div>
                      <p className="font-semibold text-lg">{testimonials[currentIndex].name}</p>
                      <p className="text-muted-foreground text-sm">
                        {testimonials[currentIndex].role} - {testimonials[currentIndex].location}
                      </p>
                      <StarRating rating={testimonials[currentIndex].rating} />
                    </div>
                  </div>

                  {/* Product Category Badge */}
                  {testimonials[currentIndex].productCategory && (
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                      {testimonials[currentIndex].productCategory}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-12 w-12 rounded-full shadow-lg bg-background hidden md:flex"
            onClick={goToPrevious}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-12 w-12 rounded-full shadow-lg bg-background hidden md:flex"
            onClick={goToNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary">5,000+</p>
            <p className="text-muted-foreground mt-1">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary">15+</p>
            <p className="text-muted-foreground mt-1">Years Experience</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary">98%</p>
            <p className="text-muted-foreground mt-1">Satisfaction Rate</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary">10,000+</p>
            <p className="text-muted-foreground mt-1">Products Delivered</p>
          </div>
        </div>
      </div>
    </section>
  )
}
