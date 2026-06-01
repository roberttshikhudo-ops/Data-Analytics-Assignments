import { NextRequest, NextResponse } from 'next/server'
import { getShippingQuotes, qualifiesForFreeShipping, AGRIHUB_WAREHOUSE } from '@/lib/fastway'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postalCode, orderTotal, weightKg = 5 } = body

    if (!postalCode) {
      return NextResponse.json(
        { error: 'Postal code is required' },
        { status: 400 }
      )
    }

    // Get quotes from Fastway
    const quotes = await getShippingQuotes(
      AGRIHUB_WAREHOUSE.postalCode,
      postalCode,
      weightKg
    )

    // Check if free shipping applies
    const freeShipping = qualifiesForFreeShipping(orderTotal || 0)

    // Adjust prices if free shipping applies
    const adjustedQuotes = quotes.map(quote => ({
      ...quote,
      originalPrice: quote.price,
      price: freeShipping ? 0 : quote.price,
      freeShipping,
    }))

    return NextResponse.json({
      success: true,
      quotes: adjustedQuotes,
      freeShipping,
      freeShippingThreshold: 1500,
    })
  } catch (error) {
    console.error('[Shipping Quote API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get shipping quotes' },
      { status: 500 }
    )
  }
}
