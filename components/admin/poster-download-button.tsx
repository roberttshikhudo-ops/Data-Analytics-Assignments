"use client"

import { Button } from "@/components/ui/button"
import { ImageDown } from "lucide-react"

export function PosterDownloadButton() {
  function handleDownload() {
    const link = document.createElement("a")
    link.href = "/agri-hub-bedding-poster.png"
    link.download = "agri-hub-bedding-poster.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" onClick={handleDownload}>
      <ImageDown className="mr-2 h-4 w-4" />
      Download Poster
    </Button>
  )
}
