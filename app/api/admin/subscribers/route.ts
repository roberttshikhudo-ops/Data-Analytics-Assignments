import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  return profile?.role === "admin"
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select("id, email, source, discount_code, is_active, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Failed to load subscribers:", error.message)
    return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 })
  }

  return NextResponse.json({ subscribers: data || [] })
}
