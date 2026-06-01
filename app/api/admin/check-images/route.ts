import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createAdminClient()

  // Get all products
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image_url, slug")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Check for issues
  const issues = []
  const valid = []

  for (const product of products || []) {
    const hasImage = product.image_url && product.image_url.startsWith("https://")
    
    if (!hasImage) {
      issues.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image_url: product.image_url || "NULL",
        issue: "Missing or invalid image URL"
      })
    } else {
      valid.push({
        id: product.id,
        name: product.name,
        image_url: product.image_url
      })
    }
  }

  return NextResponse.json({
    total: products?.length || 0,
    valid_count: valid.length,
    issues_count: issues.length,
    issues: issues,
    message: issues.length === 0 ? "All products have valid images!" : `Found ${issues.length} products with image issues`
  })
}
