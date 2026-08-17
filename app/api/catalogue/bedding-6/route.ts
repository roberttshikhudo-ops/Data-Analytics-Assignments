import { NextResponse } from "next/server"
import {
  getCachedCatalogue,
  generateAndCacheCatalogue,
} from "@/lib/catalogue/cache-bedding-6"

// @react-pdf/renderer and fs require the Node.js runtime.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Only the rare cold-generation path needs the extra time; cached requests
// return almost instantly.
export const maxDuration = 60

// Public bedding catalogue download.
//
// Normal path: serve the cached copy from Blob so the download is instant and
// reliable — the ~7MB PDF is never regenerated on a visitor's request (that
// took ~40s and timed out on the live deployment, which is why downloads kept
// failing).
//
// Query params:
//   ?json=1     -> return { downloadUrl } instead of redirecting. The client
//                  navigates to this forced-download URL directly, avoiding
//                  pulling the whole PDF through fetch (memory + CORS).
//   ?refresh=1  -> force regeneration and refresh the cache.
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const wantsJson = searchParams.get("json") === "1"
  const refresh = searchParams.get("refresh") === "1"

  try {
    let cache = refresh ? null : await getCachedCatalogue()

    if (!cache) {
      cache = (await generateAndCacheCatalogue(origin)).cache
    }

    if (wantsJson) {
      return NextResponse.json(
        { url: cache.url, downloadUrl: cache.downloadUrl },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    // Direct navigation: redirect to the forced-download Blob URL.
    return NextResponse.redirect(cache.downloadUrl, 307)
  } catch (err) {
    console.error("[v0] Public catalogue download failed:", err)
    return NextResponse.json(
      { error: "Failed to prepare catalogue" },
      { status: 500 },
    )
  }
}
