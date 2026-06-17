'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  /** ISO date string for when the offer ends */
  endDate: string
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(end: number): TimeLeft {
  const diff = Math.max(0, end - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function CountdownTimer({ endDate, className }: CountdownTimerProps) {
  const end = new Date(endDate).getTime()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft(end))
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(end))
    }, 1000)
    return () => clearInterval(interval)
  }, [end])

  const units: { label: string; value: number }[] = [
    { label: 'Days', value: timeLeft?.days ?? 0 },
    { label: 'Hours', value: timeLeft?.hours ?? 0 },
    { label: 'Mins', value: timeLeft?.minutes ?? 0 },
    { label: 'Secs', value: timeLeft?.seconds ?? 0 },
  ]

  return (
    <div className={className}>
      <div className="flex items-center gap-2 sm:gap-3">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex min-w-[3.5rem] flex-col items-center rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm"
          >
            <span className="text-2xl font-bold tabular-nums sm:text-3xl" suppressHydrationWarning>
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-white/70">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
