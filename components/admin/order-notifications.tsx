"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatPrice } from "@/lib/utils"

interface PaidOrder {
  id: string
  order_number: string
  total: number
  status: string
  created_at: string
}

const SEEN_KEY = "admin_orders_last_seen"

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load orders")
    return res.json()
  })

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/** Plays a short, subtle chime using the Web Audio API (no asset needed). */
function playChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
    osc.onended = () => ctx.close()
  } catch {
    // Audio not available (e.g. autoplay blocked) - silently ignore.
  }
}

export function OrderNotifications() {
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const prevTopId = useRef<string | null>(null)
  const initialised = useRef(false)

  // Load the last-seen timestamp once on mount.
  useEffect(() => {
    try {
      setLastSeen(localStorage.getItem(SEEN_KEY))
    } catch {
      setLastSeen(null)
    }
  }, [])

  // Poll for paid orders every 30 seconds.
  const { data } = useSWR<{ orders: PaidOrder[] }>(
    "/api/admin/new-orders",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true },
  )

  const orders = useMemo(() => data?.orders ?? [], [data])

  // Chime when a genuinely new paid order arrives (skips the first load).
  useEffect(() => {
    const topId = orders[0]?.id ?? null
    if (!initialised.current) {
      initialised.current = true
      prevTopId.current = topId
      return
    }
    if (topId && topId !== prevTopId.current) {
      playChime()
    }
    prevTopId.current = topId
  }, [orders])

  const unseenCount = useMemo(() => {
    if (!lastSeen) return orders.length
    return orders.filter((o) => new Date(o.created_at) > new Date(lastSeen))
      .length
  }, [orders, lastSeen])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    // Opening the panel marks everything currently listed as seen.
    if (next && orders.length > 0) {
      const newest = orders[0].created_at
      try {
        localStorage.setItem(SEEN_KEY, newest)
      } catch {
        // ignore storage errors
      }
      setLastSeen(newest)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`New orders${unseenCount > 0 ? `, ${unseenCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unseenCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold">New Orders</p>
          <Link
            href="/admin/orders"
            className="text-sm text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {orders.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No paid orders yet
            </p>
          ) : (
            orders.map((order) => {
              const isUnseen = lastSeen
                ? new Date(order.created_at) > new Date(lastSeen)
                : true
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 border-b px-4 py-3 transition-colors last:border-0 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      {isUnseen && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{order.order_number}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {relativeTime(order.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold">
                    {formatPrice(Number(order.total))}
                  </span>
                </Link>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
