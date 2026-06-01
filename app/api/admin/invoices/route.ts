import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generate unique invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}`
  
  // Get the latest invoice number for this year
  const { data } = await supabaseAdmin
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
  
  let sequence = 1
  if (data && data.length > 0) {
    const lastNumber = data[0].invoice_number
    const lastSequence = parseInt(lastNumber.replace(`${prefix}`, ''), 10)
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1
    }
  }
  
  return `${prefix}${sequence.toString().padStart(5, '0')}`
}

// GET - List all invoices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('invoices')
      .select('*, invoice_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (type && type !== 'all') {
      query = query.eq('invoice_type', type)
    }

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,client_name.ilike.%${search}%,client_email.ilike.%${search}%`)
    }

    const { data: invoices, error, count } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      invoices: invoices || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST - Create a new invoice
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, ...invoiceData } = body

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber()

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const total = subtotal - (invoiceData.discount_amount || 0) + (invoiceData.shipping_amount || 0)

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        ...invoiceData,
        invoice_number,
        subtotal,
        total,
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Insert invoice items
    if (items && items.length > 0) {
      const invoiceItems = items.map((item: any) => ({
        invoice_id: invoice.id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }))

      const { error: itemsError } = await supabaseAdmin
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
      }
    }

    // Fetch complete invoice with items
    const { data: completeInvoice } = await supabaseAdmin
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', invoice.id)
      .single()

    return NextResponse.json(completeInvoice)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
