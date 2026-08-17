'use client'

import { useState } from 'react'
import { BookOpen, Download, Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildOrderWaLink } from '@/lib/whatsapp'

const FILE_NAME = 'Agri-Hub-SA-Bedding-Catalogue.pdf'

export function BeddingCatalogueSection({ downloadUrl }: { downloadUrl?: string | null }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fallback for the rare case the cache wasn't warm at page render.
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
    <section className="border-t bg-muted/30 py-14">
      <div className="container">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
            {/* Copy + actions */}
            <div className="p-8 md:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#128C7E]/10 px-3 py-1 text-sm font-semibold text-[#075E54]">
                <BookOpen className="h-4 w-4" />
                Full Bedding Catalogue
              </div>
              <h2 className="text-balance text-2xl font-bold md:text-3xl">
                Browse our complete bedding range
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground">
                Download our latest bedding catalogue (PDF) to see every comforter, quilt,
                bedsheet, blanket and mattress protector with prices - perfect for choosing
                before you order.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {downloadUrl ? (
                  // Direct link to the permanent public Blob file (served with
                  // content-disposition: attachment). No serverless function in
                  // the path, so it can never 500.
                  <Button
                    asChild
                    size="lg"
                    className="h-12 gap-2 bg-[#075E54] px-6 text-base font-semibold text-white hover:bg-[#064c44]"
                  >
                    <a href={downloadUrl} download={FILE_NAME} rel="noopener">
                      <Download className="h-5 w-5" />
                      Download Catalogue (PDF)
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleFallbackDownload}
                    disabled={isLoading}
                    className="h-12 gap-2 bg-[#075E54] px-6 text-base font-semibold text-white hover:bg-[#064c44]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                    {isLoading ? 'Preparing catalogue...' : 'Download Catalogue (PDF)'}
                  </Button>
                )}
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 gap-2 border-[#075E54]/30 px-6 text-base font-semibold text-[#075E54] hover:bg-[#128C7E]/10 hover:text-[#075E54]"
                >
                  <a href={buildOrderWaLink()} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    Order on WhatsApp
                  </a>
                </Button>
              </div>

              {error && (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* Visual */}
            <div className="relative hidden items-center justify-center bg-gradient-to-br from-[#075E54] via-[#0b7d6f] to-[#128C7E] p-10 md:flex">
              <div className="flex flex-col items-center text-center text-white">
                <BookOpen className="h-16 w-16" strokeWidth={1.5} />
                <p className="mt-4 text-lg font-semibold">Agri Hub SA</p>
                <p className="text-sm text-white/80">Bedding Catalogue</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
