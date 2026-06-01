import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Fetch customer's invoices
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_type,
        status,
        invoice_date,
        due_date,
        total,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching invoices:", error)
      return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }

    return NextResponse.json(invoices || [])
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
