'use client'

import { useMemo, useRef, useState } from 'react'
import { ProductCard } from '@/components/store/product-card'
import { ProductPagination, PAGE_SIZE } from '@/components/store/product-pagination'
import { groupProductVariants } from '@/lib/product-variants'
import type { Product } from '@/lib/types'

export interface ProductSection {
  /** Section heading. Use null for an ungrouped flat grid. */
  title: string | null
  products: Product[]
}

interface ProgressiveProductsProps {
  sections: ProductSection[]
  /** Products shown per numbered page. */
  pageSize?: number
}

/**
 * Renders product sections split across numbered pages (default 50 products
 * per page). Section headings are preserved on whichever page their items
 * fall on, so large categories (e.g. Bedding & Kitchenware) stay light and
 * shoppers can jump straight to page 2, 3, etc.
 */
export function ProgressiveProducts({
  sections,
  pageSize = PAGE_SIZE,
}: ProgressiveProductsProps) {
  // Collapse colour siblings into a single card (with a swatch selector) per
  // section, matching the homepage. Without this, each colour rendered as its
  // own card with no chooser at the bottom.
  const groupedSections = useMemo(
    () => sections.map((s) => ({ title: s.title, groups: groupProductVariants(s.products) })),
    [sections],
  )

  const total = useMemo(
    () => groupedSections.reduce((sum, s) => sum + s.groups.length, 0),
    [groupedSections],
  )

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  // Clamp in case the section list shrinks (e.g. after filtering).
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize

  const goToPage = (next: number) => {
    setPage(next)
    // Bring the shopper back to the top of the grid on page change.
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Walk the sections in order, rendering only the slice of each that falls
  // within the current page's [pageStart, pageEnd) window.
  let cursor = 0
  const renderedSections = groupedSections.map((section) => {
    const start = cursor
    const end = start + section.groups.length
    cursor = end

    const from = Math.max(start, pageStart)
    const to = Math.min(end, pageEnd)
    if (to <= from) return null

    const items = section.groups.slice(from - start, to - start)

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
              {section.groups.length}{' '}
              {section.groups.length === 1 ? 'item' : 'items'}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((grp, i) => (
            <ProductCard
              key={grp.id}
              product={grp.primary}
              group={grp}
              priority={currentPage === 1 && from - start + i < 6}
            />
          ))}
        </div>
      </section>
    )
  })

  const rangeStart = total === 0 ? 0 : pageStart + 1
  const rangeEnd = Math.min(pageEnd, total)

  return (
    <div className="space-y-12">
      <div ref={topRef} className="scroll-mt-24" />

      {renderedSections}

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
          <p className="text-sm text-muted-foreground">
            Showing {rangeStart}&ndash;{rangeEnd} of {total} products
          </p>
        </div>
      )}
    </div>
  )
}
