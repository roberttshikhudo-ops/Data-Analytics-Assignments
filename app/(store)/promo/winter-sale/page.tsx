import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Clock, Shield, Truck, Phone, MessageCircle, Star, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Winter Sale - 15% Off Seeds & Fertilizers',
  description: 'Get 15% off all seeds and fertilizers this winter. Limited time offer. Use code WINTER15 at checkout. Free delivery on orders over R1,500.',
}

// This is a template landing page for ad campaigns
// Duplicate and customize for each campaign
// Key elements: Hero with offer, Benefits, Social proof, CTA, Urgency

export default function WinterSaleLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Strong Value Proposition */}
      <section className="relative bg-gradient-to-br from-primary via-emerald-600 to-emerald-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container relative py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Offer Details */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Gift className="h-4 w-4" />
                Limited Time Offer
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Winter Sale
                <span className="block text-yellow-300">15% OFF</span>
                Seeds & Fertilizers
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
                Prepare for the planting season with premium quality seeds and fertilizers at unbeatable prices. Stock up now and watch your harvest flourish!
              </p>

              {/* Promo Code */}
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4">
                  <p className="text-sm text-white/70 mb-1">Use code at checkout:</p>
                  <p className="text-3xl font-mono font-bold tracking-wider">WINTER15</p>
                </div>
                <div className="text-sm text-white/80">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Offer ends 31 August 2024
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg font-semibold" asChild>
                  <Link href="/shop/seeds">
                    Shop Seeds
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg" asChild>
                  <Link href="/shop/fertilizers">
                    Shop Fertilizers
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Featured Product/Image */}
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl" />
                <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/categories/seeds.jpg"
                    alt="Premium Seeds Collection"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Discount Badge */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-primary-foreground rounded-full h-24 w-24 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold">15%</span>
                  <span className="text-sm font-semibold">OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b bg-card py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <span>Free Delivery over R1,500</span>
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
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Why Shop With Us?</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Agri Hub SA is your trusted partner for all agricultural needs. Here&apos;s why farmers across South Africa choose us.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-muted-foreground">
                  All our seeds and fertilizers are sourced from certified suppliers and tested for optimal germination and growth rates.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Get your orders delivered within 5-7 business days. Free shipping on all orders above R1,500.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                <p className="text-muted-foreground">
                  Our agricultural experts are available to help you choose the right products for your specific farming needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonial */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-medium mb-6">
                &ldquo;The seeds I bought from Agri Hub during their last sale gave me the best maize harvest in 10 years. The quality is exceptional and the prices are unbeatable!&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold">Thabo Mokoena</p>
                <p className="text-sm text-muted-foreground">Commercial Farmer, Limpopo</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Urgency & Final CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-emerald-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Don&apos;t Miss Out!</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            This offer is only available until 31 August 2024. Stock up on premium seeds and fertilizers before prices go back up.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-10 text-lg font-semibold" asChild>
              <Link href="/shop/seeds">
                Shop Seeds Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-10 text-lg font-semibold" asChild>
              <Link href="/shop/fertilizers">
                Shop Fertilizers Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-white/70">
            Use code <span className="font-mono font-bold text-white">WINTER15</span> at checkout
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-card border-t">
        <div className="container">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Need Help? Talk to Our Experts</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <Link href="tel:+27791099490">
                  <Phone className="h-5 w-5" />
                  079 109 9490
                </Link>
              </Button>
              <Button size="lg" className="bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2" asChild>
                <Link href="https://wa.me/27833061529?text=Hi!%20I%27m%20interested%20in%20the%20Winter%20Sale." target="_blank">
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
