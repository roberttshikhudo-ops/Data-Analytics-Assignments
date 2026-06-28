"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function CatalogueDownloadButtonFour() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDownload() {
    setIsLoading(true)
    try {
      // Fetch within the current authenticated session (sends cookies), so the
      // request is never treated as an unauthenticated new-tab navigation.
      const res = await fetch("/api/admin/catalogue/bedding-4", {
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to generate catalogue (${res.status})`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "Agri-Hub-SA-Bedding-Catalogue-4.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

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
      {isLoading ? "Generating..." : "Bedding Catalogue 4"}
    </Button>
  )
}
