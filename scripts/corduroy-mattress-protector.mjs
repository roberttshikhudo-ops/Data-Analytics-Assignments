import { Pool } from "pg"
import { put } from "@vercel/blob"
import sharp from "sharp"

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString, max: 4, ssl: { rejectUnauthorized: false } })

const CATEGORY_ID = "099152dd-3ae4-4033-a201-92218245e22a"
const PRICE = 350.0

function fullName(colour) {
  return `3pcs Cordury Mattress Protector- ${colour}`
}
function shortDesc(colour) {
  return `${colour} 3pcs corduroy mattress protector set. Soft ribbed velvety fabric with a snug fitted design.`
}
function longDesc(colour) {
  return `A plush ${colour.toLowerCase()} 3pcs corduroy mattress protector set featuring a soft ribbed velvety surface and a deep elasticated fitted skirt for a secure, wrinkle-free fit. Includes matching pieces to keep your mattress warm, comfortable and protected. Made from 100% polyester.`
}

const products = [
  { colour: "Charcoal", slug: "cordury-mattress-protector-charcoal", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PbfrHVA23109Q5iFXeY64eF8rToC14.png" },
  { colour: "White", slug: "cordury-mattress-protector-white", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bjjYsRI27x1spUJu4HoVf02VUUVmw0.png" },
  { colour: "Camel", slug: "cordury-mattress-protector-camel", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oc3GFOmdVZK5yQ6gzDqlP8pQ3UjA4y.png" },
  { colour: "Red", slug: "cordury-mattress-protector-red", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AjdDWmLHZgfr3lDiOugVaqY476pVr8.png" },
  { colour: "Pink", slug: "cordury-mattress-protector-pink", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NdkANVpoEvo1jhVDcV14Hv1zIuDXgI.png" },
  { colour: "Green", slug: "cordury-mattress-protector-green", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7QJqc4AIt69jbbMBRhHyeYCesm5y3U.png" },
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
    `SELECT name, slug, price, (image_url IS NOT NULL) AS has_image FROM products WHERE slug LIKE 'cordury-mattress-protector-%' ORDER BY name`,
  )
  console.log("\nFinal series:")
  for (const row of rows) console.log(`  ${row.name} | R${row.price} | img:${row.has_image}`)
  await pool.end()
}

main().catch((e) => {
  console.error("ERROR:", e.message)
  process.exit(1)
})
