import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Building, Banknote } from "lucide-react"

export const metadata: Metadata = {
  title: "Payment Policy",
  description: "Agri Hub SA payment options - card payments, EFT, and cash on delivery.",
}

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment Policy</h1>
          <p className="text-muted-foreground">
            Agri Hub offers multiple convenient payment options.
          </p>
        </div>

        <div className="space-y-6">
          {/* Online Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Online Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Card payments (Visa, Mastercard, American Express)</li>
                <li>Instant EFT (PayFast / Peach Payments)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Manual EFT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Manual EFT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Customers may pay by EFT and send proof of payment via WhatsApp or email.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Important:</p>
                <p className="text-sm text-muted-foreground">
                  Orders paid by EFT are processed once payment reflects or proof is verified.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cash on Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Cash on Delivery (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cash on delivery is available only for selected local areas and orders below a certain value. 
                Agri Hub may confirm this case-by-case.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Questions about payment? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> or WhatsApp us at 079 109 9490
          </p>
        </div>
      </div>
    </div>
  )
}
