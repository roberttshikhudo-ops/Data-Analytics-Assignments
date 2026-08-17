"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function CatalogueDownloadButtonSix() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDownload() {
    setIsLoading(true)
    try {
      // Regenerate the PDF with the latest products server-side and refresh the
      // shared cache, then get back the small forced-download Blob URL. We
      // navigate straight to that URL instead of pulling the whole ~7MB PDF
      // through fetch().blob() — that approach timed out during generation and
      // got blocked by the browser, which is why the download kept failing.
      const res = await fetch("/api/catalogue/bedding-6?json=1&refresh=1", {
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to generate catalogue (${res.status})`)
      }

      const { downloadUrl } = (await res.json()) as { downloadUrl?: string }
      if (!downloadUrl) {
        throw new Error("Catalogue is not available right now.")
      }

      const link = document.createElement("a")
      link.href = downloadUrl
      link.rel = "noopener"
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("Catalogue downloaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download catalogue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <BookOpen className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Generating..." : "Bedding Catalogue 6"}
    </Button>
  )
}
