import { createClient } from '@supabase/supabase-js'

// Agri Hub SA Business Details
export const BUSINESS_INFO = {
  name: 'Agri Hub SA',
  tagline: 'Your Agricultural, Hardware and Lifestyle Innovation Partner',
  address: 'The Parks',
  city: 'Midrand',
  province: 'Gauteng',
  postalCode: '1685',
  country: 'South Africa',
  fullAddress: 'The Parks, Midrand, Johannesburg, 1685, Gauteng, South Africa',
  phone: '083 306 1529',
  altPhone: '083 306 1529',
  email: 'robert.tshikhudo@gmail.com',
  website: 'https://agrihubsa.co.za',
  // Not VAT registered
  vatRegistered: false,
  vatNumber: null,
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  product_id?: string | null
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Invoice {
  id?: string
  invoice_number?: string
  order_id?: string | null
  user_id?: string | null
  invoice_type: 'order' | 'manual'
  client_name: string
  client_email?: string | null
  client_phone?: string | null
  client_company?: string | null
  client_address?: string | null
  client_city?: string | null
  client_province?: string | null
  client_postal_code?: string | null
  client_country?: string
  invoice_date: string
  due_date?: string | null
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  discount_amount?: number
  shipping_amount?: number
  total: number
  notes?: string | null
  terms?: string | null
  payment_instructions?: string | null
  created_at?: string
  updated_at?: string
  sent_at?: string | null
  paid_at?: string | null
  items?: InvoiceItem[]
}

// Generate invoice number format: INV-YYYYNNNNN
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `INV-${year}${random}`
}

