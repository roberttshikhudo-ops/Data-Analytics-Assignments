import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@/components/google-analytics'
import { OrganizationSchema, LocalBusinessSchema } from '@/components/seo/schema-markup'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Agri Hub SA | Agricultural, Hardware & Lifestyle Supplies',
    template: '%s | Agri Hub SA',
  },
  description: 'Enabling rural and urban economic participation through supply, distribution, and localisation of high-demand products in agriculture, lifestyle, hardware, and light industrial sectors. Serving Vhembe District and beyond.',
  keywords: ['agriculture', 'farming', 'seeds', 'fertilizers', 'hardware', 'building supplies', 'South Africa', 'Limpopo', 'Vhembe', 'rural supplies'],
  authors: [{ name: 'Agri Hub SA (Pty) Ltd' }],
  creator: 'Agri Hub SA',
  publisher: 'Agri Hub SA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://agrihubsa.co.za'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    siteName: 'Agri Hub SA',
    title: 'Agri Hub SA | Agricultural, Hardware & Lifestyle Supplies',
    description: 'Your one-stop shop for agriculture, hardware, and lifestyle products in South Africa. Quality seeds, fertilizers, tools, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Agri Hub SA - Agricultural, Hardware & Lifestyle Supplies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agri Hub SA | Agricultural, Hardware & Lifestyle Supplies',
    description: 'Your one-stop shop for agriculture, hardware, and lifestyle products in South Africa.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2D5016' },
    { media: '(prefers-color-scheme: dark)', color: '#1a2e0d' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased bg-background">
        {/* Keep JSON-LD in the body so preview-injected head scripts cannot
            shift these nodes and cause a hydration mismatch during HMR. */}
        <OrganizationSchema />
        <LocalBusinessSchema />
        <GoogleAnalytics />
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
