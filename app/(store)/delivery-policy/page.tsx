import { Metadata } from 'next'
import { Truck, Clock, MapPin, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Delivery Policy | Agri Hub SA',
  description: 'Learn about Agri Hub SA delivery options, shipping times, and delivery areas.',
}

export default function DeliveryPolicyPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Delivery Policy</h1>
        
        <div className="grid gap-4 mb-8 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Truck className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Free Delivery</p>
                <p className="text-sm text-muted-foreground">Orders over R1,500</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Nationwide</p>
                <p className="text-sm text-muted-foreground">Delivery across SA</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Delivery Options</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-semibold">Area</th>
                    <th className="py-3 text-left font-semibold">Delivery Time</th>
                    <th className="py-3 text-left font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-3">Gauteng (Major cities)</td>
                    <td className="py-3">2-3 business days</td>
                    <td className="py-3">R75 / Free over R1,500</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Limpopo (Vhembe District)</td>
                    <td className="py-3">3-5 business days</td>
                    <td className="py-3">R100 / Free over R1,500</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Other Provinces</td>
                    <td className="py-3">5-7 business days</td>
                    <td className="py-3">R120 / Free over R1,500</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Remote Areas</td>
                    <td className="py-3">7-10 business days</td>
                    <td className="py-3">R150 / Free over R2,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Click & Collect</h2>
            <p className="text-muted-foreground">
              You can also collect your order from our stores in Vhembe District, Limpopo and 
              Midrand, Gauteng. Click & Collect orders are usually ready within 24 hours of 
              order confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Order Tracking</h2>
            <p className="text-muted-foreground">
              Once your order is dispatched, you will receive a tracking number via email and SMS. 
              You can track your order status on our website using the Track Order feature.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Important Notes</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Delivery times are estimates and may vary during peak periods</li>
              <li>Someone must be available to receive the delivery</li>
              <li>Please inspect your order upon delivery and report any damage immediately</li>
              <li>Bulk orders may require special delivery arrangements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              For delivery inquiries, contact us at:
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
