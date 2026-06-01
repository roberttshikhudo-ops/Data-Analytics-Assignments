import Link from "next/link"
import { Banknote, Copy, Mail, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import { CopyButton } from "@/components/store/copy-button"

interface EFTPageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function EFTInstructionsPage({ searchParams }: EFTPageProps) {
  const params = await searchParams
  const orderNumber = params.order

  // Fetch order details
  let order = null
  if (orderNumber) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("orders")
      .select("order_number, total, shipping_first_name, shipping_last_name")
      .eq("order_number", orderNumber)
      .single()
    order = data
  }

  const bankDetails = {
    bankName: "First National Bank (FNB)",
    accountName: "Agri Hub SA",
    accountNumber: "63014180606",
    branchCode: "250655",
    accountType: "Business Cheque",
    reference: orderNumber || "Your Order Number",
  }

  return (
    <div className="min-h-screen bg-muted/30 py-16">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">EFT Payment Instructions</CardTitle>
            <p className="text-muted-foreground">
              Please complete your payment using the bank details below
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {order && (
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {order.order_number}
                </p>
                <p className="text-lg font-semibold mt-2">
                  Amount Due: {formatPrice(order.total)}
                </p>
              </div>
            )}

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Bank Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-medium">{bankDetails.bankName}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-medium">{bankDetails.accountName}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{bankDetails.accountNumber}</span>
                    <CopyButton text={bankDetails.accountNumber} />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Branch Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{bankDetails.branchCode}</span>
                    <CopyButton text={bankDetails.branchCode} />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Type:</span>
                  <span className="font-medium">{bankDetails.accountType}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center bg-primary/5 -mx-6 px-6 py-3">
                  <span className="text-muted-foreground">Reference:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">
                      {bankDetails.reference}
                    </span>
                    <CopyButton text={bankDetails.reference} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Important</p>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1">
                    <li>
                      Use your order number <strong>{orderNumber}</strong> as the payment
                      reference
                    </li>
                    <li>Payment must be received within 48 hours to secure your order</li>
                    <li>
                      Your order will be processed once payment is confirmed (1-2 business
                      days)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Confirmation Email Sent</p>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve sent these payment instructions to your email address. Please
                    check your inbox.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/account/orders">
                  View Order Status
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>{" "}
            or call us at{" "}
            <a href="tel:+27791099490" className="text-primary hover:underline">
              079 109 9490
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
