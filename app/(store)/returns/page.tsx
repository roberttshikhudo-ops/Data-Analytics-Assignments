import { Metadata } from 'next'
import { RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Learn about Agri Hub SA returns policy, refund process, and exchange options.',
}

export default function ReturnsPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Returns & Refunds</h1>
        
        <div className="grid gap-4 mb-8 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <RotateCcw className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">7-Day Returns</p>
                <p className="text-sm text-muted-foreground">Easy return process</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Fast Refunds</p>
                <p className="text-sm text-muted-foreground">7-14 business days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Return Policy</h2>
            <p className="text-muted-foreground">
              We want you to be completely satisfied with your purchase. If you are not happy 
              with your order, you may return it within 7 days of delivery for a refund or exchange.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Conditions for Returns</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Item must be unused and in original condition</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Item must be in original packaging with all tags attached</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Proof of purchase (order number or receipt) required</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Return request must be made within 7 days of delivery</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Non-Returnable Items</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Perishable goods (seeds that have been opened, animal feeds)</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Chemical products that have been opened</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Items marked as final sale or clearance</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How to Return</h2>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
              <li>Contact us via email or phone to initiate a return request</li>
              <li>Provide your order number and reason for return</li>
              <li>We will provide you with return instructions</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Ship the item back or bring it to one of our stores</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Refund Process</h2>
            <p className="text-muted-foreground">
              Once we receive and inspect the returned item, we will process your refund within 
              7-14 business days. Refunds will be credited to the original payment method used 
              for the purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Damaged or Defective Items</h2>
            <p className="text-muted-foreground">
              If you receive a damaged or defective item, please contact us within 48 hours of 
              delivery with photos of the damage. We will arrange a replacement or full refund 
              at no additional cost to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              For returns and refunds inquiries, contact us at:
            </p>
            <p className="mt-2 text-muted-foreground">
              Email: info@agrihubsa.co.za<br />
              Phone: 079 109 9490 / 083 306 1529
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
