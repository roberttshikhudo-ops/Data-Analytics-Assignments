'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Save, Image as ImageIcon, Check, X, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  image_url: string | null
  short_description: string | null
}

export default function BulkImageManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'all' | 'missing' | 'has'>('missing')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, image_url, short_description')
      .eq('is_active', true)
      .order('name')

    if (error) {
      toast.error('Failed to load products')
      return
    }

    setProducts(data || [])
    
    // Initialize image URLs from existing data
    const urls: Record<string, string> = {}
    data?.forEach(p => {
      urls[p.id] = p.image_url || ''
    })
    setImageUrls(urls)
    setLoading(false)
  }

  async function saveImage(productId: string) {
    const url = imageUrls[productId]?.trim()
    
    setSaving(productId)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('products')
      .update({ image_url: url || null })
      .eq('id', productId)

    if (error) {
      toast.error('Failed to save image')
    } else {
      toast.success('Image saved!')
      // Update local state
      setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, image_url: url || null } : p)
      )
    }
    setSaving(null)
  }

  const filteredProducts = products.filter(p => {
    // Apply image filter
    if (filter === 'missing' && p.image_url) return false
    if (filter === 'has' && !p.image_url) return false
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return p.name.toLowerCase().includes(query) || 
             p.short_description?.toLowerCase().includes(query)
    }
    
    return true
  })

  const stats = {
    total: products.length,
    withImages: products.filter(p => p.image_url).length,
    missing: products.filter(p => !p.image_url).length
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Images</h1>
          <p className="text-muted-foreground">
            Add images to your products by pasting image URLs
          </p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.withImages}</div>
            <p className="text-sm text-muted-foreground">With Images</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.missing}</div>
            <p className="text-sm text-muted-foreground">Missing Images</p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How to add images (Free)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Option 1 - Imgur:</strong> Go to <a href="https://imgur.com/upload" target="_blank" rel="noopener" className="text-blue-600 underline">imgur.com/upload</a>, upload your image, right-click the image and copy the image address.</p>
          <p><strong>Option 2 - ImgBB:</strong> Go to <a href="https://imgbb.com/" target="_blank" rel="noopener" className="text-blue-600 underline">imgbb.com</a>, upload your image, copy the direct link.</p>
          <p><strong>Option 3 - Google Drive:</strong> Upload to Google Drive, set sharing to "Anyone with link", copy the link and change it to: <code className="bg-white px-1 rounded">https://drive.google.com/uc?id=FILE_ID</code></p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <Button 
            variant={filter === 'missing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('missing')}
          >
            Missing Images ({stats.missing})
          </Button>
          <Button 
            variant={filter === 'has' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('has')}
          >
            Has Images ({stats.withImages})
          </Button>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
        </div>
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {filter === 'missing' 
                ? 'All products have images!' 
                : 'No products found'}
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  {/* Image Preview */}
                  <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {imageUrls[product.id] ? (
                      <Image
                        src={imageUrls[product.id]}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = ''
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Product Info & Input */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          R {product.price.toFixed(2)}
                        </p>
                      </div>
                      {product.image_url && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <Check className="w-3 h-3" /> Has image
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste image URL here..."
                        value={imageUrls[product.id] || ''}
                        onChange={(e) => setImageUrls(prev => ({
                          ...prev,
                          [product.id]: e.target.value
                        }))}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => saveImage(product.id)}
                        disabled={saving === product.id}
                      >
                        {saving === product.id ? (
                          <span className="animate-spin">...</span>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      {imageUrls[product.id] && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a href={imageUrls[product.id]} target="_blank" rel="noopener">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
