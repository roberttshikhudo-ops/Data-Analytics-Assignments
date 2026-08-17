'use client'

import { useState } from 'react'
import { BookOpen, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CatalogueDownloadBadge() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setIsLoading(true)
    setError(null)
    try {
      // Ask the API for the cached forced-download URL (tiny, same-origin
      // request), then navigate the browser straight to it. This avoids
      // pulling the whole ~7MB PDF through fetch and works reliably on live.
      const res = await fetch('/api/catalogue/bedding-6?json=1')
      if (!res.ok) {
        throw new Error(`Failed to prepare catalogue (${res.status})`)
      }
      const { downloadUrl } = (await res.json()) as { downloadUrl?: string }
      if (!downloadUrl) {
        throw new Error('Catalogue is not available right now.')
      }
      const link = document.createElement('a')
      link.href = downloadUrl
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download the catalogue. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border bg-background p-4 sm:flex-row">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Full Bedding Catalogue</p>
          <p className="text-sm text-muted-foreground">
            See every design and price in one PDF
          </p>
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-1 sm:items-end">
        <Button
          onClick={handleDownload}
          disabled={isLoading}
          className="gap-2 font-semibold"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isLoading ? 'Preparing...' : 'Download Catalogue (PDF)'}
        </Button>
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
