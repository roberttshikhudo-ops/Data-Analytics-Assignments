import Link from "next/link"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReferCallout } from "@/components/marketing/refer-callout"

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const orderNumber = params.order || "N/A"

  return (
    <div className="min-h-screen bg-muted/30 py-16">
      <div className="container max-w-2xl">
        <Card>
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Thank you for your order!
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your payment was successful
            </p>

            <div className="bg-muted rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-2xl font-mono font-bold text-primary">
                {orderNumber}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 text-left p-4 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve sent a confirmation email with your order details and receipt.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left p-4 bg-muted/50 rounded-lg">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Your order is being prepared and will be shipped within 1-2 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/account/orders">
                  View Order Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <div>
                <Button asChild variant="ghost">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ReferCallout title="Enjoyed shopping with us? Earn your friends 10% off." className="mt-8" />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Questions about your order?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
