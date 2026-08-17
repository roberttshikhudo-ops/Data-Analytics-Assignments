'use client'

import { useState } from 'react'
import { BookOpen, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FILE_NAME = 'Agri-Hub-SA-Bedding-Catalogue.pdf'

export function CatalogueDownloadBadge({ downloadUrl }: { downloadUrl?: string | null }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fallback for the rare case the cache wasn't warm at page render: ask the
  // API for the download URL, then navigate to it.
  async function handleFallbackDownload() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/catalogue/bedding-6?json=1')
      if (!res.ok) {
        throw new Error(`Failed to prepare catalogue (${res.status})`)
      }
      const { downloadUrl: url } = (await res.json()) as { downloadUrl?: string }
      if (!url) {
        throw new Error('Catalogue is not available right now.')
      }
      window.location.href = url
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
        {downloadUrl ? (
          // Primary path: a direct link to the permanent public Blob file
          // (served with content-disposition: attachment). No serverless
          // function, generation, or fetch involved — so it cannot 500.
          <Button asChild className="gap-2 font-semibold">
            <a href={downloadUrl} download={FILE_NAME} rel="noopener">
              <Download className="h-4 w-4" />
              Download Catalogue (PDF)
            </a>
          </Button>
        ) : (
          <Button
            onClick={handleFallbackDownload}
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
        )}
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
