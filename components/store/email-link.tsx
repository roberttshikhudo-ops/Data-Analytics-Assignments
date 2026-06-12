'use client'

import { Mail, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface EmailLinkProps {
  email: string
  className?: string
}

export function EmailLink({ email, className }: EmailLinkProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Try to copy the address as a reliable fallback (works even when
    // mailto: is blocked, e.g. inside the v0 preview iframe).
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      toast.success('Email address copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available - let the mailto: default proceed.
    }
  }

  return (
    <a
      href={`mailto:${email}`}
      onClick={handleClick}
      className={className}
      aria-label={`Email ${email} (click to copy address)`}
    >
      {copied ? <Check className="h-5 w-5 shrink-0" /> : <Mail className="h-5 w-5 shrink-0" />}
      <span>{email}</span>
    </a>
  )
}
