'use client'

import { useMemo, useState } from 'react'
import { ProductCard } from '@/components/store/product-card'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'

export interface ProductSection {
  /** Section heading. Use null for an ungrouped flat grid. */
  title: string | null
  products: Product[]
}

interface ProgressiveProductsProps {
  sections: ProductSection[]
  /** How many products to show on first paint. */
  initialCount?: number
  /** How many more to reveal each time "Load more" is clicked. */
  batchSize?: number
}

/**
 * Renders product sections but only mounts a limited number of cards at a
 * time, revealing more in batches when the shopper clicks "Load more". This
 * keeps the initial DOM light on large categories (e.g. Bedding & Kitchenware
 * with ~180 products) while preserving the section headings and order.
 */
export function ProgressiveProducts({
  sections,
  initialCount = 12,
  batchSize = 12,
}: ProgressiveProductsProps) {
  const total = useMemo(
    () => sections.reduce((sum, s) => sum + s.products.length, 0),
    [sections],
  )

  const [visibleCount, setVisibleCount] = useState(initialCount)

  // Walk the sections in order, handing each one the slice of the global
  // reveal window that falls inside it.
  let cursor = 0
  const renderedSections = sections.map((section) => {
    const start = cursor
    const end = start + section.products.length
    cursor = end

    // How many of this section's items fall within the visible window.
    const visibleInSection = Math.max(
      0,
      Math.min(section.products.length, visibleCount - start),
    )

    if (visibleInSection === 0) return null

    const items = section.products.slice(0, visibleInSection)

    return (
      <section
        key={section.title ?? 'flat'}
        aria-labelledby={section.title ? `section-${section.title}` : undefined}
        className="scroll-mt-24"
      >
        {section.title && (
          <div className="flex items-center gap-3 mb-4">
            <h2 id={`section-${section.title}`} className="text-xl font-semibold">
              {section.title}
            </h2>
            <span className="text-sm text-muted-foreground">
              {section.products.length}{' '}
              {section.products.length === 1 ? 'item' : 'items'}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={start + i < 6}
            />
          ))}
        </div>
      </section>
    )
  })

  const remaining = total - visibleCount

  return (
    <div className="space-y-12">
      {renderedSections}

      {remaining > 0 && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(visibleCount, total)} of {total} products
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              setVisibleCount((c) => Math.min(c + batchSize, total))
            }
          >
            Load more ({remaining} left)
          </Button>
        </div>
      )}
    </div>
  )
}
