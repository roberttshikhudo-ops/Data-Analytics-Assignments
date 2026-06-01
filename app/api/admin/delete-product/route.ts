import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")
  const name = searchParams.get("name")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!name) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("name", name)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({ 
    success: true, 
    message: `Deleted product: ${name}`,
    deleted: data[0]
  })
}
