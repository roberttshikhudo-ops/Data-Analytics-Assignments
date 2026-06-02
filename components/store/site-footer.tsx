import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Social media links - Update these with your actual account URLs
const socialLinks = {
  facebook: 'https://facebook.com/agrihubsa',
  instagram: 'https://instagram.com/agrihubsa',
  linkedin: 'https://linkedin.com/company/agrihubsa',
  youtube: 'https://youtube.com/@agrihubsa',
  whatsapp: 'https://wa.me/27791099490',
}

const footerLinks = {
  shop: [
    { name: 'All Products', href: '/shop' },
    { name: 'Animal Feeds', href: '/shop/animal-feeds' },
    { name: 'Gardening Tools', href: '/shop/gardening-tools' },
    { name: 'Seeds & Vegetables', href: '/shop/seeds-vegetables' },
    { name: 'Building & Construction', href: '/shop/building-construction' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Track Order', href: '/track' },
    { name: 'Delivery Policy', href: '/delivery-policy' },
    { name: 'Click & Collect', href: '/delivery-policy#click-collect' },
    { name: 'Returns & Refunds', href: '/returns' },
    { name: 'Payment Options', href: '/terms#payment' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Stores', href: '/about#locations' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Newsletter section */}
      <div className="border-b border-secondary-foreground/20">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-primary">Stay Updated</h3>
              <p className="text-base text-secondary-foreground/80 mt-2">
                Subscribe for farming tips, new products, and exclusive deals.
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" type="submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/agri-hub-logo.jpg"
                alt="Agri Hub SA"
                width={44}
                height={44}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold">Agri Hub SA</span>
            </Link>
            <p className="mt-4 text-secondary-foreground/80 text-base leading-relaxed">
              A South African-based enterprise enabling rural and urban economic participation 
              through supply, distribution, and localisation of high-demand products in agriculture, 
              lifestyle, hardware, and light industrial sectors.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link 
                href={socialLinks.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link 
                href={socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Linkedin className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link 
                href={socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Youtube className="h-6 w-6" />
                <span className="sr-only">YouTube</span>
              </Link>
              <Link 
                href={socialLinks.whatsapp} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="sr-only">WhatsApp</span>
              </Link>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-base text-secondary-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-base text-secondary-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-base text-secondary-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-base text-secondary-foreground/80">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <span>Vhembe District, Limpopo &amp; Midrand, Gauteng</span>
              </li>
              <li>
                <Link 
                  href="tel:+27791099490" 
                  className="flex items-center gap-2 text-base text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  <Phone className="h-5 w-5 shrink-0" />
                  <span>079 109 9490 / 083 306 1529</span>
                </Link>
              </li>
                    <li>
                      <Link
                        href="mailto:info@agrihubsa.co.za"
                        className="flex items-center gap-2 text-base text-secondary-foreground/80 hover:text-primary transition-colors"
                      >
                        <Mail className="h-5 w-5 shrink-0" />
                        <span>info@agrihubsa.co.za</span>
                      </Link>
                    </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-foreground/20">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-base text-secondary-foreground/80">
          <p>&copy; {new Date().getFullYear()} Agri Hub SA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
