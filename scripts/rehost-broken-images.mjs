import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { put } from '@vercel/blob'
import pg from 'pg'

const { Pool } = pg
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString, max: 4, ssl: { rejectUnauthorized: false } })

// productId -> local generated image file
const MAP = [
  { id: '094e5888-1192-4fbf-8935-8e1142d90981', file: 'public/tools/lasher-digging-fork.png', name: 'digging-fork' },
  { id: '5777f709-dab4-4ae2-b62e-852144c6a3ed', file: 'public/tools/lasher-square-spade.png', name: 'square-spade' },
  { id: '007057f2-1948-4a5f-9b97-20110520bf69', file: 'public/tools/lawnstar-chainsaw-chain.png', name: 'chainsaw-chain' },
  { id: '2fc8fb11-a372-429d-9caf-f81a880b3881', file: 'public/tools/lawnstar-chainsaw-chain.png', name: 'chainsaw-chain' },
  { id: 'a73327df-af8d-4dca-b5df-2b9b2e1838d8', file: 'public/tools/lawnstar-minimo-blade.png', name: 'minimo-blade' },
  { id: '6a818af9-e3ef-4cf0-a91b-c948f1c66868', file: 'public/tools/lawnstar-trimmer-head.png', name: 'trimmer-head' },
]

// Compress each unique file once, upload to Blob, cache the URL.
const urlCache = new Map()

async function getOptimizedUrl(file, name) {
  if (urlCache.has(file)) return urlCache.get(file)
  const buf = await readFile(path.resolve(file))
  const webp = await sharp(buf)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer()
  const { url } = await put(`products/${name}-${Date.now()}.webp`, webp, {
    access: 'public',
    contentType: 'image/webp',
  })
  console.log(`Uploaded ${name}: ${(buf.length / 1024).toFixed(0)}KB -> ${(webp.length / 1024).toFixed(0)}KB`)
  urlCache.set(file, url)
  return url
}

async function main() {
  for (const { id, file, name } of MAP) {
    const url = await getOptimizedUrl(file, name)
    await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [url, id])
    console.log(`Updated ${id} -> ${url}`)
  }
  await pool.end()
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
