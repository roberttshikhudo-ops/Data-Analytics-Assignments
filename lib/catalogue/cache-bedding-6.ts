import { put } from "@vercel/blob"
import { redis } from "@/lib/redis"
import { generateBeddingCatalogueSixPdf } from "@/lib/catalogue/generate-bedding-6"

// The generated catalogue is stored in Vercel Blob and its URLs are cached in
// Redis. Blob and Redis are project-level (shared across preview and
// production), so warming the cache anywhere warms it for the live site too.
//
// The public download route serves this cache and NEVER regenerates the PDF on
// a visitor's request path (generation takes ~40s and would time out on the
// live serverless function). The admin regeneration refreshes this same cache,
// so it stays warm and current whenever products change.
const CACHE_KEY = "catalogue:bedding-6:urls"
// Long TTL so the download stays available between admin regenerations.
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const BLOB_PATH = "catalogues/agri-hub-bedding-catalogue-6.pdf"

export type CatalogueCache = {
  url: string
  downloadUrl: string
}

export async function getCachedCatalogue(): Promise<CatalogueCache | null> {
  try {
    return await redis.get<CatalogueCache>(CACHE_KEY)
  } catch (err) {
    console.error("[v0] Failed to read catalogue cache:", err)
    return null
  }
}

// Generate the PDF, upload it to Blob, and cache the URLs. Returns the buffer
// so callers (e.g. the admin route) can also stream it directly.
export async function generateAndCacheCatalogue(
  origin: string,
): Promise<{ buffer: Buffer; cache: CatalogueCache }> {
  const buffer = await generateBeddingCatalogueSixPdf(origin)

  const blob = await put(BLOB_PATH, buffer, {
    access: "public",
    contentType: "application/pdf",
    allowOverwrite: true,
    addRandomSuffix: false,
  })

  const cache: CatalogueCache = { url: blob.url, downloadUrl: blob.downloadUrl }

  try {
    await redis.set(CACHE_KEY, cache, { ex: CACHE_TTL_SECONDS })
  } catch (err) {
    console.error("[v0] Failed to write catalogue cache:", err)
  }

  return { buffer, cache }
}
