import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'Missing Supabase credentials' 
    }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Test if invoices table exists
    const { error: testError } = await supabase.from('invoices').select('id').limit(1)
    
    if (testError && testError.message.includes('does not exist')) {
      // Table doesn't exist - need to create via SQL
      return NextResponse.json({ 
        success: false, 
        error: 'Invoice tables need to be created. Please run the SQL in Supabase dashboard.',
        sql: getInvoiceSQL()
      }, { status: 400 })
    }
    
    if (testError) {
      // Some other error
      return NextResponse.json({ 
        success: false, 
        error: testError.message
      }, { status: 500 })
    }

    // Tables exist
    return NextResponse.json({ 
      success: true, 
      message: 'Invoice tables already exist! You can create invoices now.' 
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

function getInvoiceSQL() {
  return `
-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID,
  invoice_type TEXT NOT NULL DEFAULT 'manual',
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  client_address TEXT,
  client_city TEXT,
  client_province TEXT,
  client_postal_code TEXT,
  client_country TEXT DEFAULT 'South Africa',
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  shipping_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  payment_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Create invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage invoice items" ON invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view own invoice items" ON invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
  `
}
