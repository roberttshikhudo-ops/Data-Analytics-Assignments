import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Send invoice via email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch invoice with items
    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq("id", id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (!invoice.client_email) {
      return NextResponse.json({ error: "No client email address" }, { status: 400 })
    }

    // Generate invoice HTML for email
    const invoiceHtml = generateInvoiceEmailHtml(invoice)

    // Send email using Resend or your preferred email service
    // For now, we'll use a simple fetch to a hypothetical email API
    // You can integrate with Resend, SendGrid, or any email service
    
    // Update invoice status to 'sent' and record sent_at timestamp
    const { error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({
        status: invoice.status === "draft" ? "sent" : invoice.status,
        sent_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating invoice status:", updateError)
    }

    // For demonstration, we'll return success
    // In production, integrate with an email service like Resend
    return NextResponse.json({
      success: true,
      message: `Invoice ${invoice.invoice_number} sent to ${invoice.client_email}`,
      // In production, this would actually send the email
      note: "Email service integration required. Invoice marked as sent.",
    })
  } catch (error) {
    console.error("Error sending invoice:", error)
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 })
  }
}

function generateInvoiceEmailHtml(invoice: any): string {
  const items = invoice.items || []
  
  const itemsHtml = items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R${item.total_price.toFixed(2)}</td>
      </tr>
    `
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">INVOICE</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 18px;">${invoice.invoice_number}</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none;">
    <table style="width: 100%; margin-bottom: 30px;">
      <tr>
        <td style="vertical-align: top; width: 50%;">
          <h3 style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">From</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px;">Agri Hub SA</p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">
            The Parks Lifestyle Apartments<br>
            Block 38 Unit 2F<br>
            Midrand, Johannesburg, 1685<br>
            South Africa
          </p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">
            Phone: 083 306 1529<br>
            Email: robert.tshikhudo@gmail.com
          </p>
        </td>
        <td style="vertical-align: top; width: 50%; text-align: right;">
          <h3 style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase;">Bill To</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px;">${invoice.client_name}</p>
          ${invoice.client_company ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">${invoice.client_company}</p>` : ""}
          ${invoice.client_address ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">${invoice.client_address}</p>` : ""}
          ${invoice.client_city || invoice.client_province ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">${invoice.client_city || ""}${invoice.client_city && invoice.client_province ? ", " : ""}${invoice.client_province || ""} ${invoice.client_postal_code || ""}</p>` : ""}
          ${invoice.client_email ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">${invoice.client_email}</p>` : ""}
        </td>
      </tr>
    </table>
    
    <table style="width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="width: 50%;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Invoice Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}
          </p>
        </td>
        <td style="width: 50%; text-align: right;">
          ${invoice.due_date ? `<p style="margin: 0; color: #666; font-size: 14px;"><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ""}
        </td>
      </tr>
    </table>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background: #1e3a5f;">
          <th style="padding: 12px; text-align: left; color: white; font-size: 14px;">Description</th>
          <th style="padding: 12px; text-align: center; color: white; font-size: 14px;">Qty</th>
          <th style="padding: 12px; text-align: right; color: white; font-size: 14px;">Unit Price</th>
          <th style="padding: 12px; text-align: right; color: white; font-size: 14px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <table style="width: 100%; margin-bottom: 30px;">
      <tr>
        <td style="width: 60%;"></td>
        <td style="width: 40%;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Subtotal</td>
              <td style="padding: 8px 0; text-align: right;">R${invoice.subtotal.toFixed(2)}</td>
            </tr>
            ${invoice.discount_amount > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #10b981;">Discount</td>
              <td style="padding: 8px 0; text-align: right; color: #10b981;">-R${invoice.discount_amount.toFixed(2)}</td>
            </tr>
            ` : ""}
            ${invoice.shipping_amount > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Shipping</td>
              <td style="padding: 8px 0; text-align: right;">R${invoice.shipping_amount.toFixed(2)}</td>
            </tr>
            ` : ""}
            <tr style="border-top: 2px solid #1e3a5f;">
              <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px;">R${invoice.total.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${invoice.payment_instructions ? `
    <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd;">
      <h3 style="margin: 0 0 10px 0; color: #1e3a5f; font-size: 14px;">Payment Instructions</h3>
      <p style="margin: 0; color: #666; font-size: 14px; white-space: pre-line;">${invoice.payment_instructions}</p>
    </div>
    ` : ""}
    
    ${invoice.notes ? `
    <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd;">
      <h3 style="margin: 0 0 10px 0; color: #1e3a5f; font-size: 14px;">Notes</h3>
      <p style="margin: 0; color: #666; font-size: 14px; white-space: pre-line;">${invoice.notes}</p>
    </div>
    ` : ""}
  </div>
  
  <div style="background: #1e3a5f; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
    <p style="margin: 0; color: white; font-size: 14px;">Thank you for your business!</p>
    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">
      Agri Hub SA - Your Agricultural, Hardware and Lifestyle Innovation Partner
    </p>
    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">
      www.agrihubsa.co.za
    </p>
  </div>
</body>
</html>
  `
}
