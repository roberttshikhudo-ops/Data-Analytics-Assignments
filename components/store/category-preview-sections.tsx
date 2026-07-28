'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/store/product-card'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'

export interface CategoryPreviewSection {
  /** Section heading shown above the snippet. */
  title: string
  /** Optional link to the full category page ("View all"). */
  href?: string
  products: Product[]
}

interface CategoryPreviewSectionsProps {
  sections: CategoryPreviewSection[]
  /** How many products to show per category before "Load more". */
  initialCount?: number
  /** How many more to reveal each time "Load more" is clicked. */
  batchSize?: number
}

/**
 * Shop All view: renders a snippet of every category on one page, each with
 * its own independent "Load more" control so shoppers can expand just the
 * category they're interested in without loading everything at once.
 */
export function CategoryPreviewSections({
  sections,
  initialCount = 8,
  batchSize = 8,
}: CategoryPreviewSectionsProps) {
  return (
    <div className="space-y-14">
      {sections.map((section, index) => (
        <CategorySnippet
          key={section.title}
          section={section}
          initialCount={initialCount}
          batchSize={batchSize}
          priority={index === 0}
        />
      ))}
    </div>
  )
}

function CategorySnippet({
  section,
  initialCount,
  batchSize,
  priority,
}: {
  section: CategoryPreviewSection
  initialCount: number
  batchSize: number
  priority: boolean
}) {
  const [visibleCount, setVisibleCount] = useState(initialCount)

  const total = section.products.length
  const items = section.products.slice(0, visibleCount)
  const remaining = total - visibleCount
  const expanded = visibleCount > initialCount

  return (
    <section aria-labelledby={`cat-${section.title}`} className="scroll-mt-24">
      {/* Heading */}
      <div className="flex items-center gap-3 mb-4">
        <h2 id={`cat-${section.title}`} className="text-xl font-semibold">
          {section.title}
        </h2>
        <span className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'item' : 'items'}
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        {section.href && (
          <Link
            href={section.href}
            className="text-sm font-medium text-primary hover:underline shrink-0"
          >
            View all
          </Link>
        )}
      </div>

      {/* Snippet grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={priority && i < 4}
          />
        ))}
      </div>

      {/* Per-category controls */}
      {(remaining > 0 || expanded) && (
        <div className="flex flex-wrap items-center gap-3 pt-5">
          {remaining > 0 && (
            <Button
              variant="outline"
              onClick={() =>
                setVisibleCount((c) => Math.min(c + batchSize, total))
              }
            >
              Load more ({remaining} left)
            </Button>
          )}
          {expanded && (
            <Button
              variant="ghost"
              onClick={() => setVisibleCount(initialCount)}
            >
              Show less
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
