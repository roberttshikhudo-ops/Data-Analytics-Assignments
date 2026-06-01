import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all products with their categories
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      image_url,
      categories (
        id,
        name
      )
    `)
    .eq("is_active", true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Count products with custom images (from vercel blob storage)
  const withCustomImages = products?.filter(p => 
    p.image_url && (
      p.image_url.includes("hebbkx1anhila5yf.public.blob.vercel-storage.com") ||
      p.image_url.includes("blobs.vusercontent.net")
    )
  ).length || 0

  const withAnyImage = products?.filter(p => p.image_url).length || 0

  // Group by category
  const categoryCount: Record<string, { count: number, withCustomImage: number }> = {}
  
  products?.forEach(p => {
    const catName = (p.categories as any)?.name || "Uncategorized"
    if (!categoryCount[catName]) {
      categoryCount[catName] = { count: 0, withCustomImage: 0 }
    }
    categoryCount[catName].count++
    if (p.image_url && (
      p.image_url.includes("hebbkx1anhila5yf.public.blob.vercel-storage.com") ||
      p.image_url.includes("blobs.vusercontent.net")
    )) {
      categoryCount[catName].withCustomImage++
    }
  })

  // Sort by count descending
  const byCategory = Object.entries(categoryCount)
    .map(([name, data]) => ({ category: name, ...data }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({
    total_products: products?.length || 0,
    with_any_image: withAnyImage,
    with_custom_images: withCustomImages,
    by_category: byCategory
  })
}
