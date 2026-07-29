import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { trackShipment, isProvisionalTrackingNumber } from "@/lib/fastway"

interface TrackingEvent {
  date: string
  status: string
  location: string
}

// Maps an internal order status to a customer-friendly tracking status.
const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Order Received",
  processing: "Being Prepared",
  shipped: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

// Normalizes the raw Fastway tracking payload (whose exact shape varies) into
// the { status, events } structure the track page renders.
function normalizeFastway(trackingNumber: string, raw: any) {
  const scans: any[] =
    raw?.Scans || raw?.scans || raw?.TrackingEvents || raw?.events || []

  const events: TrackingEvent[] = Array.isArray(scans)
    ? scans.map((s: any) => ({
        date: s.Date || s.date || s.ScanDateTime || s.datetime || "",
        status: s.Description || s.description || s.Status || s.status || "Update",
        location: s.Depot || s.location || s.Location || s.Branch || "",
      }))
    : []

  const status =
    raw?.Status ||
    raw?.status ||
    (events.length ? events[events.length - 1].status : "In Transit")

  return { trackingNumber, status, events }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get("trackingNumber")

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number is required" },
        { status: 400 },
      )
    }

    // Real Fastway consignment numbers are looked up via the Fastway API.
    if (!isProvisionalTrackingNumber(trackingNumber)) {
      const trackingInfo = await trackShipment(trackingNumber)
      if (trackingInfo) {
        return NextResponse.json(normalizeFastway(trackingNumber, trackingInfo))
      }
    }

    // Fallback: provisional number, or Fastway has no scans yet. Report the
    // order's current status from our own database so the customer always
    // sees a meaningful update.
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("status, updated_at, created_at, shipping_city")
        .eq("tracking_number", trackingNumber)
        .single()

      if (order) {
        const label = ORDER_STATUS_LABEL[order.status] || "In Transit"
        return NextResponse.json({
          trackingNumber,
          status: label,
          events: [
            {
              date: new Date(
                order.updated_at || order.created_at || Date.now(),
              ).toLocaleString("en-ZA"),
              status: label,
              location: order.shipping_city || "Agri Hub SA",
            },
          ],
        })
      }
    } catch (dbError) {
      console.error("[Track Shipment API] DB fallback error:", dbError)
    }

    return NextResponse.json(
      { error: "Tracking information not found" },
      { status: 404 },
    )
  } catch (error) {
    console.error("[Track Shipment API] Error:", error)
    return NextResponse.json(
      { error: "Failed to get tracking information" },
      { status: 500 },
    )
  }
}
