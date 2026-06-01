import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Agri Hub SA terms and conditions for using our services and placing orders.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground">
            Please read these terms carefully before placing an order.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Agreement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By placing an order with Agri Hub SA (Pty) Ltd, customers agree to the following terms and conditions:
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                <li>Product prices may change without notice</li>
                <li>Stock availability is not guaranteed until confirmed</li>
                <li>Delivery times may vary due to operational conditions</li>
                <li>Agri Hub reserves the right to cancel orders where necessary and refund customers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Related Policies</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/policies/delivery" className="text-primary hover:underline">
                    Delivery Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies/returns" className="text-primary hover:underline">
                    Returns &amp; Refunds Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies/payment" className="text-primary hover:underline">
                    Payment Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> or WhatsApp us at 079 109 9490
          </p>
        </div>
      </div>
    </div>
  )
}
