import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, MapPin, Clock, Package, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Delivery Policy",
  description: "Agri Hub SA delivery areas, fees, and delivery times for Vhembe District and surrounding areas.",
}

export default function DeliveryPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Delivery Policy</h1>
          <p className="text-muted-foreground">
            Information about our delivery areas, fees, and times.
          </p>
        </div>

        <div className="space-y-6">
          {/* Delivery Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Agri Hub SA (Pty) Ltd delivers to the following areas:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Lambani</li>
                <li>Tshaulu</li>
                <li>Thohoyandou</li>
                <li>Surrounding villages within the Vhembe District</li>
              </ul>
              <p className="text-muted-foreground">
                If your area is not listed, please contact us on WhatsApp and we will confirm availability.
              </p>
            </CardContent>
          </Card>

          {/* Delivery Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Delivery fees depend on your location and will be confirmed before dispatch.
              </p>
              <p className="text-muted-foreground">
                Where possible, delivery fees are calculated by zone (area-based).
              </p>
            </CardContent>
          </Card>

          {/* Delivery Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Delivery Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Most local deliveries are completed within 24-72 hours depending on stock availability and workload.</li>
                <li>Same-day delivery may be possible for nearby areas (subject to availability).</li>
              </ul>
            </CardContent>
          </Card>

          {/* Stock Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Stock Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If an item is out of stock after ordering, Agri Hub will contact you immediately via phone or WhatsApp to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>offer an alternative product, OR</li>
                <li>adjust the quantity, OR</li>
                <li>cancel and refund the item (if already paid)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Delivery Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Delivery Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Customers must ensure:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>a correct delivery address is provided</li>
                <li>a reachable phone number is provided</li>
                <li>someone is available to receive the order</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Have questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> or WhatsApp us at 079 109 9490
          </p>
        </div>
      </div>
    </div>
  )
}
