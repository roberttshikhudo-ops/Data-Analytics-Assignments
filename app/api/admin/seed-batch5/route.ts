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

  // Get or create Pet Supplies category
  const { data: petCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "pet-supplies")
    .single()

  const categoryId = petCategory?.id

  const products = [
    {
      name: "Whiskas Cat Food Meaty Nugget Beef Lamb Rabbit 2kg",
      slug: "whiskas-cat-food-meaty-nugget-beef-lamb-rabbit-2kg",
      description: "Whiskas adult cat food with gourmet meat platter and meaty nuggets. Made with beef, lamb, and rabbit for a delicious taste sensation your cat will love. For adult cats 1 year and older. 2kg bag with zip for freshness.",
      short_description: "Whiskas adult cat food with beef, lamb & rabbit - 2kg",
      price: 185,
      compare_at_price: 210,
      sku: "WHISK-BEEF-2KG",
      stock_quantity: 30,
      low_stock_threshold: 5,
      category_id: categoryId,
      brand: "Whiskas",
      is_active: true,
      is_featured: false,
      is_new: true,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHISKAS%20CAT%20FOOD%20MEATY%20NUGGET%20BEEF%20LAMB%20RABBIT%202KG-BEDqD85AjC02qN6RblyoedYFisC4Fx.jpg",
    },
    {
      name: "Whiskas Cat Food Meaty Nugget Kitten Chicken 900g",
      slug: "whiskas-cat-food-meaty-nugget-kitten-chicken-900g",
      description: "Whiskas kitten food specially formulated for kittens 1-12 months old. Contains delectable chicken and milky plus nuggets to support healthy growth and development. 900g bag.",
      short_description: "Whiskas kitten food with chicken - 900g",
      price: 95,
      compare_at_price: 110,
      sku: "WHISK-KIT-900G",
      stock_quantity: 25,
      low_stock_threshold: 5,
      category_id: categoryId,
      brand: "Whiskas",
      is_active: true,
      is_featured: false,
      is_new: true,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHISKAS%20CAT%20FOOD%20MEATY%20NUGGET%20KITTEN%20CHICKEN%20900G-zrA6qkja454dRBXPhobN4wj26AYWRa.jpg",
    },
    {
      name: "Whiskas Cat Food Pouch Bulk Multipack Fish & Meat 12x85g",
      slug: "whiskas-cat-food-pouch-bulk-multipack-fish-meat-12x85g",
      description: "Whiskas wet cat food multipack with fish and meat selection in jelly. Includes 12 pouches (85g each) with beef, salmon, chicken, and tuna flavors. Complete and balanced nutrition for adult cats 1+ years.",
      short_description: "Whiskas wet food multipack - 12x85g pouches",
      price: 165,
      compare_at_price: 195,
      sku: "WHISK-POUCH-12PK",
      stock_quantity: 20,
      low_stock_threshold: 5,
      category_id: categoryId,
      brand: "Whiskas",
      is_active: true,
      is_featured: true,
      is_new: true,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHISKAS%20CAT%20FOOD%20POUCH%20BULK%20MULTIPACK%20FISH%20%26%20MEAT-lxFhXAKKwQMGil4poRgO5iWJw9MIPq.jpg",
    },
  ]

  const results = []

  for (const product of products) {
    const { data, error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "slug" })
      .select()

    if (error) {
      results.push({ name: product.name, error: error.message })
    } else {
      results.push({ name: product.name, success: true })
    }
  }

  return NextResponse.json({
    message: "Batch 5 products added",
    count: products.length,
    results,
  })
}
