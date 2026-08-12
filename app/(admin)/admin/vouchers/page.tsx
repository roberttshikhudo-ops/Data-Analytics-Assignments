import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Info } from "lucide-react"
import { GiftVoucherGenerator } from "@/components/admin/gift-voucher-generator"

export const metadata = {
  title: "Gift Vouchers | Agri Hub SA Admin",
  description: "Create and download professional gift vouchers for customers.",
}

export default function VouchersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Gift className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Gift Vouchers</h1>
          <p className="mt-1 text-muted-foreground text-pretty">
            Reward your customers with a professional Agri Hub SA gift voucher. Fill in the
            details, preview it live, then download a print-ready image to send by WhatsApp,
            email or hand out in store.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5" /> Voucher Designer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GiftVoucherGenerator />
        </CardContent>
      </Card>

      <Card className="border-emerald-300 bg-emerald-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-emerald-800">
            <Info className="h-5 w-5" /> Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Leave the customer name blank to create a generic voucher you can reuse for
            any shopper.
          </p>
          <p>
            • The minimum spend appears as a condition on the voucher — set it to control
            when the reward can be redeemed.
          </p>
          <p>
            • Each voucher gets a unique code. Use the refresh button to generate a new one,
            or type your own to match a coupon you have set up under Coupons.
          </p>
          <p>
            • The downloaded PNG is high resolution (1600 × 800px) and prints cleanly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
