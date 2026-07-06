import { Pool } from "pg"
import { put } from "@vercel/blob"
import sharp from "sharp"

// Tunables
const MIN_BYTES = 90 * 1024 // only optimize images larger than ~90KB
const MAX_DIMENSION = 1200 // cap longest side
const WEBP_QUALITY = 78
const CONCURRENCY = 6

const token = process.env.BLOB_READ_WRITE_TOKEN
const connectionString = process.env.POSTGRES_URL
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing")
if (!connectionString) throw new Error("POSTGRES_URL missing")

const pool = new Pool({ connectionString, max: 4, ssl: { rejectUnauthorized: false } })

function fmt(bytes) {
  return (bytes / 1024).toFixed(0) + "KB"
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (image-optimizer)" },
    redirect: "follow",
  })
  if (!res.ok) throw new Error("HTTP " + res.status)
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

async function optimizeOne(url, idsByUrl) {
  const ids = idsByUrl.get(url)
  try {
    const original = await fetchBuffer(url)
    if (original.length < MIN_BYTES) {
      return { url, status: "skip-small", saved: 0, count: ids.length }
    }

    const img = sharp(original, { failOn: "none" }).rotate()
    const meta = await img.metadata()
    const resizeOpts =
      meta.width && meta.height && Math.max(meta.width, meta.height) > MAX_DIMENSION
        ? { width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true }
        : null

    let pipeline = sharp(original, { failOn: "none" }).rotate()
    if (resizeOpts) pipeline = pipeline.resize(resizeOpts)
    const optimized = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer()

    // Only replace if we actually save meaningful space
    if (optimized.length >= original.length * 0.9) {
      return { url, status: "skip-nogain", saved: 0, count: ids.length }
    }

    const key = `optimized/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
    const blob = await put(key, optimized, {
      access: "public",
      token,
      contentType: "image/webp",
      addRandomSuffix: false,
    })

    // Update every product that referenced this URL
    await pool.query(`UPDATE products SET image_url = $1 WHERE image_url = $2`, [blob.url, url])

    return {
      url,
      status: "done",
      saved: original.length - optimized.length,
      from: original.length,
      to: optimized.length,
      count: ids.length,
    }
  } catch (err) {
    return { url, status: "error", error: err.message, count: ids.length }
  }
}

async function main() {
  const { rows } = await pool.query(
    `SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND image_url LIKE 'http%'`,
  )

  // Dedupe by URL
  const idsByUrl = new Map()
  for (const r of rows) {
    if (!idsByUrl.has(r.image_url)) idsByUrl.set(r.image_url, [])
    idsByUrl.get(r.image_url).push(r.id)
  }
  const urls = [...idsByUrl.keys()]
  console.log(`[v0] ${rows.length} products, ${urls.length} unique images`)

  const results = []
  let idx = 0
  async function worker() {
    while (idx < urls.length) {
      const myIdx = idx++
      const url = urls[myIdx]
      const r = await optimizeOne(url, idsByUrl)
      results.push(r)
      if (r.status === "done") {
        console.log(
          `[v0] (${results.length}/${urls.length}) optimized ${fmt(r.from)}→${fmt(r.to)} x${r.count} rows`,
        )
      } else if (r.status === "error") {
        console.log(`[v0] (${results.length}/${urls.length}) ERROR ${r.error} :: ${url}`)
      } else {
        console.log(`[v0] (${results.length}/${urls.length}) ${r.status}`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const done = results.filter((r) => r.status === "done")
  const totalSaved = done.reduce((a, r) => a + r.saved, 0)
  const rowsUpdated = done.reduce((a, r) => a + r.count, 0)
  const errors = results.filter((r) => r.status === "error")

  console.log("\n[v0] ===== SUMMARY =====")
  console.log(`[v0] optimized images: ${done.length}`)
  console.log(`[v0] product rows updated: ${rowsUpdated}`)
  console.log(`[v0] total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`)
  console.log(`[v0] skipped (small): ${results.filter((r) => r.status === "skip-small").length}`)
  console.log(`[v0] skipped (no gain): ${results.filter((r) => r.status === "skip-nogain").length}`)
  console.log(`[v0] errors: ${errors.length}`)

  await pool.end()
}

main().catch((e) => {
  console.error("[v0] fatal", e)
  process.exit(1)
})
