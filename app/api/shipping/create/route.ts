import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { fulfilOrderShipment } from "@/lib/shipping"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, serviceType, force } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Delegates to the shared fulfilment helper so manual creation behaves
    // exactly like the automatic flow used by the payment webhooks. Pass
    // `force` to retry Fastway for an order that only has a provisional number.
    const result = await fulfilOrderShipment(supabaseAdmin, orderId, {
      serviceType,
      force: Boolean(force),
    })

    switch (result.status) {
      case "not_found":
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      case "skipped_pickup":
        return NextResponse.json(
          { error: "This is a local pickup order and does not need a shipment" },
          { status: 400 },
        )
      case "already_fulfilled":
        return NextResponse.json(
          {
            error: "This order already has a Fastway shipment",
            trackingNumber: result.trackingNumber,
          },
          { status: 409 },
        )
      case "created":
      case "provisional":
        return NextResponse.json({
          success: true,
          trackingNumber: result.trackingNumber,
          trackingUrl: result.trackingUrl,
          labelUrl: result.labelUrl,
          viaFastway: result.viaFastway,
          provisional: result.status === "provisional",
          emailSent: result.emailSent,
        })
      default:
        return NextResponse.json(
          { error: "Failed to create shipment" },
          { status: 502 },
        )
    }
  } catch (error) {
    console.error("[v0] Create shipment error:", error)
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 })
  }
}
