import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (key !== "agrihub-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get category IDs
  const { data: categories } = await supabase.from("categories").select("id, slug")
  const getCategoryId = (slug: string) => categories?.find((c) => c.slug === slug)?.id

  const products = [
    // Animal Health - Chemicals & Fertilizers
    {
      name: "Drastic Deadline 200ml",
      slug: "drastic-deadline-200ml",
      description: "Ectoparasiticide for instant use on cattle, sheep, ostriches and game. Controls ticks, botfly, lice and feather mites.",
      price: 185,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Deadline%20200ml-eT8EO6WaXP9VZbxbYdWD0KNCx12Dmv.jpg",
      supplier: "Bayer",
    },
    {
      name: "Efekto Cypermethrin 200EC 1L",
      slug: "efekto-cypermethrin-200ec-1l",
      description: "Emulsifiable concentrate insecticide for use on crops as indicated. Contact and stomach insecticide.",
      price: 245,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cypermetrin%201L-eNrrwY5Dm7X7jPm1ozkt8A5Kbkh2L3.jpg",
      supplier: "Efekto",
    },
    {
      name: "Doxy-Max 50% Powder 100g",
      slug: "doxy-max-50-powder-100g",
      description: "Water soluble powder for the treatment of bacterial respiratory disease and gastrointestinal infections in fowls.",
      price: 125,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Doxy%20Max%2050_-pNdQI6rIMVYkYPgAJ11WPXGl8ZnpMj.jpg",
      supplier: "Ascendis",
    },
    {
      name: "Doxymycin Eye Powder 50g",
      slug: "doxymycin-eye-powder-50g",
      description: "Eye powder remedy for ophthalmia in stock. For cattle, horses and sheep.",
      price: 95,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Doxymycin%20Eye%20powder-PENeplxeNn293GYtyDSSPHM4vNm7oY.jpg",
      supplier: "Bayer",
    },
    {
      name: "ESB-3 Powder 100g",
      slug: "esb3-powder-100g",
      description: "For the treatment and prevention of paratyphoid, salmonella and coccidiosis in pigeons and caged birds.",
      price: 145,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Esb3%20100g-PegRncQaXbNRZMdbW0wsRaVZzVSJJl.jpg",
      supplier: null,
    },
    {
      name: "ESB-3 Powder 20g",
      slug: "esb3-powder-20g",
      description: "Water soluble powder for the treatment of coccidiosis and infectious coryza in poultry.",
      price: 55,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Esb3%2020g-WsRlZUoMJsranrk1vrEGUHAaux3BNd.jpg",
      supplier: "Elanco",
    },
    {
      name: "Nobilis Gumboro D78 Vaccine 10000 Doses",
      slug: "nobilis-gumboro-d78-vaccine-10000",
      description: "Live lyophilisate vaccine for suspension against Gumboro disease (IBD) in poultry.",
      price: 495,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gumboro%20D78-yS1B7qp2F3cY3TiAWUNcRGH7KjFbsJ.jpg",
      supplier: "MSD",
    },
    {
      name: "Ecomectin 1% Injectable 50ml",
      slug: "ecomectin-1-injectable-50ml",
      description: "Antiparasitic remedy for cattle and sheep, kills mange mites on pigs. Contains Ivermectin 1%.",
      price: 175,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ectomectin%2050ml-BMgyoS1TQVl9UWkEIn3hYmLex2k0SJ.jpg",
      supplier: "Afrivet",
    },
    {
      name: "Taktic Cattle Spray 500ml",
      slug: "taktic-cattle-spray-500ml",
      description: "External parasite control spray for cattle. Contains Amitraz 12.5% for tick and mite control.",
      price: 225,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tactic%20Cattle%20Spray%20500ml-AaySH6g65WudO5LuugN7sxPHUFzxpd.jpg",
      supplier: "MSD",
    },
    {
      name: "Eraditick Grease 500g",
      slug: "eraditick-grease-500g",
      description: "Tick control grease for external application on cattle at tick attachment sites.",
      price: 145,
      category_id: getCategoryId("chemicals-fertilizers"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Eraditic%20greese-fjDRm7t7LRHF6uLtMUNOfePIBFy8JC.jpg",
      supplier: null,
    },
    // Animal Feeds
    {
      name: "QPro Grower 50kg",
      slug: "qpro-grower-50kg",
      description: "Quality poultry grower feed for optimal broiler development and weight gain.",
      price: 425,
      category_id: getCategoryId("animal-feeds"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/QPro%20grower-8XX5JzN4Kz56AD9W3Q5uWbIZKglaAl.jpg",
      supplier: "QPro",
    },
    {
      name: "Hominy Chop 50kg",
      slug: "hominy-chop-50kg",
      description: "High-energy animal feed made from maize by-products. Suitable for cattle, pigs and poultry.",
      price: 195,
      category_id: getCategoryId("animal-feeds"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chops-kDYIlBhuVKbDSxNesvLUwzZ2EIvdNF.jpg",
      supplier: null,
    },
    // Farm Supplies - Tools & Hardware
    {
      name: "Talbot Cow Bell #1 Small",
      slug: "talbot-cow-bell-1-small",
      description: "Traditional galvanized steel cow bell. Size #1 (small) for calves and small livestock.",
      price: 85,
      category_id: getCategoryId("tools-hardware"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bells%20Cows%20_1-Mwxb2fvENmfcZpGbPOKLManz70671R.jpg",
      supplier: "Talbot",
    },
    {
      name: "Talbot Cow Bell #3 Medium",
      slug: "talbot-cow-bell-3-medium",
      description: "Traditional galvanized steel cow bell. Size #3 (medium) for cattle and livestock.",
      price: 125,
      category_id: getCategoryId("tools-hardware"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bells%20Cows%20_3-ByhskIYXqlCuH4RNpGdFhLPErunraX.jpg",
      supplier: "Talbot",
    },
    {
      name: "Polypropylene Bags 50kg (10 Pack)",
      slug: "polypropylene-bags-50kg-10pack",
      description: "Woven polypropylene bags for grain, feed and general agricultural storage. Pack of 10 bags.",
      price: 95,
      category_id: getCategoryId("home-living"),
      image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Polypropylene%20bags-Ts51ET8Avcb99ULw7yrxLQGPmNbwRg.jpg",
      supplier: null,
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
    message: "Vet products seeded",
    results,
    total: products.length,
  })
}
