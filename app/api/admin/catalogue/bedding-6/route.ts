import { NextResponse } from "next/server"
import { generateBeddingCatalogueSixPdf } from "@/lib/catalogue/generate-bedding-6"

// @react-pdf/renderer and fs require the Node.js runtime, and the PDF must be
// generated fresh on each request.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// PDF generation fetches and re-compresses every product image, so give the
// function enough time to finish on the live deployment.
export const maxDuration = 60

export async function GET(request: Request) {
  const origin = new URL(request.url).origin

  try {
    const buffer = await generateBeddingCatalogueSixPdf(origin)

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Agri-Hub-SA-Bedding-Catalogue-6.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("[v0] Admin catalogue generation failed:", err)
    return NextResponse.json({ error: "Failed to generate catalogue" }, { status: 500 })
  }
}
