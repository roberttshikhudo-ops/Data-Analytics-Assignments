'use client'

import { Facebook, Twitter, Linkedin, Link2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface SocialShareProps {
  title: string
  description?: string
  url?: string
  imageUrl?: string
}

export function SocialShare({ title, description, url, imageUrl }: SocialShareProps) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = description || title

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`,
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      
      {/* Facebook */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
        onClick={() => handleShare('facebook')}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      {/* Twitter/X */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-black hover:text-white hover:border-black transition-colors"
        onClick={() => handleShare('twitter')}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      {/* WhatsApp */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
        onClick={() => handleShare('whatsapp')}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      {/* LinkedIn */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
        onClick={() => handleShare('linkedin')}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
        onClick={handleCopyLink}
        aria-label="Copy link"
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Compact version for product cards
export function SocialShareCompact({ title, url }: { title: string; url: string }) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`,
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Link2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Link2 className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
