"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Users, TrendingUp, FileText } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface PageView {
  path: string
  visitor_id: string | null
  referrer: string | null
  created_at: string
}

function formatPathLabel(path: string) {
  if (path === "/") return "Home"
  return path
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const [views, setViews] = useState<PageView[]>([])

  useEffect(() => {
    async function fetchViews() {
      setLoading(true)
      const supabase = createClient()
      const daysAgo = parseInt(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      const { data, error } = await supabase
        .from("page_views")
        .select("path, visitor_id, referrer, created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true })

      if (error) {
        console.log("[v0] analytics fetch error:", error.message)
      }

      setViews(data ?? [])
      setLoading(false)
    }
    fetchViews()
  }, [period])

  const stats = useMemo(() => {
    const totalViews = views.length
    const uniqueVisitors = new Set(views.map((v) => v.visitor_id).filter(Boolean)).size
    const days = parseInt(period)
    const avgPerDay = days > 0 ? Math.round(totalViews / days) : 0

    // Views per day for the chart
    const byDay = new Map<string, number>()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      byDay.set(key, 0)
    }
    for (const v of views) {
      const key = new Date(v.created_at).toISOString().slice(0, 10)
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + 1)
    }
    const chartData = Array.from(byDay.entries()).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
      views: count,
    }))

    // Top pages
    const pageCounts = new Map<string, number>()
    for (const v of views) {
      pageCounts.set(v.path, (pageCounts.get(v.path) || 0) + 1)
    }
    const topPages = Array.from(pageCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // Top referrers
    const refCounts = new Map<string, number>()
    for (const v of views) {
      if (!v.referrer) continue
      try {
        const host = new URL(v.referrer).hostname.replace(/^www\./, "")
        if (host) refCounts.set(host, (refCounts.get(host) || 0) + 1)
      } catch {
        // ignore malformed referrers
      }
    }
    const topReferrers = Array.from(refCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    const topPage = topPages[0]

    return { totalViews, uniqueVisitors, avgPerDay, chartData, topPages, topReferrers, topPage }
  }, [views, period])

  const statCards = [
    {
      title: "Total Page Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
    },
    {
      title: "Unique Visitors",
      value: stats.uniqueVisitors.toLocaleString(),
      icon: Users,
    },
    {
      title: "Avg Views / Day",
      value: stats.avgPerDay.toLocaleString(),
      icon: TrendingUp,
    },
    {
      title: "Most Visited",
      value: stats.topPage ? formatPathLabel(stats.topPage.path) : "—",
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visit Analytics</h1>
          <p className="text-muted-foreground">Track how visitors use your store</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Views over time */}
          <Card>
            <CardHeader>
              <CardTitle>Page Views Over Time</CardTitle>
              <CardDescription>Daily views for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalViews === 0 ? (
                <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                  <p>
                    No visits recorded yet. Data will appear here as people browse your store.
                  </p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                      />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "0.5rem",
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          fontSize: "0.875rem",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#viewsFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {stats.topPages.map((page) => (
                      <li key={page.path} className="flex items-center justify-between gap-4">
                        <span className="truncate text-sm text-foreground">{formatPathLabel(page.path)}</span>
                        <span className="shrink-0 text-sm font-medium text-muted-foreground">
                          {page.count.toLocaleString()} views
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Top referrers */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topReferrers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No external referrers recorded yet. Most visits are direct or internal.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {stats.topReferrers.map((ref) => (
                      <li key={ref.source} className="flex items-center justify-between gap-4">
                        <span className="truncate text-sm text-foreground">{ref.source}</span>
                        <span className="shrink-0 text-sm font-medium text-muted-foreground">
                          {ref.count.toLocaleString()} visits
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
