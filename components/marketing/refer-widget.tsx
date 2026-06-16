'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle, Facebook, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ReferWidgetProps {
  code: string
  shareUrl: string
}

export function ReferWidget({ code, shareUrl }: ReferWidgetProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedMsg, setCopiedMsg] = useState(false)

  const message = `I shop at Agri Hub SA for farm, home & hardware supplies - great prices and fast nationwide delivery. Use my code ${code} for 10% off your first order: ${shareUrl}`

  const copy = async (text: string, which: 'code' | 'msg') => {
    try {
      await navigator.clipboard.writeText(text)
      if (which === 'code') {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedMsg(true)
        setTimeout(() => setCopiedMsg(false), 2000)
      }
      toast.success(which === 'code' ? 'Code copied!' : 'Message copied!')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent('Get 10% off at Agri Hub SA')}&body=${encodeURIComponent(message)}`

  return (
    <div className="flex flex-col gap-6">
      {/* Code display */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">Your referral code</span>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border-2 border-dashed border-primary bg-primary/5 px-5 py-4 text-center text-2xl font-bold tracking-widest text-primary">
            {code}
          </div>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-[60px] gap-2"
            onClick={() => copy(code, 'code')}
            aria-label="Copy referral code"
          >
            {copiedCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            {copiedCode ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-muted-foreground">Share with friends</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button
            asChild
            size="lg"
            className="gap-2 bg-[#25D366] text-white hover:bg-[#25D366]/90"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="gap-2 bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
          >
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
              <Facebook className="h-5 w-5" />
              Facebook
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <a href={emailUrl}>
              <Mail className="h-5 w-5" />
              Email
            </a>
          </Button>
        </div>
      </div>

      {/* Copy full message */}
      <Button
        type="button"
        variant="secondary"
        className="gap-2"
        onClick={() => copy(message, 'msg')}
      >
        {copiedMsg ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copiedMsg ? 'Message copied' : 'Copy invite message'}
      </Button>
    </div>
  )
}
