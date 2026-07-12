import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ManualOrderForm } from "@/components/admin/manual-order-form"

async function getData() {
  const supabase = await createClient()

  const [{ data: products }, { data: customers }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, image_url")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("customers")
      .select("*")
      .order("name"),
  ])

  return { products: products || [], customers: customers || [] }
}

export default async function NewManualOrderPage() {
  const { products, customers } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Manual Order</h1>
          <p className="text-muted-foreground">
            Capture a phone, WhatsApp, or in-person order
          </p>
        </div>
      </div>

      <ManualOrderForm products={products} customers={customers} />
    </div>
  )
}
