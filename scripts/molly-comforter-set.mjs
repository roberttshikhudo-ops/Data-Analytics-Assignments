import { Pool } from "pg"
import { put } from "@vercel/blob"
import sharp from "sharp"

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString, max: 4, ssl: { rejectUnauthorized: false } })

const CATEGORY_ID = "099152dd-3ae4-4033-a201-92218245e22a"
const PRICE = 735.0

function fullName(molly, colour) {
  return `7pcs King Size Comforter Set - Molly-${molly}, ${colour}`
}
function shortDesc(colour) {
  return `${colour} 7pcs King Size ribbed corduroy comforter set — warm & soft.`
}
function longDesc(colour) {
  return `A luxurious ${colour.toLowerCase()} 7-piece King Size comforter set in warm, soft ribbed corduroy. Includes 1 comforter (220x230cm), 2 pillowshams (48x68+4cm), 2 digital print pillowcases (48x68cm) and 2 cushions (45x45cm). 100% polyester fabric and filling.`
}

const products = [
  { molly: "001", colour: "Pink", slug: "king-comforter-molly-001-pink", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Molly%20001-neJQf5vkbMqGN1Nw1nVr8pCriXlWA1.jpg" },
  { molly: "002", colour: "Green", slug: "king-comforter-molly-002-green", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Molly%20002-SEdCjdudML0at5rYd2KcjLnPjEIc2I.jpg" },
  { molly: "003", colour: "Charcoal", slug: "king-comforter-molly-003-charcoal", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Molly%20003-wavZU9j4m0uaQxMyGGhi5PGo2Gzfem.jpg" },
  { molly: "004", colour: "Beige", slug: "king-comforter-molly-004-beige", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Molly%20004-qjW05NZVhod2H5eEklhVrH7oyqRp86.jpg" },
  { molly: "005", colour: "Brown", slug: "king-comforter-molly-005-brown", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Molly%20005-8aosg7b05RhhaGJpAfo15mOEfuL063.jpg" },
  { molly: "006", colour: "White", slug: "king-comforter-molly-006-white", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Molly%20006-cBCWmzjo1bfKiFYciWJuuRlM5HomvH.jpg" },
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
      [fullName(p.molly, p.colour), p.slug, PRICE, CATEGORY_ID, shortDesc(p.colour), longDesc(p.colour), url],
    )
    console.log(`inserted Molly-${p.molly} ${p.colour}`)
  }

  const { rows } = await pool.query(
    `SELECT name, slug, price, (image_url IS NOT NULL) AS has_image FROM products WHERE slug LIKE 'king-comforter-molly-%' ORDER BY name`,
  )
  console.log("\nFinal series:")
  for (const row of rows) console.log(`  ${row.name} | R${row.price} | img:${row.has_image}`)
  await pool.end()
}

main().catch((e) => {
  console.error("ERROR:", e.message)
  process.exit(1)
})
