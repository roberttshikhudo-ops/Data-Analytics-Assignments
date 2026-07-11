"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageDown, Loader2 } from "lucide-react"

const POSTER_URL = "/agri-hub-bedding-poster.png"

export function PosterDownloadButton() {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      // Fetch as a blob so the download works reliably (even inside iframes/mobile).
      const res = await fetch(POSTER_URL, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = "agri-hub-bedding-poster.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.log("[v0] Poster download failed, opening in new tab:", err)
      // Fallback: open the image in a new tab so the user can save it manually.
      window.open(POSTER_URL, "_blank", "noopener,noreferrer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ImageDown className="mr-2 h-4 w-4" />
      )}
      Download Poster
    </Button>
  )
}
