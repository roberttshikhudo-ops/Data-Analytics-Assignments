import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "Returns & Refunds Policy",
  description: "Agri Hub SA returns and refunds policy - how to return items and get refunds.",
}

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Returns &amp; Refunds Policy</h1>
          <p className="text-muted-foreground">
            Agri Hub SA (Pty) Ltd aims to ensure customers receive quality products.
          </p>
        </div>

        <div className="space-y-6">
          {/* Returns Accepted */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                Returns Accepted (Eligible)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Returns are accepted within <strong>7 days</strong> of purchase if:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>the item is unused</li>
                <li>the item is in original packaging</li>
                <li>proof of purchase is provided</li>
              </ul>
            </CardContent>
          </Card>

          {/* Non-Returnable Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Non-Returnable Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">The following items may not be returned:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>opened chemicals and pesticides</li>
                <li>used tools</li>
                <li>perishable items (if applicable)</li>
                <li>special orders (items sourced specifically for a customer)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Damaged or Incorrect Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Damaged or Incorrect Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you receive an incorrect or damaged item, please contact us within <strong>48 hours</strong> of delivery/collection with:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>a photo of the item</li>
                <li>your order details</li>
              </ul>
              <p className="text-muted-foreground">
                We will replace the item where possible or refund if replacement is not possible.
              </p>
            </CardContent>
          </Card>

          {/* Refund Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Refund Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Refunds are processed within <strong>3-7 working days</strong> after the return is approved.
              </p>
              <p className="text-muted-foreground">
                Refunds will be made using the original payment method.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Need to return an item? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> or WhatsApp us at 079 109 9490
          </p>
        </div>
      </div>
    </div>
  )
}
