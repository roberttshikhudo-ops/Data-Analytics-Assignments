import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { redis } from "@/lib/redis"
import { generateBeddingCatalogueSixPdf } from "@/lib/catalogue/generate-bedding-6"

// @react-pdf/renderer and fs require the Node.js runtime.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Generating the PDF (image fetch + compression) is slow; allow enough time
// for the first (uncached) request on the live deployment.
export const maxDuration = 60

// The generated catalogue is cached in Vercel Blob and its URL is stored in
// Redis for 6 hours. This keeps the public download instant and reliable
// instead of regenerating a ~7MB PDF (and timing out) on every visit.
const CACHE_KEY = "catalogue:bedding-6:url"
const CACHE_TTL_SECONDS = 60 * 60 * 6 // 6 hours
const BLOB_PATH = "catalogues/agri-hub-bedding-catalogue-6.pdf"

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const refresh = new URL(request.url).searchParams.get("refresh") === "1"

  try {
    // 1. Serve the cached copy when available (fast path).
    if (!refresh) {
      const cachedUrl = await redis.get<string>(CACHE_KEY)
      if (cachedUrl) {
        return NextResponse.redirect(cachedUrl, 307)
      }
    }

    // 2. Generate fresh, store in Blob, cache the URL, then redirect.
    const buffer = await generateBeddingCatalogueSixPdf(origin)

    const blob = await put(BLOB_PATH, buffer, {
      access: "public",
      contentType: "application/pdf",
      allowOverwrite: true,
      addRandomSuffix: false,
    })

    await redis.set(CACHE_KEY, blob.url, { ex: CACHE_TTL_SECONDS })

    return NextResponse.redirect(blob.url, 307)
  } catch (err) {
    console.error("[v0] Public catalogue generation failed:", err)
    return NextResponse.json({ error: "Failed to generate catalogue" }, { status: 500 })
  }
}
