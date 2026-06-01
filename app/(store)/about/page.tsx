import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Store, Users, Truck, Target, MapPin, Phone, Mail, Clock, 
  Factory, Lightbulb, Handshake, Award, TrendingUp, Heart,
  CheckCircle2, ArrowRight, Quote
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'About Us | Agri Hub SA',
  description: 'Learn about Agri Hub SA (Pty) Ltd - A South African enterprise enabling rural and urban economic participation through agriculture, lifestyle, hardware, and light industrial products.',
}

const businessPillars = [
  {
    icon: Store,
    title: 'Retail & Distribution',
    description: 'Physical retail outlets supplying agricultural tools, hardware supplies, lifestyle essentials, and PPE products to urban and rural communities.',
    image: '/images/about/store-interior.jpg',
  },
  {
    icon: Factory,
    title: 'Manufacturing & Localisation',
    description: 'Developing local manufacturing capabilities including light manufacturing, product assembly, and strategic supplier partnerships.',
    image: '/images/about/manufacturing.jpg',
  },
  {
    icon: Lightbulb,
    title: 'Consulting & Enablement',
    description: 'Advisory services for suppliers, manufacturers, and developers including market validation, pricing strategy, and commercialisation planning.',
    image: '/images/about/community-impact.jpg',
  },
]

const values = [
  {
    icon: Target,
    title: 'Market Proximity',
    description: 'Deep rural reach and trusted local presence in communities that need us most.',
  },
  {
    icon: Truck,
    title: 'Distribution Excellence',
    description: 'Retail, last-mile delivery, and comprehensive supplier onboarding services.',
  },
  {
    icon: Factory,
    title: 'Localisation Focus',
    description: 'Committed to value addition and manufacturing for South African products.',
  },
  {
    icon: Handshake,
    title: 'Partnership Driven',
    description: 'Product validation, growth strategy, and collaborative consulting capabilities.',
  },
]

const stats = [
  { label: 'Store Locations', value: '2', suffix: '' },
  { label: 'Floor Space', value: '250', suffix: 'm²' },
  { label: 'Years Experience', value: '23', suffix: '+' },
  { label: 'Product Categories', value: '6', suffix: '+' },
]

const targetMarkets = [
  { name: 'Urban & Rural Households', icon: Users },
  { name: 'Small-scale Farmers', icon: TrendingUp },
  { name: 'Commercial Farmers', icon: Target },
  { name: 'Builders & Contractors', icon: Factory },
  { name: 'Schools & Community Projects', icon: Heart },
  { name: 'SMEs & Cooperatives', icon: Handshake },
]

