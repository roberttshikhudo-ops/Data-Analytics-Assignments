"use client"

import { useState, useRef } from "react"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = "Product Image" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Always reset the input value right away so selecting the SAME file
    // again after a failure still fires onChange (fixes "need to refresh").
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (!file) return

    // Validate client-side before hitting the network
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Use JPEG, PNG, WebP, AVIF or GIF.")
      return
    }
    const maxSize = 15 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 15MB.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Upload straight from the browser to Vercel Blob. This bypasses the
      // serverless request-body limit that caused large images to fail.
      const blob = await upload(`products/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: file.type,
      })

      onChange(blob.url)
    } catch (err) {
      console.error("[v0] Image upload failed:", err)
      setError(
        err instanceof Error
          ? `Upload failed: ${err.message}. Please try again.`
          : "Upload failed. Please try again.",
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput("")
      setShowUrlInput(false)
    }
  }

  const handleRemove = () => {
    onChange("")
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative w-full aspect-square max-w-[200px] rounded-lg border overflow-hidden bg-muted">
          <Image
            src={value}
            alt="Product image"
            fill
            className="object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Upload Button */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload image
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP, AVIF, GIF (max 15MB)
                </p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          {/* Or use URL */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {showUrlInput ? (
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Paste image URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button type="button" size="sm" onClick={handleUrlSubmit}>
                Add
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setShowUrlInput(false)
                  setUrlInput("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowUrlInput(true)}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Use Image URL
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
