'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

// GA4 Measurement ID. This value is PUBLIC by design (it appears in the page
// source of every site running GA), so it is safe to keep as a fallback in
// code. The env var is preferred, but it is only used when it is a valid
// "G-XXXXXXXXXX" ID — a stray value like a website URL falls back to this.
const FALLBACK_GA_ID = 'G-ELKHYGLZPN'
const ENV_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GA_MEASUREMENT_ID =
  ENV_ID && /^G-[A-Z0-9]+$/i.test(ENV_ID.trim()) ? ENV_ID.trim() : FALLBACK_GA_ID

function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
    const query = searchParams?.toString()
    const page_path = query ? `${pathname}?${query}` : pathname
    // Send a pageview on every client-side route change (App Router does not
    // do this automatically).
    window.gtag('event', 'page_view', { page_path })
  }, [pathname, searchParams])

  return null
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
    </>
  )
}
