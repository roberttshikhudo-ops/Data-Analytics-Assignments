"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

const INVOICE_SQL = `-- Create invoices table
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

-- RLS Policies for invoices
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for invoice_items
CREATE POLICY "Admins can manage invoice items" ON invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view own invoice items" ON invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);`

export default function SetupInvoicesPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(INVOICE_SQL)
    setCopied(true)
    toast.success("SQL copied to clipboard!")
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Setup Invoice Tables</CardTitle>
          <CardDescription>
            Follow these steps to enable the invoice feature
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Copy the SQL below</h3>
                <p className="text-sm text-muted-foreground">Click the button to copy the SQL to your clipboard</p>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-64 overflow-y-auto">
                {INVOICE_SQL}
              </pre>
              <Button
                onClick={copyToClipboard}
                className="absolute top-2 right-2"
                size="sm"
                variant={copied ? "default" : "secondary"}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy SQL
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Open Supabase SQL Editor</h3>
                <p className="text-sm text-muted-foreground mb-2">Go to your Supabase project and open the SQL Editor</p>
                <Button asChild variant="outline">
                  <a 
                    href="https://supabase.com/dashboard/project/qghainbmqtxvgrkrfbkk/sql/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open SQL Editor
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Paste and Run</h3>
                <p className="text-sm text-muted-foreground">
                  Paste the SQL into the editor and click <strong>Run</strong>. 
                  You should see &quot;Success. No rows returned&quot;
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold">Start Creating Invoices</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Once done, go to Admin &gt; Invoices to create your first invoice
                </p>
                <Button asChild>
                  <a href="/admin/invoices">Go to Invoices</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
