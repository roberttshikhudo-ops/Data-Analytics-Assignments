import { redis } from "@/lib/redis"

// The generated catalogue is stored in Vercel Blob and its URLs are cached in
// Redis. Blob and Redis are project-level (shared across preview and
// production), so warming the cache anywhere warms it for the live site too.
//
// IMPORTANT: this module is imported by the storefront homepage and /order
// page, so it must stay lightweight. It must NOT statically import the PDF
// generator — that pulls @react-pdf/renderer, sharp and a service-role
// Supabase client into every storefront render, which crashed the live site
// with a 500. The generator is loaded lazily only when regeneration runs.
const CACHE_KEY = "catalogue:bedding-6:urls"
// Long TTL so the download stays available between admin regenerations.
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const BLOB_PATH = "catalogues/agri-hub-bedding-catalogue-6.pdf"

// Permanent public Blob location of the catalogue. Used as a safe fallback so
// the storefront always has a working download link even if Redis is
// unreachable or the cache key has expired.
export const FALLBACK_CATALOGUE: CatalogueCache = {
  url: `https://tkhnvcciiwg6evoc.public.blob.vercel-storage.com/${BLOB_PATH}`,
  downloadUrl: `https://tkhnvcciiwg6evoc.public.blob.vercel-storage.com/${BLOB_PATH}?download=1`,
}

export type CatalogueCache = {
  url: string
  downloadUrl: string
}

export async function getCachedCatalogue(): Promise<CatalogueCache | null> {
  try {
    const cached = await redis.get<CatalogueCache>(CACHE_KEY)
    return cached ?? FALLBACK_CATALOGUE
  } catch (err) {
    console.error("[v0] Failed to read catalogue cache:", err)
    return FALLBACK_CATALOGUE
  }
}

// Generate the PDF, upload it to Blob, and cache the URLs. Returns the buffer
// so callers (e.g. the admin route) can also stream it directly.
// Heavy dependencies are imported lazily so they never load on storefront pages.
export async function generateAndCacheCatalogue(
  origin: string,
): Promise<{ buffer: Buffer; cache: CatalogueCache }> {
  const [{ put }, { generateBeddingCatalogueSixPdf }] = await Promise.all([
    import("@vercel/blob"),
    import("@/lib/catalogue/generate-bedding-6"),
  ])

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
