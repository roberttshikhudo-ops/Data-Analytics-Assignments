import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BUSINESS_INFO = {
  name: "Agri Hub SA",
  tagline: "Your Agricultural, Hardware and Lifestyle Innovation Partner",
  phone: "079 109 9490",
  altPhone: "083 306 1529",
  email: "info@agrihubsa.co.za",
  website: "www.agrihubsa.co.za",
  address: "The Parks Lifestyle Apartments, Block 38 Unit 2F, Midrand, Gauteng 1685",
}

// Bedding name keywords used to select only bedding products
const BEDDING_KEYWORDS = [
  "comforter",
  "bedspread",
  "bedding",
  "blanket",
  "throw",
  "quilt",
  "duvet",
  "pillow",
  "sheet",
  "linen",
]

function formatCurrency(amount: number): string {
  return `R${Number(amount).toFixed(2)}`
}

function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function absoluteImage(request: Request, imageUrl: string | null): string {
  if (!imageUrl) return ""
  if (imageUrl.startsWith("http")) return imageUrl
  const origin = new URL(request.url).origin
  return `${origin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
}

export async function GET(request: Request) {
  // Fetch active bedding products from the Home & Living category
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("name, price, compare_at_price, image_url, short_description, categories(slug)")
    .eq("is_active", true)
    .order("price", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }

  const EXCLUDE_KEYWORDS = ["bag", "travel", "curtain only", "towel"]

  const bedding = (products || []).filter((p: any) => {
    const name = (p.name || "").toLowerCase()
    const inHomeLiving = p.categories?.slug === "home-living"
    const nameMatch = BEDDING_KEYWORDS.some((k) => name.includes(k))
    const excluded = EXCLUDE_KEYWORDS.some((k) => name.includes(k))
    return inHomeLiving && nameMatch && !excluded
  })

  const html = generateCatalogueHTML(request, bedding)

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  })
}

function generateCatalogueHTML(request: Request, products: any[]): string {
  const generatedDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const cardsHTML = products
    .map((p) => {
      const img = absoluteImage(request, p.image_url)
      const hasDiscount = p.compare_at_price && p.compare_at_price > p.price
      return `
      <div class="card">
        <div class="card-image">
          ${
            img
              ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" crossorigin="anonymous" />`
              : `<div class="no-image">No image</div>`
          }
        </div>
        <div class="card-body">
          <h3 class="card-name">${escapeHtml(p.name)}</h3>
          ${p.short_description ? `<p class="card-desc">${escapeHtml(p.short_description)}</p>` : ""}
          <div class="card-price-row">
            <span class="card-price">${formatCurrency(p.price)}</span>
            ${hasDiscount ? `<span class="card-compare">${formatCurrency(p.compare_at_price)}</span>` : ""}
          </div>
        </div>
      </div>`
    })
    .join("")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Agri Hub SA - Bedding Catalogue</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a202c;
      background: #f1f5f9;
      line-height: 1.5;
    }
    .page {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
    }
    .cover {
      background: #1a365d;
      color: #ffffff;
      padding: 48px 48px 40px;
      text-align: center;
    }
    .cover .brand { font-size: 30px; font-weight: 700; letter-spacing: 0.5px; }
    .cover .tagline { color: #9ae6c4; font-size: 13px; margin-top: 6px; }
    .cover .title {
      margin-top: 28px;
      font-size: 40px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .cover .subtitle { color: #cbd5e0; font-size: 14px; margin-top: 8px; }
    .meta-bar {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
      background: #059669;
      color: #ffffff;
      font-size: 13px;
      padding: 12px 24px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      padding: 32px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      break-inside: avoid;
    }
    .card-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .card-image img { width: 100%; height: 100%; object-fit: cover; }
    .no-image { color: #94a3b8; font-size: 12px; }
    .card-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .card-name { font-size: 14px; font-weight: 700; color: #1a365d; }
    .card-desc { font-size: 12px; color: #64748b; flex: 1; }
    .card-price-row { display: flex; align-items: baseline; gap: 8px; margin-top: 6px; }
    .card-price { font-size: 18px; font-weight: 800; color: #059669; }
    .card-compare { font-size: 13px; color: #94a3b8; text-decoration: line-through; }
    .footer {
      background: #1a365d;
      color: #ffffff;
      padding: 28px 48px;
      text-align: center;
    }
    .footer .cta { font-size: 16px; font-weight: 700; }
    .footer .contact { color: #cbd5e0; font-size: 13px; margin-top: 8px; }
    .footer .contact strong { color: #ffffff; }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 22px;
      background: #059669;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .print-btn:hover { background: #047857; }
    @media print {
      body { background: #ffffff; }
      .no-print { display: none !important; }
      .grid { grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; }
      .cover { padding: 32px; }
      @page { margin: 12mm; }
    }
    @media (max-width: 640px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Save as PDF / Print</button>
  <div class="page">
    <div class="cover">
      <div class="brand">${BUSINESS_INFO.name}</div>
      <div class="tagline">${BUSINESS_INFO.tagline}</div>
      <div class="title">Bedding Catalogue</div>
      <div class="subtitle">Comforters &bull; Bedspreads &bull; Blankets &amp; More</div>
    </div>
    <div class="meta-bar">
      <span>${products.length} Products</span>
      <span>Updated ${generatedDate}</span>
      <span>Prices in ZAR (incl.)</span>
    </div>
    <div class="grid">
      ${cardsHTML || '<p style="grid-column: 1/-1; text-align:center; color:#64748b; padding:40px;">No bedding products found.</p>'}
    </div>
    <div class="footer">
      <div class="cta">To Order, Contact Us Today</div>
      <div class="contact">
        <strong>Tel:</strong> ${BUSINESS_INFO.phone} / ${BUSINESS_INFO.altPhone} &nbsp;|&nbsp;
        <strong>Email:</strong> ${BUSINESS_INFO.email}
      </div>
      <div class="contact"><strong>Web:</strong> ${BUSINESS_INFO.website}</div>
      <div class="contact">${BUSINESS_INFO.address}</div>
    </div>
  </div>
</body>
</html>
  `
}
