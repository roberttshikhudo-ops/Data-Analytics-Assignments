'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/store/product-card'
import { ProductPagination, PAGE_SIZE } from '@/components/store/product-pagination'
import { groupProductVariants } from '@/lib/product-variants'
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
  /** Products shown per numbered page within each category. */
  pageSize?: number
}

/**
 * Shop All view: renders every category on one page, each with its own
 * independent numbered pagination so shoppers can page through just the
 * category they're interested in without loading everything at once.
 */
export function CategoryPreviewSections({
  sections,
  pageSize = PAGE_SIZE,
}: CategoryPreviewSectionsProps) {
  return (
    <div className="space-y-14">
      {sections.map((section, index) => (
        <CategorySnippet
          key={section.title}
          section={section}
          pageSize={pageSize}
          priority={index === 0}
        />
      ))}
    </div>
  )
}

function CategorySnippet({
  section,
  pageSize,
  priority,
}: {
  section: CategoryPreviewSection
  pageSize: number
  priority: boolean
}) {
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  // Collapse colour siblings into one card with a swatch selector.
  const groups = useMemo(() => groupProductVariants(section.products), [section.products])

  const total = groups.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const items = groups.slice(pageStart, pageEnd)

  const goToPage = (next: number) => {
    setPage(next)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const rangeStart = total === 0 ? 0 : pageStart + 1
  const rangeEnd = Math.min(pageEnd, total)

  return (
    <section aria-labelledby={`cat-${section.title}`} className="scroll-mt-24">
      <div ref={topRef} className="scroll-mt-24" />

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

      {/* Page grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((grp, i) => (
          <ProductCard
            key={grp.id}
            product={grp.primary}
            group={grp}
            priority={priority && currentPage === 1 && i < 4}
          />
        ))}
      </div>

      {/* Per-category numbered pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 pt-5">
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
          <p className="text-sm text-muted-foreground">
            Showing {rangeStart}&ndash;{rangeEnd} of {total}
          </p>
        </div>
      )}
    </section>
  )
}
