import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Business info for invoice
const BUSINESS_INFO = {
  name: "Agri Hub SA",
  tagline: "Your Agricultural, Hardware and Lifestyle Innovation Partner",
  address: "The Parks Lifestyle Apartments, Block 38 Unit 2F",
  city: "Midrand",
  province: "Gauteng",
  postalCode: "1685",
  country: "South Africa",
  phone: "083 306 1529",
  email: "robert.tshikhudo@gmail.com",
  website: "www.agrihubsa.co.za",
}

function formatCurrency(amount: number): string {
  return `R${amount.toFixed(2)}`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Fetch invoice with items
  const { data: invoice, error } = await supabaseAdmin
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .single()

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  // Generate HTML for PDF
  const html = generateInvoiceHTML(invoice)

  // Return HTML that can be printed as PDF
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

function generateInvoiceHTML(invoice: any): string {
  const items = invoice.invoice_items || []
  
  const itemsHTML = items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.unit_price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.total_price)}</td>
    </tr>
  `).join('')

  const statusColors: Record<string, string> = {
    draft: '#6b7280',
    sent: '#3b82f6',
    paid: '#059669',
    overdue: '#ef4444',
    cancelled: '#9ca3af',
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      color: #1a202c; 
      line-height: 1.5;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 40px; 
      padding-bottom: 20px; 
      border-bottom: 3px solid #1a365d;
    }
    .logo h1 { 
      color: #1a365d; 
      font-size: 28px; 
      margin-bottom: 4px;
    }
    .logo p { 
      color: #059669; 
      font-size: 12px; 
    }
    .invoice-title { text-align: right; }
    .invoice-title h2 { 
      font-size: 36px; 
      color: #1a365d; 
      letter-spacing: 2px;
    }
    .invoice-number { 
      color: #4a5568; 
      font-size: 14px; 
      margin-top: 4px;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      color: white;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 8px;
      background-color: ${statusColors[invoice.status] || '#6b7280'};
    }
    .info-section { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: 30px;
    }
    .info-block { width: 45%; }
    .info-block.right { text-align: right; }
    .info-title { 
      font-size: 11px; 
      color: #1a365d; 
      font-weight: bold; 
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .info-text { 
      color: #4a5568; 
      font-size: 13px; 
      margin-bottom: 2px;
    }
    .info-bold { 
      color: #1a365d; 
      font-weight: bold;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 20px;
    }
    th { 
      background-color: #1a365d; 
      color: white; 
      padding: 12px; 
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
    td { font-size: 13px; }
    .totals { 
      display: flex; 
      justify-content: flex-end; 
      margin-top: 20px;
    }
    .totals-block { width: 280px; }
    .totals-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 12px;
      font-size: 13px;
    }
    .totals-row.final { 
      background-color: #1a365d; 
      color: white; 
      font-weight: bold;
      font-size: 15px;
      border-radius: 4px;
      margin-top: 8px;
    }
    .payment-section {
      margin-top: 30px;
      padding: 20px;
      background-color: #e6fffa;
      border-left: 4px solid #059669;
      border-radius: 4px;
    }
    .notes-section {
      margin-top: 20px;
      padding: 15px;
      background-color: #f7fafc;
      border-radius: 4px;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 8px;
    }
    .section-text {
      font-size: 12px;
      color: #4a5568;
      white-space: pre-line;
    }
    .footer { 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #e2e8f0; 
      text-align: center;
    }
    .footer p { 
      color: #718096; 
      font-size: 12px; 
      margin-bottom: 4px;
    }
    .footer .highlight { color: #1a365d; }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background-color: #1a365d;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
    }
    .print-btn:hover { background-color: #2c5282; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>

  <div class="header">
    <div class="logo">
      <h1>${BUSINESS_INFO.name}</h1>
      <p>${BUSINESS_INFO.tagline}</p>
    </div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <p class="invoice-number">${invoice.invoice_number}</p>
      <span class="status">${invoice.status}</span>
    </div>
  </div>

  <div class="info-section">
    <div class="info-block">
      <p class="info-title">From</p>
      <p class="info-bold">${BUSINESS_INFO.name}</p>
      <p class="info-text">${BUSINESS_INFO.address}</p>
      <p class="info-text">${BUSINESS_INFO.city}, ${BUSINESS_INFO.province} ${BUSINESS_INFO.postalCode}</p>
      <p class="info-text">${BUSINESS_INFO.country}</p>
      <p class="info-text">Tel: ${BUSINESS_INFO.phone}</p>
      <p class="info-text">Email: ${BUSINESS_INFO.email}</p>
    </div>
    <div class="info-block right">
      <p class="info-title">Bill To</p>
      <p class="info-bold">${invoice.client_name}</p>
      ${invoice.client_company ? `<p class="info-text">${invoice.client_company}</p>` : ''}
      ${invoice.client_address ? `<p class="info-text">${invoice.client_address}</p>` : ''}
      ${invoice.client_city || invoice.client_province ? `<p class="info-text">${[invoice.client_city, invoice.client_province, invoice.client_postal_code].filter(Boolean).join(', ')}</p>` : ''}
      ${invoice.client_phone ? `<p class="info-text">Tel: ${invoice.client_phone}</p>` : ''}
      ${invoice.client_email ? `<p class="info-text">Email: ${invoice.client_email}</p>` : ''}
    </div>
  </div>

  <div class="info-section">
    <div class="info-block">
      <p class="info-text"><span class="info-bold">Invoice Date:</span> ${formatDate(invoice.invoice_date)}</p>
      ${invoice.due_date ? `<p class="info-text"><span class="info-bold">Due Date:</span> ${formatDate(invoice.due_date)}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 45%;">Description</th>
        <th style="width: 15%;">Qty</th>
        <th style="width: 20%;">Unit Price</th>
        <th style="width: 20%;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-block">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
      ${invoice.discount_amount > 0 ? `
      <div class="totals-row">
        <span>Discount</span>
        <span>-${formatCurrency(invoice.discount_amount)}</span>
      </div>
      ` : ''}
      ${invoice.shipping_amount > 0 ? `
      <div class="totals-row">
        <span>Shipping</span>
        <span>${formatCurrency(invoice.shipping_amount)}</span>
      </div>
      ` : ''}
      <div class="totals-row final">
        <span>Total Due</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
    </div>
  </div>

  ${invoice.payment_instructions && invoice.status !== 'paid' ? `
  <div class="payment-section">
    <p class="section-title">Payment Instructions</p>
    <p class="section-text">${invoice.payment_instructions}</p>
  </div>
  ` : ''}

  ${invoice.notes ? `
  <div class="notes-section">
    <p class="section-title">Notes</p>
    <p class="section-text">${invoice.notes}</p>
  </div>
  ` : ''}

  ${invoice.terms ? `
  <div class="notes-section">
    <p class="section-title">Terms & Conditions</p>
    <p class="section-text">${invoice.terms}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p class="highlight">${BUSINESS_INFO.name} - ${BUSINESS_INFO.tagline}</p>
    <p>${BUSINESS_INFO.website} | ${BUSINESS_INFO.phone} | ${BUSINESS_INFO.email}</p>
  </div>
</body>
</html>
  `
}
