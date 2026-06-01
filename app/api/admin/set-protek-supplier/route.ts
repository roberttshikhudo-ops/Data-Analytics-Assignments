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

  // Update all products with "Protek" in the name to have supplier = "Protek"
  const { data, error } = await supabase
    .from("products")
    .update({ supplier: "Protek" })
    .ilike("name", "Protek%")
    .select("id, name, supplier")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: `Updated ${data?.length || 0} products with supplier "Protek"`,
    products: data
  })
}
