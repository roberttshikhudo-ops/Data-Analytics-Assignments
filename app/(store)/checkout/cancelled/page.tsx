import Link from "next/link"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CancelledPageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function CheckoutCancelledPage({ searchParams }: CancelledPageProps) {
  const params = await searchParams
  const orderNumber = params.order

  return (
    <div className="min-h-screen bg-muted/30 py-16">
      <div className="container max-w-2xl">
        <Card>
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payment Cancelled
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your payment was not completed
            </p>

            {orderNumber && (
              <div className="bg-muted rounded-lg p-4 mb-8">
                <p className="text-sm text-muted-foreground">Order Reference</p>
                <p className="text-xl font-mono font-bold">{orderNumber}</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
              <p className="font-medium text-amber-800 mb-2">What happened?</p>
              <p className="text-sm text-amber-700">
                Your payment was cancelled or could not be processed. Your cart items
                are still saved, and no charges were made to your account.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/checkout">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
              <div>
                <Button asChild variant="outline">
                  <Link href="/cart">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Cart
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Having trouble with payment?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
