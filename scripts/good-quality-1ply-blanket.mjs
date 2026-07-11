import { Pool } from "pg"
import { put } from "@vercel/blob"
import sharp from "sharp"

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString, max: 4, ssl: { rejectUnauthorized: false } })

const CATEGORY_ID = "099152dd-3ae4-4033-a201-92218245e22a"
const PRICE = 540.0

const STACK = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-s3o3dtxl5M9NEBMQ6pvS7VteyN1zUW.png"
const NAVY = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fl7BGBYMPLi5Jgnj0RTLyzeXioVUV8.png"
const BLACK = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LyY4WqyvJ4YLrj4Pv6iLuanm3VmVvv.png"

function fullName(colour) {
  return `Good Quality 1PLY Blanket-${colour}`
}
function shortDesc(colour) {
  return `${colour} good quality 1PLY plush mink blanket — warm, soft & cosy.`
}
function longDesc(colour) {
  return `A good quality ${colour.toLowerCase()} 1PLY plush mink blanket. Soft, warm and lightweight, perfect for year-round comfort on any bed or couch.`
}

const products = [
  { colour: "Yellow", slug: "good-1ply-blanket-yellow", src: STACK },
  { colour: "Charcoal", slug: "good-1ply-blanket-charcoal", src: BLACK },
  { colour: "Olive", slug: "good-1ply-blanket-olive", src: STACK },
  { colour: "Pink", slug: "good-1ply-blanket-pink", src: STACK },
  { colour: "Mustard", slug: "good-1ply-blanket-mustard", src: STACK },
  { colour: "Navy", slug: "good-1ply-blanket-navy", src: NAVY },
  { colour: "Green", slug: "good-1ply-blanket-green", src: STACK },
  { colour: "Burgundy", slug: "good-1ply-blanket-burgundy", src: STACK },
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
    `SELECT name, slug, price, (image_url IS NOT NULL) AS has_image FROM products WHERE slug LIKE 'good-1ply-blanket-%' ORDER BY name`,
  )
  console.log("\nFinal series:")
  for (const row of rows) console.log(`  ${row.name} | R${row.price} | img:${row.has_image}`)
  await pool.end()
}

main().catch((e) => {
  console.error("ERROR:", e.message)
  process.exit(1)
})
