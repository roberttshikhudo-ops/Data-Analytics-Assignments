import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import type { Product } from '@/lib/types'

// Fixed, hand-tuned positions/sizes so the floating cluster always looks
// balanced regardless of how many products come back. Each card floats with a
// slightly different duration/delay/tilt so the motion feels organic.
const SLOTS = [
  {
    className: 'left-[2%] top-[6%] w-[42%] md:w-[44%] z-20',
    style: { '--float-duration': '6s', '--float-delay': '0s', '--tilt': '-4deg' },
  },
  {
    className: 'right-[3%] top-[0%] w-[38%] md:w-[40%] z-10',
    style: { '--float-duration': '7.5s', '--float-delay': '0.8s', '--tilt': '5deg' },
  },
  {
    className: 'left-[10%] bottom-[2%] w-[40%] md:w-[42%] z-30',
    style: { '--float-duration': '6.8s', '--float-delay': '0.4s', '--tilt': '3deg' },
  },
  {
    className: 'right-[6%] bottom-[6%] w-[34%] md:w-[36%] z-20',
    style: { '--float-duration': '8s', '--float-delay': '1.2s', '--tilt': '-6deg' },
  },
] as const

export function FloatingBedding({ products }: { products: Product[] }) {
  const items = products.slice(0, SLOTS.length)
  if (items.length === 0) return null

  return (
    <div
      aria-hidden={false}
      className="relative mx-auto aspect-square w-full max-w-md md:max-w-none"
    >
      {items.map((product, i) => {
        const slot = SLOTS[i]
        const discount = calculateDiscount(product.price, product.compare_at_price)
        return (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            style={slot.style as React.CSSProperties}
            className={`animate-float-soft absolute ${slot.className} group`}
          >
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105">
              <div className="relative aspect-square">
                <Image
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 45vw, 22vw"
                  quality={65}
                  priority={i < 2}
                />
                {discount ? (
                  <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow">
                    -{discount}%
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-xs font-medium text-slate-700">
                  {product.name}
                </span>
                <span className="shrink-0 text-sm font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
