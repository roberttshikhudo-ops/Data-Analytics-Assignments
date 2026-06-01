import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createInvoiceFromOrder } from '@/lib/invoice'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Generate invoice from order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Check if invoice already exists for this order
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_number')
      .eq('order_id', orderId)
      .single()

    if (existingInvoice) {
      return NextResponse.json({
        success: true,
        invoice: existingInvoice,
        message: 'Invoice already exists for this order',
      })
    }

    // Create invoice from order
    const invoice = await createInvoiceFromOrder(orderId, supabaseAdmin)

    if (!invoice) {
      return NextResponse.json(
        { error: 'Failed to create invoice from order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      invoice,
      message: 'Invoice created successfully',
    })
  } catch (error) {
    console.error('Error creating invoice from order:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
