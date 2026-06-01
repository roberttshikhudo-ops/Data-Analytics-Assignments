import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Animal health product images - real images from South African agricultural suppliers (BKB Online, Hinterland)
const animalHealthImages: Record<string, string> = {
  // Terramycin products - from BKB Online/Hinterland
  "Terramycin Eye Ointment": "https://www.hinterland.co.za/cdn/shop/files/terr_100ml_220x220.png?v=1724406041",
  "Terramycin": "https://www.hinterland.co.za/cdn/shop/files/terr_100ml_220x220.png?v=1724406041",
  "Terramycin LA Insp 100ml": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  
  // Valbazen dewormers - from BKB Online
  "Valbazen for Cattle 200ml": "https://bkbonline.co.za/cdn/shop/files/0000298.jpg?v=1741330177&width=400",
  "Valbazen Sheep and Goat": "https://bkbonline.co.za/cdn/shop/files/0000294.jpg?v=1741266037&width=400",
  
  // Tick dips and parasite control - from BKB Online
  "Tick and Flea Dip 1L": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-a3AczXzZdWhkfOiPTxQ8yrwVkEbfua.png", // User provided Eraditick image
  "Tick Grease 500g": "https://bkbonline.co.za/cdn/shop/files/AFRIVETERADITICK2505L.jpg?v=1741870137&width=400",
  "Tactic Cattle Spray 1L": "https://bkbonline.co.za/cdn/shop/files/0024488.png?v=1749802099&width=400",
  "Tactic Cattle Spray 500ml": "https://bkbonline.co.za/cdn/shop/files/0024488.png?v=1749802099&width=400",
  "Triatix 12.5% 500ml": "https://bkbonline.co.za/cdn/shop/files/All_Online_Product_Photos_62a01ee9-f7ec-42f5-9a87-3afad333a826.jpg?v=1749796543&width=400",
  "MALASOL 100ml": "https://bkbonline.co.za/cdn/shop/files/7014844_634b00d0-4352-46b1-9839-c126db25f0d1.jpg?v=1746473191&width=400",
  "Malasol 200ml": "https://bkbonline.co.za/cdn/shop/files/7014844_634b00d0-4352-46b1-9839-c126db25f0d1.jpg?v=1746473191&width=400",
  "KEMPRIN 200ml": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_49c311f0-b397-49ed-b7a9-278693394a0f.jpg?v=1749811652&width=400",
  
  // Wound sprays - from BKB Online
  "Wound Spray Blue 500ml": "https://bkbonline.co.za/cdn/shop/files/All_Online_Product_Photos_0f8de38c-ac8f-4bbc-8a33-9b2286beb43a.jpg?v=1749648508&width=400",
  "Supaspray Plus 440ml": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_13730014-c437-40d6-af7c-0200b6ebc917.jpg?v=1749647854&width=400",
  "Supona Aerosol 385ml": "https://bkbonline.co.za/cdn/shop/files/0006364.jpg?v=1749123616&width=400",
  
  // Vitamins and supplements - from BKB Online
  "Vitamin Injection 100ml": "https://bkbonline.co.za/cdn/shop/files/0026796.jpg?v=1747923011&width=400",
  "Vitamin (Cattle)": "https://bkbonline.co.za/cdn/shop/files/435070-6f09f4.png?v=1749803242&width=400",
  "Calcium Injection 100ml": "https://bkbonline.co.za/cdn/shop/files/0036857.jpg?v=1741330928&width=400",
  
  // Antibiotics and medicines - using similar product images
  "Antibiotic Powder 100g": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "HITET 120 100ml": "https://bkbonline.co.za/cdn/shop/files/6b0ac4b4c54c0443f4ce7dd83f626aba.jpg?v=1747918815&width=400",
  "Esb3 20g": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "Esb3 100g": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "Optiboost 100g": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "Sulmetrim Plus NF 100ml": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "Sulfazine 16%": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "Stress Pack": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "Stop Cough Night Time 100ml SC": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "Ovimim Gel (Sheep and Goats)": "https://bkbonline.co.za/cdn/shop/files/Virbac-Prodose-Orange-500ml.png?v=1749803290&width=400",
  "Gumboro D78": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  
  // Dewormers - from BKB Online
  "Cattle Dewormer Pour-On 1L": "https://bkbonline.co.za/cdn/shop/files/0034383_bfd2cd51-f311-4aaa-8830-b59347bc4b81.jpg?v=1749123907&width=400",
  "Cattle Dewormer Pour-On 2.5L": "https://bkbonline.co.za/cdn/shop/files/0034383_bfd2cd51-f311-4aaa-8830-b59347bc4b81.jpg?v=1749123907&width=400",
  "Poultry Dewormer 100ml": "https://bkbonline.co.za/cdn/shop/files/7015819.png?v=1746552567&width=400",
  "Sheep Dewormer 1L": "https://bkbonline.co.za/cdn/shop/files/0000294.jpg?v=1741266037&width=400",
  "Ivermax 50ml": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_cb886450-4a43-4b09-ac33-d70d1b98f0a1.jpg?v=1749795443&width=400",
  "Gardal 10% 200ml": "https://bkbonline.co.za/cdn/shop/files/0011861.jpg?v=1749811246&width=400",
  
  // Additional sprays and treatments
  "Hoof Care Oil 500ml": "https://bkbonline.co.za/cdn/shop/files/expel-spray.jpg?v=1749802814&width=400",
  "Spraykill 1 50ml": "https://bkbonline.co.za/cdn/shop/files/70197703_7d1cd5a5-b743-4076-8834-ae493f5dad91.jpg?v=1741330995&width=400",
  "Spraykill 3 50ml": "https://bkbonline.co.za/cdn/shop/files/70197703_7d1cd5a5-b743-4076-8834-ae493f5dad91.jpg?v=1741330995&width=400",
  "Spraykill 5 50ml": "https://bkbonline.co.za/cdn/shop/files/70197703_7d1cd5a5-b743-4076-8834-ae493f5dad91.jpg?v=1741330995&width=400",
  "Snake Repellant RTU 500ml": "https://bkbonline.co.za/cdn/shop/files/expel-spray.jpg?v=1749802814&width=400",
  "Virukill 1L": "https://bkbonline.co.za/cdn/shop/files/IondineSpray.jpg?v=1742652936&width=400",
  "Moflo Dreiniger 1L": "https://bkbonline.co.za/cdn/shop/files/IondineSpray.jpg?v=1742652936&width=400",
  
  // Supplements and minerals - using appropriate livestock images
  "Mineral Lick Block 10kg": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=400&fit=crop",
  "Mineral Lick Block 20kg": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=400&fit=crop",
  "Salt Lick Block 10kg": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=400&fit=crop",
  
  // Equipment and tools
  "Castration Ring Applicator": "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=400&fit=crop",
  "Castration Rings 100 Pack": "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=400&fit=crop",
  "Ear Tags Cattle 25 Pack": "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=400&fit=crop",
  "Needle 18G Box 100": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop",
  "Needle Injection Big (16g)": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop",
  "Needle Injection Big (24g Disposable)": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop",
  "Syringe 20ml Disposable 10 Pack": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop",
  "Syringe Henke Ject": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop",
  "Swab 3pkt": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop",
  
  // Ear tags - Namtag
  "Namtag Skaap Orange/25": "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=400&fit=crop",
  "Namtag Skaap Blou/25": "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=400&fit=crop",
  "Namtag Skaap Green/25": "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=400&fit=crop",
  "Namtag Skaap Marron/25": "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=400&fit=crop",
  "Namtag Loose": "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=400&fit=crop",
  
  // Bells
  "Bells Cows": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=400&fit=crop",
  "Bells Goat": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=400&fit=crop",
  
  // Terminex
  "Terminex 350SC 500ml": "https://bkbonline.co.za/cdn/shop/files/Maximus-1l.png?v=1749460062&width=400",
  "Terminex 350SC 50ml": "https://bkbonline.co.za/cdn/shop/files/Maximus-1l.png?v=1749460062&width=400",
  
  // Fumigation and pest control
  "Farmag (Aluminium Phosphide) Pill": "https://bkbonline.co.za/cdn/shop/files/AllOnlineProductPhotos_b457b4fc-72ab-492a-a251-7252bfca64e0.jpg?v=1749811988&width=400",
  "Surge Protector": "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=400&fit=crop",
  
  // Animal feed
  "Shonalanga Mixed Foul Feed": "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=400&fit=crop",
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get the animal-health category
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "animal-health")
    .single()

  if (categoryError || !category) {
    return NextResponse.json({ error: "Animal health category not found" }, { status: 404 })
  }

  // Get all products in the animal health category
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, image_url")
    .eq("category_id", category.id)

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 })
  }

  const updates: { name: string; oldImage: string | null; newImage: string }[] = []
  const notFound: string[] = []

  for (const product of products || []) {
    const newImageUrl = animalHealthImages[product.name]
    
    if (newImageUrl) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: newImageUrl })
        .eq("id", product.id)

      if (!updateError) {
        updates.push({
          name: product.name,
          oldImage: product.image_url,
          newImage: newImageUrl,
        })
      }
    } else {
      notFound.push(product.name)
    }
  }

  return NextResponse.json({
    success: true,
    totalProducts: products?.length || 0,
    updated: updates.length,
    notFoundInMapping: notFound,
    updates,
  })
}
