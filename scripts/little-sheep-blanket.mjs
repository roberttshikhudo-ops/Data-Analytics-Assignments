import { Pool } from "pg"
import { put } from "@vercel/blob"
import sharp from "sharp"

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString, max: 4, ssl: { rejectUnauthorized: false } })

const CATEGORY_ID = "099152dd-3ae4-4033-a201-92218245e22a"
const PRICE = 795.0

function fullName(colour) {
  return `1PLY Little Sheep Blanket- ${colour}`
}
function shortDesc(colour) {
  return `${colour} 1PLY Little Sheep mink blanket. Soft, warm and plush - perfect for cosy winter nights.`
}
function longDesc(colour) {
  return `A luxuriously soft ${colour.toLowerCase()} 1PLY Little Sheep mink blanket. Its plush, velvety pile keeps you warm and cosy through the cold winter months, while the elegant design adds a touch of warmth to any bedroom. Made from 100% polyester.`
}

const products = [
  { colour: "Grey Floral", slug: "little-sheep-blanket-grey-floral", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oBPSJbUL7QK5ZDkcpCUtB2BfKaKYmZ.png" },
  { colour: "Silver Rose", slug: "little-sheep-blanket-silver-rose", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tJHAlGMEyswoRFLU0ltnbReqBeMLJw.png" },
  { colour: "Brown Paisley", slug: "little-sheep-blanket-brown-paisley", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jI47Q1EonqhdACfCvofFm5trHIhVjK.png" },
  { colour: "Brown Leopard", slug: "little-sheep-blanket-brown-leopard", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kCmrtXOseKp62b8R13vuEdrtqEAqc1.png" },
  { colour: "Blush Floral", slug: "little-sheep-blanket-blush-floral", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vFlr67sKCHR1FbBAEF2TtoSxcHACbr.png" },
  { colour: "Black & White Leopard", slug: "little-sheep-blanket-black-white-leopard", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-D2mvmYbnHpDePpjpBvUu0S0m9rrGuX.png" },
]

async function optimizeAndUpload(src, slug) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`fetch failed ${res.status} for ${src}`)
  const input = Buffer.from(await res.arrayBuffer())
  const out = await sharp(input)
    .resize({ width: 900, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer()
  const blob = await put(`products/${slug}-${Date.now()}.jpg`, out, {
    access: "public",
    contentType: "image/jpeg",
  })
  console.log(`  ${slug}: ${(input.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`)
  return blob.url
}

async function main() {
  for (const p of products) {
    const url = await optimizeAndUpload(p.src, p.slug)
    await pool.query(
      `INSERT INTO products (name, slug, price, compare_at_price, stock_quantity, low_stock_threshold, category_id, is_active, is_featured, is_new, short_description, description, image_url)
       VALUES ($1,$2,$3,NULL,10,5,$4,true,false,true,$5,$6,$7)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, price=EXCLUDED.price, short_description=EXCLUDED.short_description, description=EXCLUDED.description, image_url=EXCLUDED.image_url, updated_at=now()`,
      [fullName(p.colour), p.slug, PRICE, CATEGORY_ID, shortDesc(p.colour), longDesc(p.colour), url],
    )
    console.log(`inserted ${p.colour}`)
  }

  const { rows } = await pool.query(
    `SELECT name, slug, price, (image_url IS NOT NULL) AS has_image FROM products WHERE slug LIKE 'little-sheep-blanket-%' ORDER BY name`,
  )
  console.log("\nFinal series:")
  for (const row of rows) console.log(`  ${row.name} | R${row.price} | img:${row.has_image}`)
  await pool.end()
}

main().catch((e) => {
  console.error("ERROR:", e.message)
  process.exit(1)
})
