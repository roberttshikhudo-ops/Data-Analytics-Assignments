import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import type { Product } from '@/lib/types'

// A continuously scrolling ribbon of real bedding products. Pure CSS (no JS):
// the track is duplicated so the translateX(-50%) loop is seamless, and it
// pauses on hover so shoppers can tap through to buy.
export function ProductMarquee({
  products,
  durationSeconds = 45,
}: {
  products: Product[]
  durationSeconds?: number
}) {
  if (products.length === 0) return null

  // Duplicate the list so the loop is seamless.
  const loop = [...products, ...products]

  return (
    <div className="marquee-track group relative overflow-hidden">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent md:w-24" />

      <div
        className="animate-marquee flex w-max gap-4"
        style={{ ['--marquee-duration' as string]: `${durationSeconds}s` }}
      >
        {loop.map((product, i) => {
          const discount = calculateDiscount(product.price, product.compare_at_price)
          return (
            <Link
              key={`${product.id}-${i}`}
              href={`/products/${product.slug}`}
              className="group/card w-40 shrink-0 sm:w-48"
              aria-hidden={i >= products.length}
              tabIndex={i >= products.length ? -1 : 0}
            >
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                    sizes="192px"
                    quality={60}
                  />
                  {discount ? (
                    <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow">
                      -{discount}%
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-bold text-emerald-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_at_price ? (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
