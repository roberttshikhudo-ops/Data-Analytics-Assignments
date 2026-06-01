import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // First, add the supplier column using raw SQL via RPC
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql_query: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier TEXT;'
  })

  // If RPC doesn't exist, try direct approach - the column might already exist
  // or we need to add it via Supabase dashboard

  // Update all products with "Protek" in name to have supplier = "Protek"
  const { data, error } = await supabase
    .from("products")
    .update({ supplier: "Protek" })
    .ilike("name", "Protek%")
    .select("id, name")

  if (error) {
    // If supplier column doesn't exist, return instructions
    if (error.message.includes("supplier")) {
      return NextResponse.json({
        error: "Supplier column doesn't exist. Please run this SQL in Supabase dashboard:",
        sql: "ALTER TABLE products ADD COLUMN supplier TEXT;",
        then: "Then re-run this endpoint"
      }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    updated: data?.length || 0,
    products: data
  })
}
