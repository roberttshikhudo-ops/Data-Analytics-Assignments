import { SiteHeader } from '@/components/store/site-header'
import { SiteFooter } from '@/components/store/site-footer'
import { CartDrawer } from '@/components/store/cart-drawer'
import { MobileBottomNav } from '@/components/store/mobile-bottom-nav'
import { WhatsAppButton } from '@/components/store/whatsapp-button'
import { PromoBanner } from '@/components/store/promo-banner'
import { ExitIntentPopup } from '@/components/store/exit-intent-popup'
import { AuthProvider } from '@/hooks/use-auth'
import { CartProvider } from '@/hooks/use-cart'
import { VisitTracker } from '@/components/visit-tracker'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <VisitTracker />
          <PromoBanner />
          <SiteHeader />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <MobileBottomNav />
          <WhatsAppButton />
          <ExitIntentPopup />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
