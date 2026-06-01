import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const animalHealthProducts = [
  { name: "Bells Cows", price: 121, subcategory: "Bells", description: "Bells for cattle - durable and loud for livestock tracking." },
  { name: "Bells Goat", price: 70, subcategory: "Bells", description: "Bells for goats - lightweight and effective for herd management." },
  { name: "Esb3 100g", price: 234, subcategory: "Chicken Meds", description: "Esb3 100g - Antibiotic treatment for poultry diseases." },
  { name: "Esb3 20g", price: 35, subcategory: "Chicken Meds", description: "Esb3 20g - Antibiotic treatment for poultry diseases." },
  { name: "Farmag (Aluminium Phosphide) Pill", price: 102, subcategory: "Chicken Meds", description: "Farmag fumigation pill for pest control in poultry houses." },
  { name: "Gardal 10% 200ml", price: 238, subcategory: "Animal Meds", description: "Gardal 10% 200ml - Dewormer for livestock." },
  { name: "Gumboro D78", price: 131, subcategory: "Chicken Meds", description: "Gumboro D78 - Vaccine for infectious bursal disease in chickens." },
  { name: "HITET 120 100ml", price: 262, subcategory: "Chicken Meds", description: "HITET 120 100ml - Long-acting antibiotic for poultry." },
  { name: "Ivermax 50ml", price: 200, subcategory: "Chicken Meds", description: "Ivermax 50ml - Ivermectin-based parasite treatment." },
  { name: "KEMPRIN 200ml", price: 245, subcategory: "Animal Meds", description: "KEMPRIN 200ml - Cypermethrin insecticide for external parasite control." },
  { name: "MALASOL 100ml", price: 143, subcategory: "Animal Meds", description: "Malasol 100ml - Insecticide for tick and fly control." },
  { name: "Malasol 200ml", price: 240, subcategory: "Animal Meds", description: "Malasol 200ml - Insecticide for tick and fly control on livestock." },
  { name: "Moflo Dreiniger 1L", price: 299, subcategory: "Other", description: "Moflo Dreiniger 1L - Cleaning solution for animal equipment." },
  { name: "Mycoguard 720 SC 100ml", price: 174, subcategory: "Namtag", description: "Mycoguard 720 SC 100ml - Fungicide for animal health applications." },
  { name: "Namtag Skaap Blou/25", price: 228, subcategory: "Namtag", description: "Namtag Sheep Blue - Pack of 25 ear tags for sheep identification." },
  { name: "Namtag Skaap Green/25", price: 228, subcategory: "Namtag", description: "Namtag Sheep Green - Pack of 25 ear tags for sheep identification." },
  { name: "Namtag Skaap Marron/25", price: 228, subcategory: "Namtag", description: "Namtag Sheep Maroon - Pack of 25 ear tags for sheep identification." },
  { name: "Namtag Skaap Orange/25", price: 228, subcategory: "Namtag", description: "Namtag Sheep Orange - Pack of 25 ear tags for sheep identification." },
  { name: "Namtag Loose", price: 10, subcategory: "Namtag", description: "Namtag Loose - Single ear tag for livestock identification." },
  { name: "Needle Injection Big (16g)", price: 11, subcategory: "Needles", description: "Injection needle 16g - Large gauge needle for livestock injections." },
  { name: "Needle Injection Big (24g Disposable)", price: 2, subcategory: "Needles", description: "Injection needle 24g - Disposable fine gauge needle." },
  { name: "Nuvan Profi 330ml", price: 226, subcategory: "Animal Meds", description: "Nuvan Profi 330ml - Fumigation fogger for pest control in animal housing." },
  { name: "Optiboost 100g", price: 81, subcategory: "Chicken Meds", description: "Optiboost 100g - Vitamin and mineral supplement for poultry." },
  { name: "Ovimim Gel (Sheep and Goats)", price: 162, subcategory: "Animal Meds", description: "Ovimim Gel - Mineral supplement gel for sheep and goats." },
  { name: "Snake Repellant RTU 500ml", price: 236, subcategory: "Animal Meds", description: "Snake Repellant RTU 500ml - Ready-to-use snake deterrent for animal areas." },
  { name: "Spraykill 1 50ml", price: 69, subcategory: "Chicken Meds", description: "Spraykill 1 50ml - Insecticide for ants, termites, crickets, and cockroaches." },
  { name: "Spraykill 3 50ml", price: 67, subcategory: "Chicken Meds", description: "Spraykill 3 50ml - Insecticide for aphids, beetles, moths, and white fly." },
  { name: "Spraykill 5 50ml", price: 68, subcategory: "Chicken Meds", description: "Spraykill 5 50ml - Insecticide for fruit fly control." },
  { name: "Stop Cough Night Time 100ml SC", price: 59, subcategory: "Chicken Meds", description: "Stop Cough Night Time 100ml - Respiratory treatment for poultry." },
  { name: "Stress Pack", price: 50, subcategory: "Chicken Meds", description: "Stress Pack - Electrolyte and vitamin supplement for stressed poultry." },
  { name: "Sulfazine 16%", price: 223, subcategory: "Animal Meds", description: "Sulfazine 16% - Sulfonamide antibiotic for livestock." },
  { name: "Sulmetrim Plus NF 100ml", price: 391, subcategory: "Animal Meds", description: "Sulmetrim Plus NF 100ml - Combination antibiotic for bacterial infections." },
  { name: "Supaspray Plus 440ml", price: 336, subcategory: "Animal Meds", description: "Supaspray Plus 440ml - Wound spray for livestock." },
  { name: "Supona Aerosol 385ml", price: 326, subcategory: "Animal Meds", description: "Supona Aerosol 385ml - Insecticide spray for external parasite control." },
  { name: "Surge Protector", price: 161, subcategory: "Animal Meds", description: "Surge Protector - Electrical protection for animal equipment." },
  { name: "Swab 3pkt", price: 30, subcategory: "Animal Meds", description: "Swab 3 pack - Medical swabs for wound cleaning and treatment." },
  { name: "Syringe Henke Ject", price: 4, subcategory: "Animal Meds", description: "Syringe Henke Ject - Disposable syringe for animal injections." },
  { name: "Tactic Cattle Spray 1L", price: 360, subcategory: "Cattle Meds", description: "Tactic Cattle Spray 1L - Pour-on treatment for tick and fly control on cattle." },
  { name: "Tactic Cattle Spray 500ml", price: 289, subcategory: "Cattle Meds", description: "Tactic Cattle Spray 500ml - Pour-on treatment for tick and fly control on cattle." },
  { name: "Terminex 350SC 500ml", price: 875, subcategory: "Terminex", description: "Terminex 350SC 500ml - Termite and pest control concentrate." },
  { name: "Terminex 350SC 50ml", price: 358, subcategory: "Terminex", description: "Terminex 350SC 50ml - Termite and pest control concentrate." },
  { name: "Terramycin", price: 310, subcategory: "Terramycin", description: "Terramycin - Broad-spectrum antibiotic ointment for livestock." },
  { name: "Terramycin LA Insp 100ml", price: 413, subcategory: "Terramycin", description: "Terramycin LA Injectable 100ml - Long-acting antibiotic injection." },
  { name: "Triatix 12.5% 500ml", price: 274, subcategory: "Animal Meds", description: "Triatix 12.5% 500ml - Acaricide for tick control on livestock." },
  { name: "Valbazen for Cattle 200ml", price: 316, subcategory: "Cattle Meds", description: "Valbazen for Cattle 200ml - Broad-spectrum dewormer for cattle." },
  { name: "Valbazen Sheep and Goat", price: 275, subcategory: "Animal Meds", description: "Valbazen for Sheep and Goats - Broad-spectrum dewormer." },
  { name: "Virukill 1L", price: 167, subcategory: "Chicken Meds", description: "Virukill 1L - Disinfectant for poultry houses and equipment." },
  { name: "Vitamin (Cattle)", price: 296, subcategory: "Animal Meds", description: "Vitamin injection for cattle - Multi-vitamin supplement." },
  { name: "Shonalanga Mixed Foul Feed", price: 55, subcategory: "Shonalanga Feeds", description: "Shonalanga Mixed Fowl Feed - Complete nutrition for poultry." },
]

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get("key")

    if (seedKey !== "agrihub-seed-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get animal-health category
    const { data: category, error: catError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("slug", "animal-health")
      .single()

    if (catError || !category) {
      return NextResponse.json(
        { error: "Animal Health category not found", details: catError },
        { status: 404 }
      )
    }

    // Get existing products in animal-health category to avoid duplicates
    const { data: existingProducts } = await supabase
      .from("products")
      .select("name")
      .eq("category_id", category.id)

    const existingNames = new Set(
      existingProducts?.map((p) => p.name.toLowerCase()) || []
    )

    // Filter out products that already exist
    const newProducts = animalHealthProducts.filter(
      (p) => !existingNames.has(p.name.toLowerCase())
    )

    if (newProducts.length === 0) {
      return NextResponse.json({
        message: "All products already exist",
        existingCount: existingProducts?.length || 0,
      })
    }

    // Insert new products
    const results: { name: string; status: string; message: string }[] = []

    for (const product of newProducts) {
      const { error: insertError } = await supabase.from("products").insert({
        name: product.name,
        slug: generateSlug(product.name),
        price: product.price,
        category_id: category.id,
        stock_quantity: 100,
        description: product.description,
        short_description: product.subcategory,
        brand: product.subcategory,
        is_active: true,
        is_new: true,
      })

      if (insertError) {
        results.push({
          name: product.name,
          status: "error",
          message: insertError.message,
        })
      } else {
        results.push({
          name: product.name,
          status: "success",
          message: "Added successfully",
        })
      }
    }

    const successCount = results.filter((r) => r.status === "success").length
    const errorCount = results.filter((r) => r.status === "error").length

    return NextResponse.json({
      success: true,
      message: `Added ${successCount} new animal health products, errors: ${errorCount}`,
      categoryId: category.id,
      categoryName: category.name,
      addedProducts: successCount,
      skippedCount: animalHealthProducts.length - newProducts.length,
      results,
    })
  } catch (error) {
    console.error("Error adding animal health products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
