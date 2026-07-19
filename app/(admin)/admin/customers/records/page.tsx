import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { CustomerRecords } from "@/components/admin/customer-records"

async function getCustomers() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from("customers")
    .select(`
      *,
      orders(
        id,
        order_number,
        total,
        status,
        payment_status,
        delivery_status,
        created_at,
        order_payments(amount)
      )
    `)
    .order("name")

  return customers || []
}

export default async function CustomerRecordsPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Records</h1>
          <p className="text-muted-foreground">
            Reusable customers for manual orders, with history and balances
          </p>
        </div>
      </div>

      <CustomerRecords customers={customers} />
    </div>
  )
}
