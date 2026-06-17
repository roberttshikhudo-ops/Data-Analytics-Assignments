"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Loader2, Mail, Users } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Subscriber {
  id: string
  email: string
  source: string | null
  discount_code: string | null
  is_active: boolean
  created_at: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/subscribers")
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || "Failed to load subscribers")
          return
        }
        setSubscribers(data.subscribers || [])
      } catch {
        toast.error("Failed to load subscribers")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  function exportCsv() {
    if (subscribers.length === 0) {
      toast.error("No subscribers to export")
      return
    }
    const header = ["Email", "Source", "Discount Code", "Status", "Subscribed On"]
    const rows = subscribers.map((s) => [
      s.email,
      s.source || "",
      s.discount_code || "",
      s.is_active ? "Active" : "Inactive",
      format(new Date(s.created_at), "yyyy-MM-dd"),
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agrihub-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Subscribers exported")
  }

  const thisMonth = subscribers.filter((s) => {
    const d = new Date(s.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscribers</h1>
          <p className="text-muted-foreground">
            Newsletter sign-ups captured from your website
          </p>
        </div>
        <Button onClick={exportCsv} disabled={subscribers.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Month
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.email}</TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {s.source || "website"}
                </TableCell>
                <TableCell className="font-mono">{s.discount_code || "-"}</TableCell>
                <TableCell>
                  <Badge variant={s.is_active ? "default" : "secondary"}>
                    {s.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(s.created_at), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {subscribers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No subscribers yet. They&apos;ll appear here as visitors sign up.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