const partnershipBenefits = [
  'Product distribution and sales channel support',
  'Retail shelf space and strategic product promotion',
  'Market feedback and customer insights',
  'Long-term scale strategy and demand generation',
  'Access to rural and underserved markets',
  'Local manufacturing partnership opportunities',
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Full Width Visual Impact */}
      <section className="relative min-h-[70vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about/hero-farming.jpg"
            alt="South African agricultural landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60" />
        </div>
        
        {/* Content */}
        <div className="container relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground mb-6">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Empowering South African Communities</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-tight">
              Enabling Rural &amp; Urban Economic Participation
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 text-pretty max-w-2xl leading-relaxed">
              Agri Hub SA is a proudly South African enterprise connecting communities with essential 
              agricultural, hardware, and lifestyle products while driving localisation and sustainable 
              economic growth.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base px-8">
                <Link href="/shop">
                  Explore Our Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link href="/contact">Partner With Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Floating Cards Effect */}
      <section className="relative z-10 -mt-16 pb-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card shadow-lg border-0">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {stat.value}<span className="text-2xl">{stat.suffix}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Story</h2>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
                From Vision to Impact: Building Bridges to Prosperity
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Agri Hub SA (Pty) Ltd, trading as Agri Hub SA, emerged from a deep understanding 
                  of the challenges facing rural and peri-urban communities in accessing quality 
                  agricultural inputs, hardware, and essential supplies.
                </p>
                <p>
                  Founded with a vision to democratise access to economic opportunities, we have 
                  established ourselves as a trusted partner for households, farmers, builders, 
                  and businesses across Limpopo and Gauteng provinces.
                </p>
                <p>
                  Today, we operate two strategically located stores in Vhembe District, serving 
                  as vital supply points for communities often overlooked by mainstream retail.
                </p>
              </div>
              
              {/* Quote Block */}
              <div className="mt-8 p-6 bg-primary/5 rounded-xl border-l-4 border-primary">
                <Quote className="h-8 w-8 text-primary/40 mb-3" />
                <p className="text-lg font-medium text-foreground italic">
                  &ldquo;Our mission is simple: bring world-class products and opportunities to every 
                  corner of South Africa, empowering communities to build, grow, and thrive.&rdquo;
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  &mdash; Dr. Robert T. Tshikhudo, Managing Director
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/about/community-impact.jpg"
                  alt="Community impact and empowerment"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-xl hidden md:block">
                <p className="text-3xl font-bold">23+</p>
                <p className="text-sm opacity-90">Years of Leadership</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission - Side by Side Cards */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Purpose Driven</h2>
            <h3 className="text-3xl md:text-4xl font-bold">Our Vision &amp; Mission</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-secondary text-secondary-foreground border-0 overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-2xl font-bold">Our Vision</h4>
                </div>
                <p className="text-secondary-foreground/90 leading-relaxed text-lg">
                  To become the leading commercial and manufacturing enablement platform in South Africa, 
                  supporting localisation, supply chain inclusion, and sustainable market access for 
                  South African-made products.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary text-primary-foreground border-0 overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h4 className="text-2xl font-bold">Our Mission</h4>
                </div>
                <p className="text-primary-foreground/90 leading-relaxed text-lg">
                  To connect suppliers and manufacturers to real market demand by providing reliable 
                  distribution, retail access, market entry support, localisation solutions, and 
                  consulting services that strengthen product competitiveness.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Pillars - Image Cards */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">What We Do</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Our Business Pillars</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Three interconnected areas driving sustainable growth and meaningful community impact
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {businessPillars.map((pillar) => (
              <Card key={pillar.title} className="overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <Image
                    src={pillar.image}
                    alt={pillar.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <pillar.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="font-bold text-xl mb-3">{pillar.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve - Grid with Icons */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Our Customers</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Who We Serve</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From individual households to large cooperatives, we serve diverse customer segments 
              with tailored solutions
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {targetMarkets.map((market) => (
              <Card key={market.name} className="bg-card hover:bg-primary/5 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <market.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold">{market.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Why Choose Us</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Our Competitive Advantage</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              What sets Agri Hub SA apart in the market
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-8">
                  <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section - Professional Card */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Leadership</h2>
            <h3 className="text-3xl md:text-4xl font-bold">Meet Our Managing Director</h3>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-secondary p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-40 w-40 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl">
                      <Image
                        src="/images/about/dr-tshikhudo.jpg"
                        alt="Dr. Robert T. Tshikhudo - Managing Director"
                        width={160}
                        height={160}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h4 className="text-xl font-bold text-white">Dr. Robert T. Tshikhudo</h4>
                    <p className="text-white/70">PhD, EDP</p>
                    <p className="text-primary font-medium mt-1">Managing Director</p>
                  </div>
                </div>
                <CardContent className="md:w-2/3 p-8">
                  <h4 className="text-lg font-semibold mb-4">Executive Profile</h4>
                  <p className="text-muted-foreground leading-relaxed mb-4 italic text-base">
                    &quot;I turn science into scale.&quot;
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    With over 24 years of experience spanning nanotechnology, advanced materials, 
                    manufacturing innovation, and agri-tech, Dr Tshikhudo translates laboratory 
                    breakthroughs into commercially viable industries. He has secured over R105 million 
                    in competitive government funding, established three national first-of-kind facilities, 
                    built strategic partnerships with Boeing and Airbus, and supported the graduation of 
                    210 postgraduate students — 80% from designated groups. He is a 2× NSTF Award winner 
                    — South Africa&apos;s highest science and technology honour — recognised for both 
                    management excellence and corporate innovation.
                  </p>
                  <div>
                    <h5 className="font-medium text-sm mb-3">Key Highlights</h5>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Secured R105M in government funding — the only high-end infrastructure proposal approved nationally (2016–2018)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Established multiple South Africa&apos;s National Facilities which included, the Hot Isostatic Press (HIP) facility, Metal Injection Moulding (MIM) facility and Powder Production Facility</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Built the DST/Mintek NIC team from 3 to 32 scientists, producing 128+ postgraduate alumni</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Delivered R30M ISO 3-rated cleanroom — South Africa&apos;s first, inaugurated by the Minister of Science</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Led the TiCoC consortium to produce 267 research publications, 63 PhDs, and 15 patents across 6 universities</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Forged strategic alliances with Boeing and Airbus to integrate SA&apos;s advanced manufacturing into global aerospace supply chains</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Co-developed the South African Aluminium Industry Roadmap (SAAIR) — a strategy to double the sector&apos;s GDP contribution by 2030</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Chair: MAM-14 Conference, hosting two Nobel Laureates under one roof in SA</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Find Us</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Our Store Locations</h3>
            <p className="text-muted-foreground">
              Strategically positioned in Vhembe District to serve Limpopo and surrounding areas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Store className="h-16 w-16 text-primary/40" />
              </div>
              <CardContent className="p-6">
                <h4 className="font-bold text-xl mb-2">Tshaulu Store</h4>
                <p className="text-muted-foreground mb-4">
                  Our flagship location serving Tshaulu Village and surrounding communities
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Tshaulu Village, Vhembe District, Limpopo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span>Approximately 160m² retail space</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                <Store className="h-16 w-16 text-secondary/40" />
              </div>
              <CardContent className="p-6">
                <h4 className="font-bold text-xl mb-2">Tshifudi Store</h4>
                <p className="text-muted-foreground mb-4">
                  Serving Tshifudi Village with essential supplies and expert advice
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Tshifudi Village, Vhembe District, Limpopo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span>Approximately 90m² retail space</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partnership CTA - Visual Impact */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-secondary" />
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/about/manufacturing.jpg"
            alt="Partnership background"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Collaborate</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Partner With Agri Hub SA</h3>
            <p className="text-white/80 mb-10 text-lg max-w-2xl mx-auto">
              We seek partnerships with manufacturers and suppliers who want to expand their reach 
              into South African markets, particularly underserved rural and peri-urban communities.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left mb-10">
              {partnershipBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-white/90 text-sm">{benefit}</p>
                </div>
              ))}
            </div>
            
            <Button size="lg" asChild className="text-base px-10">
              <Link href="/contact">
                Start a Partnership Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Get In Touch</h2>
            <p className="mt-3 text-primary-foreground/80 text-lg">
              Ready to connect? We&apos;d love to hear from you
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Locations</h4>
                <p className="text-sm text-white/80">
                  Vhembe District, Limpopo<br />
                  Midrand, Gauteng
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Phone</h4>
                <p className="text-sm text-white/80">
                  079 109 9490<br />
                  083 306 1529
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Email</h4>
                <p className="text-sm text-white/80">
                  info@agrihubsa.co.za<br />
                  www.agrihubsa.co.za
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Hours</h4>
                <p className="text-sm text-white/80">
                  Mon-Fri: 07:00 - 18:30<br />
                  Sat, Sun & Holidays: 08:00 - 17:00
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
