'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface SearchResult {
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    image_url: string | null
    short_description: string | null
    categories: { name: string; slug: string } | null
  }>
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface SearchBarProps {
  className?: string
  autoFocus?: boolean
  onSearch?: () => void
}

export function SearchBar({ className, autoFocus, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
        const data = await res.json()
        setResults(data)
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      setShowResults(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      onSearch?.()
    }
  }

  const handleResultClick = () => {
    setShowResults(false)
    setQuery('')
    onSearch?.()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 bg-accent text-accent-foreground placeholder:text-white border-accent focus:border-accent/80"
            autoFocus={autoFocus}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          {!isLoading && query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setQuery('')
                setResults(null)
                inputRef.current?.focus()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results && (results.products.length > 0 || results.categories.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[70vh] overflow-auto">
          {/* Categories */}
          {results.categories.length > 0 && (
            <div className="p-3 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop/${category.slug}`}
                    onClick={handleResultClick}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 mb-2 px-2">Products</p>
              {results.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={handleResultClick}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Search className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                    {product.short_description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{product.short_description}</p>
                    )}
                    <p className="text-sm text-primary font-semibold mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View all link */}
          <div className="p-2 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm text-gray-700 hover:text-primary"
              onClick={() => {
                setShowResults(false)
                router.push(`/search?q=${encodeURIComponent(query)}`)
                onSearch?.()
              }}
            >
              View all results for &quot;{query}&quot;
            </Button>
          </div>
        </div>
      )}

      {/* No results message */}
      {showResults && results && results.products.length === 0 && results.categories.length === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 text-center">
          <p className="text-gray-600 text-sm">No results found for &quot;{query}&quot;</p>
          <Button
            variant="link"
            className="text-sm mt-1 text-primary"
            onClick={() => {
              setShowResults(false)
              router.push('/shop')
            }}
          >
            Browse all products
          </Button>
        </div>
      )}
    </div>
  )
}
