import { NextRequest, NextResponse } from 'next/server'
import { createShipment, AGRIHUB_WAREHOUSE, ShippingAddress } from '@/lib/fastway'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, shippingAddress, items, serviceType = 'ROAD' } = body

    if (!orderId || !shippingAddress) {
      return NextResponse.json(
        { error: 'Order ID and shipping address are required' },
        { status: 400 }
      )
    }

    // Prepare delivery address
    const deliveryAddress: ShippingAddress = {
      name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      company: shippingAddress.company || '',
      street: shippingAddress.address,
      suburb: shippingAddress.suburb || shippingAddress.city,
      city: shippingAddress.city,
      postalCode: shippingAddress.postalCode,
      province: shippingAddress.province,
      phone: shippingAddress.phone,
      email: shippingAddress.email,
    }

    // Create shipment with Fastway
    const shipment = await createShipment(
      AGRIHUB_WAREHOUSE,
      deliveryAddress,
      items || [{ description: 'Agri Hub SA Order', weight: 5, quantity: 1 }],
      serviceType
    )

    if (!shipment) {
      return NextResponse.json(
        { error: 'Failed to create shipment with courier' },
        { status: 500 }
      )
    }

    // Update order with tracking info
    const supabase = await createClient()
    await supabase
      .from('orders')
      .update({
        tracking_number: shipment.trackingNumber,
        shipping_label_url: shipment.labelUrl,
        fulfillment_status: 'shipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json({
      success: true,
      shipment: {
        trackingNumber: shipment.trackingNumber,
        labelUrl: shipment.labelUrl,
        consignmentId: shipment.consignmentId,
      },
    })
  } catch (error) {
    console.error('[Create Shipment API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    )
  }
}
