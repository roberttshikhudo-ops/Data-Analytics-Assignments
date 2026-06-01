import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

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

  // Get or create categories
  const categories = [
    { name: "PPE & Safety", slug: "ppe-safety" },
    { name: "Pet Supplies", slug: "pet-supplies" },
    { name: "Animal Feeds", slug: "animal-feeds" },
    { name: "Electrical", slug: "electrical" },
    { name: "Cleaning Supplies", slug: "cleaning-supplies" },
    { name: "Tools & Hardware", slug: "tools-hardware" },
  ]

  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", cat.slug)
      .single()

    if (existing) {
      categoryMap[cat.name] = existing.id
    } else {
      const { data: newCat } = await supabase
        .from("categories")
        .insert({ name: cat.name, slug: cat.slug })
        .select("id")
        .single()
      if (newCat) categoryMap[cat.name] = newCat.id
    }
  }

  const products = [
    // PPE & Safety
    {
      name: "Safety Bib with Reflective Tape Orange",
      description: "High visibility orange safety bib vest with reflective tape strip and yellow trim. Side tie straps for adjustable fit.",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BIB%20SAFETY%20%2B%20REFL.%20TAPE%20ORNG-Sh3ZGk9cPeoITrxvmmQu55Cexvqy3H.jpg",
      category_id: categoryMap["PPE & Safety"],
      stock_quantity: 100,
      sku: "PPE-BIB-ORNG-001"
    },
    {
      name: "Safety Bib with Reflective Tape Lime",
      description: "High visibility lime green safety bib vest with reflective tape strip and black trim. Side tie straps for adjustable fit.",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BIB%20SAFETY%20%2B%20REFL.%20TAPE%20LIME-xv9KMOrr1ZDMlaj9jWMLiU09k9OaJE.jpg",
      category_id: categoryMap["PPE & Safety"],
      stock_quantity: 100,
      sku: "PPE-BIB-LIME-001"
    },
    // Pet Supplies - Complete brand
    {
      name: "Complete Dog Food Tin Beef Goulash 775g",
      description: "Complete Chunky Meat Loaf wet dog food in beef goulash flavour. 6% protein, fresh meat, natural ingredients. For small to giant breed adult dogs.",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20DOG%20FOOD%20TIN%20BEEF%20GOULASH%20775G-WT97ronDGIKKZ1YKyrRw9F1szIX8Zj.jpg",
      category_id: categoryMap["Pet Supplies"],
      stock_quantity: 50,
      sku: "PET-COMP-BEEF-775",
      supplier: "Complete"
    },
    {
      name: "Complete Dog Food Tin Mixed Grill 775g",
      description: "Complete Chunky Meat Loaf wet dog food in mixed grill flavour. 6% protein, fresh meat, natural ingredients. For small to giant breed adult dogs.",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20DOG%20FOOD%20TIN%20MIXED%20GRILL%20775G-gPBm0vlqBQ5WzLaMp00eBPsLApkTGC.jpg",
      category_id: categoryMap["Pet Supplies"],
      stock_quantity: 50,
      sku: "PET-COMP-MIXED-775",
      supplier: "Complete"
    },
    {
      name: "Complete Dog Biscuits Snack-A-Chew Roast Lamb 1kg",
      description: "Complete oven-baked dog biscuits in roast lamb flavour. Small bite, hard-baked to clean teeth. 16% protein, natural ingredients. Free from soya, sugar and artificial colours.",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20DOG%20BISCUITS%20SNACK-A-CHEW%20R%20LAMB%20SML%201KG-FuQcvYqggR237oenqHh96tj2LKH2DW.jpg",
      category_id: categoryMap["Pet Supplies"],
      stock_quantity: 40,
      sku: "PET-COMP-BISC-LAMB",
      supplier: "Complete"
    },
    {
      name: "Complete Dog Biscuits Snack-A-Chew BBQ 1kg",
      description: "Complete oven-baked dog biscuits in BBQ flavour. Small bite, hard-baked to clean teeth. 16% protein, natural ingredients. Free from soya, sugar and artificial colours.",
      price: 65,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPLETE%20DOG%20BISCUITS%20SNACK-A-CHEW%20BBQ%20SML%201KG-vvkUNjdubjaoqzlvTkGi15APlKiqTl.jpg",
      category_id: categoryMap["Pet Supplies"],
      stock_quantity: 40,
      sku: "PET-COMP-BISC-BBQ",
      supplier: "Complete"
    },
    // Animal Feeds - Brennco
    {
      name: "Brennco Whole Yellow Maize 2kg",
      description: "Brennco whole yellow maize for poultry feeding. Quality grain for chickens and other poultry.",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BRENNCO%20MAIZE%20WHOLE%20YELLOW%202KG-EDvZ2DTzxnzYcT8Ivb5ZL1jBEleKLD.jpg",
      category_id: categoryMap["Animal Feeds"],
      stock_quantity: 60,
      sku: "FEED-BREN-MAIZE-2",
      supplier: "Brennco"
    },
    {
      name: "Brennco Chick Chick No.2 10kg",
      description: "Brennco Chick Chick No.2 starter feed for young chicks. Crushed grain mixture for optimal growth.",
      price: 145,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BRENNCO%20SEED%20CHICK%20CHICK%20NO%202%2010KG-394w6RU48mwc4KlKVwdkk9KDEFA8of.jpg",
      category_id: categoryMap["Animal Feeds"],
      stock_quantity: 30,
      sku: "FEED-BREN-CHICK-10",
      supplier: "Brennco"
    },
    {
      name: "Brennco Mixed Poultry Grain 2kg",
      description: "Brennco mixed poultry grain feed. Balanced mix of grains for chickens and poultry.",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BRENNCO%20GRAIN%20MIXED%20POULTRY%202KG-lg7WyQLWZRJC0zWnBIpgEKzG6JteIF.jpg",
      category_id: categoryMap["Animal Feeds"],
      stock_quantity: 50,
      sku: "FEED-BREN-MIX-2",
      supplier: "Brennco"
    },
    {
      name: "Brennco Mixed Poultry Grain 5kg",
      description: "Brennco mixed poultry grain feed. Balanced mix of grains for chickens and poultry.",
      price: 85,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BRENNCO%20GRAIN%20MIXED%20POULTRY%205KG-3WXXG7w2CHZK3uXRs02rHcCfT75zAZ.jpg",
      category_id: categoryMap["Animal Feeds"],
      stock_quantity: 40,
      sku: "FEED-BREN-MIX-5",
      supplier: "Brennco"
    },
    {
      name: "Brennco Mixed Poultry Grain 10kg",
      description: "Brennco mixed poultry grain feed. Balanced mix of grains for chickens and poultry.",
      price: 155,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BRENNCO%20GRAIN%20MIXED%20POULTRY%2010KG-kl3BOAXyDA08NQvPo5jTgRXCkpZrq6.jpg",
      category_id: categoryMap["Animal Feeds"],
      stock_quantity: 25,
      sku: "FEED-BREN-MIX-10",
      supplier: "Brennco"
    },
    // Electrical
    {
      name: "Conduit Adaptor Female SABS 20mm",
      description: "White PVC female conduit adaptor, 20mm. SABS approved for electrical installations.",
      price: 8,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONDUIT%20ADAPTOR%20FEMALE%20SABS%2020MM-gdpyxWIDuqcaaUmMrcTKBXKbWx7Wj3.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 200,
      sku: "ELEC-COND-ADPT-20"
    },
    {
      name: "Conduit Coupling 25mm",
      description: "White PVC conduit coupling, 25mm. For joining conduit pipes in electrical installations.",
      price: 6,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONDUIT%20COUPLING%2025MM-cIZwQUm6sDZHdoezmiVLeVAPubTtFK.jpg",
      category_id: categoryMap["Electrical"],
      stock_quantity: 200,
      sku: "ELEC-COND-COUP-25"
    },
    // Cleaning Supplies
    {
      name: "All-Rite Multi-Purpose Cleaner Trigger Bottle 750ml",
      description: "All-Rite multi-purpose cleaner in trigger spray bottle. Cleans around all rooms, cuts fat and stains. 750ml.",
      price: 35,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALL-RITE%20TRIGGER%20BOTTLE%20ONLY%20750ML-8tezKjbP4tDxNxQ2hTUzVKIw5tKtSO.jpg",
      category_id: categoryMap["Cleaning Supplies"],
      stock_quantity: 60,
      sku: "CLN-ALLR-MULTI-750",
      supplier: "All-Rite"
    },
    {
      name: "All-Rite Heavy Industrial Cleaner 750ml",
      description: "All-Rite heavy duty industrial cleaner in trigger spray bottle. For workshop and industrial use. 750ml.",
      price: 45,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALL-RITE%20MULTI%20PURPOSE%20CLEANER%20H%20DUTY%20750ML-wlYkNwqiRaLeruTaeHvlmscahTIy9O.jpg",
      category_id: categoryMap["Cleaning Supplies"],
      stock_quantity: 50,
      sku: "CLN-ALLR-HEAVY-750",
      supplier: "All-Rite"
    },
    // Tools
    {
      name: "Andor Diamond Disc Segmented 125x2.7mm",
      description: "Andor Diamond segmented cutting disc for wet or dry cutting. Universal SS type, 125 x 2.0/7 x 22.23mm. Max RPM 12200. EN13236 certified.",
      price: 95,
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ANDOR%20DIAMOND%20DISC%20SEGMENTED%20SS%20125X2.7MM-tjq1kymbxm9gRBGY3RHpp4u1v0MmXU.jpg",
      category_id: categoryMap["Tools & Hardware"],
      stock_quantity: 30,
      sku: "TOOL-ANDOR-DISC-125",
      supplier: "Andor"
    },
  ]

  const results = []
  for (const product of products) {
    const productWithSlug = {
      ...product,
      slug: generateSlug(product.name)
    }
    const { data, error } = await supabase
      .from("products")
      .insert(productWithSlug)
      .select("id, name")
      .single()

    if (error) {
      results.push({ name: product.name, error: error.message })
    } else {
      results.push({ name: product.name, id: data.id, success: true })
    }
  }

  return NextResponse.json({
    message: "Mixed batch products seeded",
    count: results.filter(r => r.success).length,
    results
  })
}