// Generate the next sequential invoice number (INV-YYYYNNNNN) so it matches
// the format used by manually-created invoices and stays gap-free per year.
export async function getNextInvoiceNumber(
  supabaseClient: ReturnType<typeof createClient>
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}`

  const { data } = await supabaseClient
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  let sequence = 1
  if (data && data.length > 0) {
    const lastNumber = (data[0] as { invoice_number: string }).invoice_number
    const lastSequence = parseInt(lastNumber.replace(prefix, ''), 10)
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1
    }
  }

  return `${prefix}${sequence.toString().padStart(5, '0')}`
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Calculate invoice totals
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  discountAmount: number = 0,
  shippingAmount: number = 0
): { subtotal: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
  const total = subtotal - discountAmount + shippingAmount
  return { subtotal, total }
}

// Create invoice from order
export async function createInvoiceFromOrder(
  orderId: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<Invoice | null> {
  // Get order details
  const { data: order, error: orderError } = await supabaseClient
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    console.error('Error fetching order:', orderError)
    return null
  }

  // Create invoice items from order items
  const invoiceItems: InvoiceItem[] = (order.order_items || []).map((item: any) => ({
    product_id: item.product_id,
    description: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }))

  // Build client name from order, falling back to shipping details when
  // billing details are missing (e.g. manual / phone orders capture shipping only).
  const clientName =
    `${order.billing_first_name || ''} ${order.billing_last_name || ''}`.trim() ||
    `${order.shipping_first_name || ''} ${order.shipping_last_name || ''}`.trim() ||
    'Customer'

  // Always include the recipient's address on the invoice. Prefer the billing
  // address, but fall back to the shipping address so the address is never blank.
  const hasBillingAddress = Boolean(order.billing_address_line1)
  const clientAddress = hasBillingAddress
    ? [order.billing_address_line1, order.billing_address_line2].filter(Boolean).join(', ')
    : [order.shipping_address_line1, order.shipping_address_line2].filter(Boolean).join(', ')

  // Create invoice
  const invoice: Invoice = {
    order_id: orderId,
    user_id: order.user_id,
    invoice_type: 'order',
    client_name: clientName,
    client_email: order.guest_email || null,
    client_phone: order.billing_phone || order.shipping_phone || null,
    client_company: order.billing_company || order.shipping_company || null,
    client_address: clientAddress,
    client_city: hasBillingAddress ? order.billing_city : order.shipping_city,
    client_province: hasBillingAddress ? order.billing_province : order.shipping_province,
    client_postal_code: hasBillingAddress ? order.billing_postal_code : order.shipping_postal_code,
    client_country: (hasBillingAddress ? order.billing_country : order.shipping_country) || 'South Africa',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: null, // Already paid for order invoices
    status: order.payment_status === 'paid' ? 'paid' : 'draft',
    subtotal: order.subtotal,
    discount_amount: order.discount_amount || 0,
    shipping_amount: order.shipping_cost || 0,
    total: order.total,
    notes: `Order #${order.order_number}`,
    terms: 'Thank you for your business!',
    payment_instructions: order.payment_status === 'paid' 
      ? 'Payment received - Thank you!' 
      : `Bank Transfer:\nBank: First National Bank (FNB)\nAccount Name: Agri Hub SA\nAccount Number: 63014180606\nBranch Code: 250655\nReference: ${order.order_number}`,
    items: invoiceItems,
  }

  // Generate a sequential invoice number (the column is NOT NULL with no default)
  const invoiceNumber = await getNextInvoiceNumber(supabaseClient)

  // Insert invoice
  const { data: newInvoice, error: insertError } = await supabaseClient
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      order_id: invoice.order_id,
      user_id: invoice.user_id,
      invoice_type: invoice.invoice_type,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      client_phone: invoice.client_phone,
      client_company: invoice.client_company,
      client_address: invoice.client_address,
      client_city: invoice.client_city,
      client_province: invoice.client_province,
      client_postal_code: invoice.client_postal_code,
      client_country: invoice.client_country,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      status: invoice.status,
      subtotal: invoice.subtotal,
      discount_amount: invoice.discount_amount,
      shipping_amount: invoice.shipping_amount,
      total: invoice.total,
      notes: invoice.notes,
      terms: invoice.terms,
      payment_instructions: invoice.payment_instructions,
      paid_at: invoice.status === 'paid' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (insertError || !newInvoice) {
    console.error('Error creating invoice:', insertError)
    return null
  }

  // Insert invoice items
  if (invoiceItems.length > 0) {
    const itemsToInsert = invoiceItems.map(item => ({
      invoice_id: newInvoice.id,
      product_id: item.product_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    const { error: itemsError } = await supabaseClient
      .from('invoice_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError)
    }
  }

  return { ...invoice, id: newInvoice.id, invoice_number: newInvoice.invoice_number }
}

// Create manual invoice
export async function createManualInvoice(
  invoiceData: Omit<Invoice, 'id' | 'invoice_number' | 'invoice_type'>,
  items: InvoiceItem[],
  supabaseClient: ReturnType<typeof createClient>
): Promise<Invoice | null> {
  const { subtotal, total } = calculateInvoiceTotals(
    items,
    invoiceData.discount_amount || 0,
    invoiceData.shipping_amount || 0
  )

  // Insert invoice
  const { data: newInvoice, error: insertError } = await supabaseClient
    .from('invoices')
    .insert({
      invoice_type: 'manual',
      client_name: invoiceData.client_name,
      client_email: invoiceData.client_email,
      client_phone: invoiceData.client_phone,
      client_company: invoiceData.client_company,
      client_address: invoiceData.client_address,
      client_city: invoiceData.client_city,
      client_province: invoiceData.client_province,
      client_postal_code: invoiceData.client_postal_code,
      client_country: invoiceData.client_country || 'South Africa',
      invoice_date: invoiceData.invoice_date,
      due_date: invoiceData.due_date,
      status: invoiceData.status || 'draft',
      subtotal,
      discount_amount: invoiceData.discount_amount || 0,
      shipping_amount: invoiceData.shipping_amount || 0,
      total,
      notes: invoiceData.notes,
      terms: invoiceData.terms,
      payment_instructions: invoiceData.payment_instructions,
    })
    .select()
    .single()

  if (insertError || !newInvoice) {
    console.error('Error creating invoice:', insertError)
    return null
  }

  // Insert invoice items
  if (items.length > 0) {
    const itemsToInsert = items.map(item => ({
      invoice_id: newInvoice.id,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabaseClient
      .from('invoice_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError)
    }
  }

  return { 
    ...invoiceData, 
    id: newInvoice.id, 
    invoice_number: newInvoice.invoice_number,
    invoice_type: 'manual',
    subtotal,
    total,
    items 
  }
}

// Get invoice with items
export async function getInvoiceWithItems(
  invoiceId: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<Invoice | null> {
  const { data: invoice, error } = await supabaseClient
    .from('invoices')
    .select(`
      *,
      invoice_items (*)
    `)
    .eq('id', invoiceId)
    .single()

  if (error || !invoice) {
    console.error('Error fetching invoice:', error)
    return null
  }

  return {
    ...invoice,
    items: invoice.invoice_items || [],
  } as Invoice
}

// Update invoice status
export async function updateInvoiceStatus(
  invoiceId: string,
  status: Invoice['status'],
  supabaseClient: ReturnType<typeof createClient>
): Promise<boolean> {
  const updateData: any = { status }
  
  if (status === 'sent') {
    updateData.sent_at = new Date().toISOString()
  } else if (status === 'paid') {
    updateData.paid_at = new Date().toISOString()
  }

  const { error } = await supabaseClient
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)

  if (error) {
    console.error('Error updating invoice status:', error)
    return false
  }

  return true
}

// Default payment instructions
export const DEFAULT_PAYMENT_INSTRUCTIONS = `Bank Transfer:
Bank: First National Bank (FNB)
Account Name: Agri Hub SA
Account Number: 63014180606
Branch Code: 250655
Reference: Invoice Number

Or pay via PayFast on our website.`

// Default terms
export const DEFAULT_TERMS = `1. Payment is due within 7 days of invoice date unless otherwise specified.
2. Goods remain the property of Agri Hub SA until paid in full.
3. Returns accepted within 7 days with original packaging.
4. For queries, contact us at 083 306 1529 or robert.tshikhudo@gmail.com`
