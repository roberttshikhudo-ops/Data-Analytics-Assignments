"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

function getVisitorId() {
  try {
    let id = localStorage.getItem("agrihub_visitor_id")
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem("agrihub_visitor_id", id)
    }
    return id
  } catch {
    return null
  }
}

export function VisitTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    // Avoid double-tracking the same path (e.g. on re-renders)
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    const payload = {
      path: pathname,
      referrer: document.referrer || null,
      visitorId: getVisitorId(),
    }

    // Use keepalive so the request still completes during navigation
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Tracking should never break the page
    })
  }, [pathname])

  return null
}
