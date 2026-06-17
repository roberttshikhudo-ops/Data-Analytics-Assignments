import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const path = typeof body.path === "string" ? body.path.slice(0, 512) : null

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 })
    }

    // Skip admin and auth pages - we only want public store traffic
    if (path.startsWith("/admin") || path.startsWith("/auth") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 512) : null
    const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 64) : null
    const userAgent = request.headers.get("user-agent")?.slice(0, 512) ?? null

    const supabase = createAdminClient()
    const { error } = await supabase.from("page_views").insert({
      path,
      referrer,
      visitor_id: visitorId,
      user_agent: userAgent,
    })

    if (error) {
      console.log("[v0] page view insert error:", error.message)
      return NextResponse.json({ error: "Failed to record" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
