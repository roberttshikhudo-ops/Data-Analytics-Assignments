import { NextRequest, NextResponse } from 'next/server'
import { trackShipment } from '@/lib/fastway'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('trackingNumber')

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    const trackingInfo = await trackShipment(trackingNumber)

    if (!trackingInfo) {
      return NextResponse.json(
        { error: 'Tracking information not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tracking: trackingInfo,
    })
  } catch (error) {
    console.error('[Track Shipment API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get tracking information' },
      { status: 500 }
    )
  }
}
