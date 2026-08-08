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

const RAW_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
// A valid GA4 Measurement ID looks like "G-XXXXXXXXXX". Reject anything else
// (e.g. a website URL) so we never load a broken gtag script that silently
// tracks nothing.
const GA_MEASUREMENT_ID =
  RAW_ID && /^G-[A-Z0-9]+$/i.test(RAW_ID.trim()) ? RAW_ID.trim() : null

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
  if (!RAW_ID) return null

  if (!GA_MEASUREMENT_ID) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[v0] Google Analytics disabled: NEXT_PUBLIC_GA_MEASUREMENT_ID is "${RAW_ID}", but it must be a GA4 Measurement ID like "G-XXXXXXXXXX".`,
      )
    }
    return null
  }

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
