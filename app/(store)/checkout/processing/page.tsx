"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function ProcessingContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8">
      <div className="container max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
            <CardDescription>
              A new window has opened for you to complete your payment with PayFast
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Order Number</h3>
              <p className="text-2xl font-mono font-bold text-primary">{orderNumber}</p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Complete your payment in the PayFast window that opened
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Once payment is complete, you will be redirected back here
              </p>
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Payment window did not open?
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/checkout/success?order=${orderNumber}`}>
                  I have completed my payment
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/checkout">
                  Return to checkout
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8">
        <div className="container max-w-lg">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  )
}
