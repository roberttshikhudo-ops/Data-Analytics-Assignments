import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupInvoiceTables() {
  console.log('Setting up invoice tables...')
  
  // Create invoices table
  const { error: invoicesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number TEXT NOT NULL,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        user_id UUID,
        invoice_type TEXT NOT NULL DEFAULT 'order' CHECK (invoice_type IN ('order', 'manual')),
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
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
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
    `
  })

  if (invoicesError) {
    console.log('Note: invoices table might already exist or requires direct SQL access')
  }

  console.log('Setup complete. If tables were not created, please run the SQL manually in Supabase dashboard.')
}

setupInvoiceTables()
