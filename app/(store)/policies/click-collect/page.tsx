import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, CheckCircle, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Click & Collect",
  description: "Order online and pick up your items at our Tshaulu or Tshifudi stores in Vhembe District.",
}

export default function ClickCollectPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Click &amp; Collect</h1>
          <p className="text-muted-foreground">
            Order online and pick up in store at your convenience.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Agri Hub offers Click &amp; Collect for customers who prefer to pick up in store.
              </p>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>Place your order online or via WhatsApp</li>
                <li>We confirm stock availability</li>
                <li>We notify you when your order is ready for collection</li>
                <li>You collect in store during operating hours</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                What to Bring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please bring your order number or WhatsApp confirmation message when collecting your order.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Collection Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Tshaulu Store</h4>
                <p className="text-muted-foreground">Tshaulu Village, Vhembe District, Limpopo</p>
              </div>
              <div>
                <h4 className="font-semibold">Tshifudi Store</h4>
                <p className="text-muted-foreground">Tshifudi Village, Vhembe District, Limpopo</p>
              </div>
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
