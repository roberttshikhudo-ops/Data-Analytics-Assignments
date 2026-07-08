import { Pool } from "pg"
import { put } from "@vercel/blob"
import sharp from "sharp"

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString, max: 4, ssl: { rejectUnauthorized: false } })

const CATEGORY_ID = "099152dd-3ae4-4033-a201-92218245e22a"
const PRICE = 545.0
const COMPARE = 726.67

function shortDesc(colour) {
  return `${colour} 5pcs comforter set with soft white fleece inside for extra warmth. 5pcs set: 1 comforter, 2 continental pillowcases & 2 standard pillowcases.`
}
function longDesc(colour) {
  return `A plush ${colour.toLowerCase()} comforter set lined with soft white fleece on the inside for extra warmth and cosiness during winter. This 5-piece set includes 1 comforter, 2 continental pillowcases and 2 standard pillowcases. Made from 100% polyester.`
}

// name = "5pcs Comforter Set with white fleece inside- <Colour>"
function fullName(colour) {
  return `5pcs Comforter Set with white fleece inside- ${colour}`
}

// Existing rows to RENAME (id -> new colour) and NEW rows to INSERT.
const renames = [
  { id: "8d2c4353-d9e8-4743-b3da-84ea4b70cc23", colour: "Blue", slug: "comforter-set-white-fleece-blue", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qPwq0wDBzYvgAK3ipa7a20gGuFAB0a.png" },
  { id: "52b46abd-66ea-4c05-9282-cc98ce8f18e0", colour: "Cream", slug: "comforter-set-white-fleece-cream", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-67i9PmeCzVCmq2qzSlmidddyPttuje.png" },
  { id: "29db5253-5a40-4f95-9d52-95747226c5a7", colour: "Sage Green", slug: "comforter-set-white-fleece-sage-green", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1yBVnLqICEWYNrc5TXDmaxVjVFbMCQ.png" },
]

const keeps = [
  { id: "bc7a8380-ee7c-4efd-b244-037c14e58257", colour: "Grey", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ny4sLdGKKECWbK3zXfdJdPUIsd3swv.png" },
  { id: "876af74a-5df2-41ca-9af4-b6308d00e036", colour: "Camel", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-X4FwEAGfcMz87P8T1zS00btXtDcc0H.png" },
]

const inserts = [
  { colour: "Steel Blue", slug: "comforter-set-white-fleece-steel-blue", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FGbjijRfoDmxelhqnbNOYCneLVwV1E.png" },
  { colour: "Lilac", slug: "comforter-set-white-fleece-lilac", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NjRucxIcdZRyuPgdztmDkDdjOmJXq2.png" },
  { colour: "Pink", slug: "comforter-set-white-fleece-pink", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iAUWdtGJ6Uzv47TE5nutKlOKO9MesU.png" },
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
  // 1. Keeps: just attach images
  for (const k of keeps) {
    const url = await optimizeAndUpload(k.src, `comforter-set-white-fleece-${k.colour.toLowerCase().replace(/\s+/g, "-")}`)
    await pool.query(`UPDATE products SET image_url = $1, updated_at = now() WHERE id = $2`, [url, k.id])
    console.log(`kept ${k.colour}`)
  }
  // 2. Renames: update name, slug, descriptions, image
  for (const r of renames) {
    const url = await optimizeAndUpload(r.src, r.slug)
    await pool.query(
      `UPDATE products SET name=$1, slug=$2, short_description=$3, description=$4, image_url=$5, updated_at=now() WHERE id=$6`,
      [fullName(r.colour), r.slug, shortDesc(r.colour), longDesc(r.colour), url, r.id],
    )
    console.log(`renamed -> ${r.colour}`)
  }
  // 3. Inserts: new products
  for (const i of inserts) {
    const url = await optimizeAndUpload(i.src, i.slug)
    await pool.query(
      `INSERT INTO products (name, slug, price, compare_at_price, stock_quantity, low_stock_threshold, category_id, is_active, is_featured, is_new, short_description, description, image_url)
       VALUES ($1,$2,$3,$4,10,5,$5,true,false,true,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url, updated_at = now()`,
      [fullName(i.colour), i.slug, PRICE, COMPARE, CATEGORY_ID, shortDesc(i.colour), longDesc(i.colour), url],
    )
    console.log(`inserted ${i.colour}`)
  }

  const { rows } = await pool.query(
    `SELECT name, slug, price, compare_at_price, (image_url IS NOT NULL) AS has_image FROM products WHERE slug LIKE 'comforter-set-white-fleece-%' ORDER BY name`,
  )
  console.log("\nFinal series:")
  for (const row of rows) console.log(`  ${row.name} | R${row.price} | img:${row.has_image}`)
  await pool.end()
}

main().catch((e) => {
  console.error("ERROR:", e.message)
  process.exit(1)
})
