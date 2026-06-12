'use client'

import { Mail, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

interface EmailLinkProps {
  email: string
  className?: string
}

export function EmailLink({ email, className }: EmailLinkProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      toast.success('Email address copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy. Email us at ' + email)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Goes to the on-site contact form, which delivers straight to our inbox.
          No external mail app (Outlook, etc.) required. */}
      <Link href="/contact" className={className} aria-label={`Send us an email via our contact form`}>
        <Mail className="h-5 w-5 shrink-0" />
        <span>{email}</span>
      </Link>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy email address"
        title="Copy email address"
        className="text-secondary-foreground/60 hover:text-primary transition-colors"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}
