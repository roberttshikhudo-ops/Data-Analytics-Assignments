import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching invoice:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

// PATCH - Update invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { items, ...invoiceData } = body

    // Update status timestamps
    if (invoiceData.status === 'sent' && !invoiceData.sent_at) {
      invoiceData.sent_at = new Date().toISOString()
    }
    if (invoiceData.status === 'paid' && !invoiceData.paid_at) {
      invoiceData.paid_at = new Date().toISOString()
    }

    // If items are provided, recalculate totals
    if (items && items.length > 0) {
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
      invoiceData.subtotal = subtotal
      invoiceData.total = subtotal - (invoiceData.discount_amount || 0) + (invoiceData.shipping_amount || 0)
    }

    // Update invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .update(invoiceData)
      .eq('id', id)
      .select()
      .single()

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError)
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Update items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await supabaseAdmin
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id)

      // Insert new items
      const invoiceItems = items.map((item: any) => ({
        invoice_id: id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }))

      await supabaseAdmin
        .from('invoice_items')
        .insert(invoiceItems)
    }

    // Fetch complete invoice
    const { data: completeInvoice } = await supabaseAdmin
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', id)
      .single()

    return NextResponse.json(completeInvoice)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting invoice:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
