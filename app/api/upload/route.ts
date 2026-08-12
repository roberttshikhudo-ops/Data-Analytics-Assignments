import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

// Client uploads send the file directly from the browser to Vercel Blob,
// so this route only issues a short-lived upload token. This avoids the
// ~4.5MB serverless request-body limit that made larger image uploads
// fail intermittently and appear to require a page refresh.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/avif',
          ],
          // Cap uploads at 15MB (generous for product photos)
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
        }
      },
      onUploadCompleted: async () => {
        // Server-to-server callback. Nothing extra to persist here — the
        // client receives the blob URL directly from the upload() call.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('[v0] Upload token error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    )
  }
}
