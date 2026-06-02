'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/lib/types'

interface ShopFiltersProps {
  categories: Category[]
  currentCategory?: string
  minPrice?: string
  maxPrice?: string
}

export function ShopFilters({ 
  categories, 
  currentCategory, 
  minPrice,
  maxPrice,
}: ShopFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push(pathname)
  }

  const activeFilterCount = [currentCategory, minPrice, maxPrice].filter(Boolean).length

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCategory && (
              <Badge variant="secondary" className="gap-1">
                {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('category', null)}
                />
              </Badge>
            )}
            {(minPrice || maxPrice) && (
              <Badge variant="secondary" className="gap-1">
                R{minPrice || '0'} - R{maxPrice || '∞'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    updateFilter('minPrice', null)
                    updateFilter('maxPrice', null)
                  }}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      <Accordion type="multiple" defaultValue={['categories', 'price']}>
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm font-medium">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={currentCategory === category.slug}
                    onCheckedChange={(checked) => {
                      updateFilter('category', checked ? category.slug : null)
                    }}
                  />
                  <Label 
                    htmlFor={`cat-${category.id}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor="minPrice" className="text-xs text-muted-foreground">Min</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R</span>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="0"
                      value={minPrice || ''}
                      onChange={(e) => updateFilter('minPrice', e.target.value || null)}
                      className="pl-6"
                    />
                  </div>
                </div>
                <span className="mt-5 text-muted-foreground">-</span>
                <div className="flex-1">
                  <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">Max</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R</span>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="10000"
                      value={maxPrice || ''}
                      onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
                      className="pl-6"
                    />
                  </div>
                </div>
              </div>
              {/* Quick price filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Under R500', min: '0', max: '500' },
                  { label: 'R500 - R1000', min: '500', max: '1000' },
                  { label: 'R1000 - R2000', min: '1000', max: '2000' },
                  { label: 'Over R2000', min: '2000', max: '' },
                ].map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      if (range.min) params.set('minPrice', range.min)
                      else params.delete('minPrice')
                      if (range.max) params.set('maxPrice', range.max)
                      else params.delete('maxPrice')
                      router.push(`${pathname}?${params.toString()}`)
                    }}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-24">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h2>
        <FiltersContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] px-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 pr-2">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
