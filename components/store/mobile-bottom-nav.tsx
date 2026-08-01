'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, LayoutGrid, Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Shop', href: '/shop', icon: LayoutGrid },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { itemCount, openCart } = useCart()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={openCart}
            className="relative flex w-full flex-col items-center gap-1 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </span>
            Cart
          </button>
        </li>
      </ul>
    </nav>
  )
}
