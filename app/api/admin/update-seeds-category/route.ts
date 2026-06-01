import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Helper to create supabase client
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST: Update all seeds to be in stock OR add a new product
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")
  const action = searchParams.get("action")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseClient()

  // If action is "list-categories", list all categories
  if (action === "list-categories") {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch categories", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, categories })
  }

  // If action is "list-animal-feeds", list all Animal Feeds products
  if (action === "list-animal-feeds") {
    const { data: animalFeedsCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "animal-feeds")
      .single()

    if (!animalFeedsCategory) {
      return NextResponse.json({ error: "Animal Feeds category not found" }, { status: 404 })
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity")
      .eq("category_id", animalFeedsCategory.id)
      .order("name")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, products, count: products?.length || 0 })
  }

  // If action is "list-plumbing", list all Plumbing products
  if (action === "list-plumbing") {
    const { data: plumbingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "plumbing")
      .single()

    if (!plumbingCategory) {
      return NextResponse.json({ error: "Plumbing category not found" }, { status: 404 })
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, image_url")
      .eq("category_id", plumbingCategory.id)
      .order("name")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, products, count: products?.length || 0 })
  }

  // If action is "list-home-living", list all Home & Living products
  if (action === "list-home-living") {
    const { data: homeLivingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "home-living")
      .single()

    if (!homeLivingCategory) {
      return NextResponse.json({ error: "Home & Living category not found" }, { status: 404 })
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, image_url")
      .eq("category_id", homeLivingCategory.id)
      .order("name")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, products, count: products?.length || 0 })
  }

  // If action is "list-electrical", list all Electrical products
  if (action === "list-electrical") {
    const { data: electricalCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "electrical")
      .single()

    if (!electricalCategory) {
      return NextResponse.json({ error: "Electrical category not found" }, { status: 404 })
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, image_url")
      .eq("category_id", electricalCategory.id)
      .order("name")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, products, count: products?.length || 0 })
  }

  // If action is "list-ppe", list all PPE products
  if (action === "list-ppe") {
    const { data: ppeCategories } = await supabase
      .from("categories")
      .select("id")
      .or("slug.eq.ppe,slug.eq.ppes,slug.eq.ppe-safety")

    if (!ppeCategories || ppeCategories.length === 0) {
      return NextResponse.json({ error: "PPE category not found" }, { status: 404 })
    }

    const categoryIds = ppeCategories.map(c => c.id)
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, image_url")
      .in("category_id", categoryIds)
      .order("name")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, products, count: products?.length || 0 })
  }

  // If action is "add-plumbing", add a new product to Plumbing category
  if (action === "add-plumbing") {
    const body = await request.json()
    const { name, price, subcategory } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const { data: plumbingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "plumbing")
      .single()

    if (!plumbingCategory) {
      return NextResponse.json({ error: "Plumbing category not found" }, { status: 404 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        price,
        description: subcategory ? `${subcategory} - ${name}` : name,
        category_id: plumbingCategory.id,
        stock_quantity: 100
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to add product", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  }

  // If action is "add-home-living", add a new product to Home & Living category
  if (action === "add-home-living") {
    const body = await request.json()
    const { name, price, image_url, description } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const { data: homeLivingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "home-living")
      .single()

    if (!homeLivingCategory) {
      return NextResponse.json({ error: "Home & Living category not found" }, { status: 404 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        price,
        description: description || name,
        category_id: homeLivingCategory.id,
        image_url: image_url || null,
        stock_quantity: 100
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to add product", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  }

  // If action is "add-electrical", add a new product to Electrical category
  if (action === "add-electrical") {
    const body = await request.json()
    const { name, price, subcategory } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const { data: electricalCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "electrical")
      .single()

    if (!electricalCategory) {
      return NextResponse.json({ error: "Electrical category not found" }, { status: 404 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        price,
        description: subcategory ? `${subcategory} - ${name}` : name,
        category_id: electricalCategory.id,
        stock_quantity: 100
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to add product", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  }

  // If action is "update-electrical-price", update an electrical product's price
  if (action === "update-electrical-price") {
    const body = await request.json()
    const { name, price } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const { data: electricalCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "electrical")
      .single()

    if (!electricalCategory) {
      return NextResponse.json({ error: "Electrical category not found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("products")
      .update({ price })
      .eq("name", name)
      .eq("category_id", electricalCategory.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update product price", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  }

  // If action is "add-animal-feed", add a new product to Animal Feeds category
  if (action === "add-animal-feed") {
    const body = await request.json()
    const { name, price, subcategory } = body

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const { data: animalFeedsCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "animal-feeds")
      .single()

    if (!animalFeedsCategory) {
      return NextResponse.json({ error: "Animal Feeds category not found" }, { status: 404 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        price,
        description: subcategory ? `${subcategory} - ${name}` : name,
        category_id: animalFeedsCategory.id,
        stock_quantity: 100
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to add product", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  }

  // If action is "rename-product", rename a product
  if (action === "rename-product") {
    const body = await request.json()
    const { old_name, new_name } = body

    if (!old_name || !new_name) {
      return NextResponse.json({ error: "old_name and new_name are required" }, { status: 400 })
    }

    const new_slug = new_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await supabase
      .from("products")
      .update({ name: new_name, slug: new_slug })
      .ilike("name", old_name)
      .select()

    if (error) {
      return NextResponse.json({ error: "Failed to rename product", details: error }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: `Product "${old_name}" not found` }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: data[0] })
  }

  // If action is "update-animal-feed-price", update a product's price
  if (action === "update-animal-feed-price") {
    const body = await request.json()
    const { name, price } = body

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("products")
      .update({ price })
      .ilike("name", name)
      .select()

    if (error) {
      return NextResponse.json({ error: "Failed to update price", details: error }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: `Product "${name}" not found` }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: data[0] })
  }

  // If action is "delete-product", delete a product by name
  if (action === "delete-product") {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("products")
      .delete()
      .ilike("name", name)
      .select()

    if (error) {
      return NextResponse.json({ error: "Failed to delete product", details: error }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: `Product "${name}" not found` }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: data[0] })
  }

  // If action is "all-in-stock", update ALL products to be in stock
  if (action === "all-in-stock") {
    const { data, error } = await supabase
      .from("products")
      .update({ stock_quantity: 100 })
      .gt("id", "00000000-0000-0000-0000-000000000000")
      .select("name")

    if (error) {
      return NextResponse.json({ error: "Failed to update stock", details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${data?.length || 0} products to in stock`,
      count: data?.length || 0
    })
  }

  // If action is "rename-category", rename a category
  if (action === "rename-category") {
    const body = await request.json()
    const { old_name, new_name } = body

    if (!old_name || !new_name) {
      return NextResponse.json({ error: "old_name and new_name are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("categories")
      .update({ name: new_name })
      .ilike("name", old_name)
      .select()

    if (error) {
      return NextResponse.json({ error: "Failed to rename category", details: error }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: `Category "${old_name}" not found` }, { status: 404 })
    }

    return NextResponse.json({ success: true, category: data[0] })
  }

  // Get the Seeds category
  const { data: seedsCategory } = await supabase
    .from("categories")
    .select("id")
    .or("slug.ilike.%seed%,name.ilike.%seed%")
    .single()

  if (!seedsCategory) {
    return NextResponse.json({ error: "Seeds category not found" }, { status: 404 })
  }

  // If action is "add", add a new product
  if (action === "add") {
    const body = await request.json()
    const { name, price, image_url, description } = body

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        price,
        description: description || `DKC Series - ${name}`,
        category_id: seedsCategory.id,
        image_url: image_url || null,
        stock_quantity: 100
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to add product", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  }

  // If action is "dkc-stock", update only DKC products to be in stock
  if (action === "dkc-stock") {
    const { data, error } = await supabase
      .from("products")
      .update({ stock_quantity: 100 })
      .eq("category_id", seedsCategory.id)
      .ilike("name", "DKC%")
      .select("name")

    if (error) {
      return NextResponse.json({ error: "Failed to update DKC stock", details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${data?.length || 0} DKC products to in stock`,
      products: data?.map(p => p.name)
    })
  }

  // Default: Update all products in the Seeds category to be in stock (set stock_quantity to 100)
  const { data, error } = await supabase
    .from("products")
    .update({ stock_quantity: 100 })
    .eq("category_id", seedsCategory.id)
    .select("name")

  if (error) {
    return NextResponse.json({ error: "Failed to update stock", details: error }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: `Updated ${data?.length || 0} seed products to in stock`,
    products: data?.map(p => p.name)
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Use service role to bypass RLS
  const supabase = getSupabaseClient()

  // Products from the PDF
  const seedProducts = [
    // Capstone Seeds
    { name: "Capstone Seeds (mbeu) 10kg", price: 450, subcategory: "Capstone Seeds" },
    { name: "Capstone Seeds (mbeu) 1kg", price: 60, subcategory: "Capstone Seeds" },
    { name: "Capstone Seeds (mbeu) 5kg", price: 300, subcategory: "Capstone Seeds" },
    // DKC Series
    { name: "DKC 73-72 2kg", price: 315, subcategory: "DKC Series" },
    { name: "DKC 73-74 10kg", price: 1952, subcategory: "DKC Series" },
    { name: "DKC 76-71 10kg", price: 1025, subcategory: "DKC Series" },
    { name: "DKC 76-77BR 10kg", price: 2296, subcategory: "DKC Series" },
    { name: "DKC 78-45 5kg", price: 1417, subcategory: "DKC Series" },
    { name: "DKC 73-72 5kg", price: 669, subcategory: "DKC Series" },
    { name: "DKC 73-74BR 2kg", price: 596, subcategory: "DKC Series" },
    { name: "DKC 73-74BR 5kg", price: 849, subcategory: "DKC Series" },
    { name: "DKC 74-74BR 5kg", price: 853, subcategory: "DKC Series" },
    { name: "DKC 76-71 2kg", price: 304, subcategory: "DKC Series" },
    { name: "DKC 76-71 5kg", price: 600, subcategory: "DKC Series" },
    { name: "DKC 76-73R 5kg", price: 844, subcategory: "DKC Series" },
    { name: "DKC 76-77BR 2kg", price: 520, subcategory: "DKC Series" },
    { name: "DKC 76-77BR 5kg", price: 1141, subcategory: "DKC Series" },
    { name: "DKC 80-40BR 2kg", price: 452, subcategory: "DKC Series" },
    { name: "DKC 80-40BR 5kg", price: 840, subcategory: "DKC Series" },
    { name: "DKC 78-45BR 2kg", price: 520, subcategory: "DKC Series" },
    { name: "DKC 78-45BR 5kg", price: 872, subcategory: "DKC Series" },
    // Sahara Yellow
    { name: "Maize Seeds Sahara Yellow 10kg", price: 720, subcategory: "Sahara Yellow" },
    { name: "Maize Seeds Sahara Yellow 1kg", price: 115, subcategory: "Sahara Yellow" },
    { name: "Maize Seeds Sahara Yellow 2kg", price: 210, subcategory: "Sahara Yellow" },
    { name: "Maize Seeds Sahara Yellow 5kg", price: 360, subcategory: "Sahara Yellow" },
    // Zama Mbeu
    { name: "Maize Zama Selects White 10kg", price: 679, subcategory: "Zama Mbeu" },
    { name: "Maize Zama Selects White 1kg", price: 94, subcategory: "Zama Mbeu" },
    { name: "Maize Zama Selects White 2kg", price: 164, subcategory: "Zama Mbeu" },
    { name: "Maize Zama Selects White 500g", price: 70, subcategory: "Zama Mbeu" },
    { name: "Maize Zama Selects White 5kg", price: 342, subcategory: "Zama Mbeu" },
    // Vegetables - Mayford
    { name: "Mayford Seeds", price: 35, subcategory: "Mayford" },
    // Vegetables - Sakata
    { name: "Sakata Beetroot", price: 105, subcategory: "Sakata" },
    { name: "Sakata Green Pepper", price: 555, subcategory: "Sakata" },
    { name: "Sakata Mustard", price: 105, subcategory: "Sakata" },
    { name: "Sakata Swisschard", price: 121, subcategory: "Sakata" },
    { name: "Sakata Tomato", price: 459, subcategory: "Sakata" },
  ]

  // Get the Seeds category
  const { data: seedsCategory } = await supabase
    .from("categories")
    .select("id")
    .or("slug.ilike.%seed%,name.ilike.%seed%")
    .single()

  let categoryId = seedsCategory?.id

  // If no seeds category exists, create one
  if (!categoryId) {
    const { data: newCategory, error: catError } = await supabase
      .from("categories")
      .insert({
        name: "Seeds (Mbeu & Vegetables)",
        slug: "seeds-mbeu-vegetables",
        description: "Quality seeds for crops, maize, and vegetables"
      })
      .select("id")
      .single()

    if (catError) {
      return NextResponse.json({ error: "Failed to create category", details: catError }, { status: 500 })
    }
    categoryId = newCategory.id
  }

  // Get all current products in the Seeds category
  const { data: existingProducts } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("category_id", categoryId)

  const existingProductNames = existingProducts?.map(p => p.name.toLowerCase()) || []
  const pdfProductNames = seedProducts.map(p => p.name.toLowerCase())

  const results = {
    updated: [] as string[],
    added: [] as string[],
    removed: [] as string[],
    errors: [] as string[]
  }

  // Update or add products from the PDF
  for (const product of seedProducts) {
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if product exists (case-insensitive)
    const existingProduct = existingProducts?.find(
      p => p.name.toLowerCase() === product.name.toLowerCase()
    )

    if (existingProduct) {
      // Update the price
      const { error } = await supabase
        .from("products")
        .update({ price: product.price })
        .eq("id", existingProduct.id)

      if (error) {
        results.errors.push(`Failed to update ${product.name}: ${error.message}`)
      } else {
        results.updated.push(product.name)
      }
    } else {
      // Add new product
      const { error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          slug,
          price: product.price,
          description: `${product.subcategory} - ${product.name}`,
          category_id: categoryId
        })

      if (error) {
        results.errors.push(`Failed to add ${product.name}: ${error.message}`)
      } else {
        results.added.push(product.name)
      }
    }
  }

  // Remove products that are not in the PDF
  if (existingProducts) {
    for (const existing of existingProducts) {
      const isInPdf = pdfProductNames.some(
        pdfName => pdfName === existing.name.toLowerCase()
      )

      if (!isInPdf) {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", existing.id)

        if (error) {
          results.errors.push(`Failed to remove ${existing.name}: ${error.message}`)
        } else {
          results.removed.push(existing.name)
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    categoryId,
    summary: {
      updated: results.updated.length,
      added: results.added.length,
      removed: results.removed.length,
      errors: results.errors.length
    },
    details: results
  })
}
