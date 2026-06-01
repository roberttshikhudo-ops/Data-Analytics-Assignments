import type { Product } from '@/lib/types'

interface ProductSchemaProps {
  product: Product
  url: string
}

export function ProductSchema({ product, url }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description || product.name,
    image: product.image_url ? [product.image_url] : [],
    sku: product.sku || product.id,
    mpn: product.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: 'Agri Hub SA',
    },
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'ZAR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      availability: product.stock_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Agri Hub SA',
      },
    },
    ...(product.compare_at_price && {
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: product.price,
        highPrice: product.compare_at_price,
        priceCurrency: 'ZAR',
        offerCount: 1,
      },
    }),
    category: product.category?.name || undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Organization Schema for the website
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Agri Hub SA',
    alternateName: 'Agri Hub South Africa',
    url: 'https://agrihubsa.co.za',
    logo: 'https://agrihubsa.co.za/logo.png',
    description: 'Leading agricultural and hardware supplier in South Africa. Quality seeds, fertilizers, tools, and farming equipment.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Elim Mall, Main Road',
      addressLocality: 'Elim',
      addressRegion: 'Limpopo',
      postalCode: '0960',
      addressCountry: 'ZA',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+27-79-109-9490',
        contactType: 'customer service',
        availableLanguage: ['English', 'Afrikaans', 'Venda'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+27-83-306-1529',
        contactType: 'sales',
        availableLanguage: ['English', 'Afrikaans', 'Venda'],
      },
    ],
    sameAs: [
      'https://www.facebook.com/agrihubsa',
      'https://www.instagram.com/agrihubsa',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '13:00',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Local Business Schema
export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Agri Hub SA - Elim',
    image: 'https://agrihubsa.co.za/images/store.jpg',
    '@id': 'https://agrihubsa.co.za',
    url: 'https://agrihubsa.co.za',
    telephone: '+27-79-109-9490',
    priceRange: 'R10 - R50000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Elim Mall, Main Road',
      addressLocality: 'Elim',
      addressRegion: 'Limpopo',
      postalCode: '0960',
      addressCountry: 'ZA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -23.1589,
      longitude: 30.0527,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '13:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '234',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// FAQ Schema for FAQ pages
interface FAQItem {
  question: string
  answer: string
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
