import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Returns recent successfully-paid orders for the admin "new orders" bell.
// This is an on-screen backup to the WhatsApp purchase alerts, so the owner
// always has a record of paid orders even if WhatsApp delivery ever fails.
export async function GET(request: Request) {
  const supabase = await createClient()

  // Verify the caller is a signed-in admin.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Optional "since" filter (ISO timestamp) so the client only fetches orders
  // newer than the last one it has already seen.
  const { searchParams } = new URL(request.url)
  const since = searchParams.get("since")

  let query = supabase
    .from("orders")
    .select("id, order_number, total, status, created_at")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .limit(20)

  if (since) {
    query = query.gt("created_at", since)
  }

  const { data: orders, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ orders: orders ?? [] })
}
