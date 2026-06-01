import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Agri Hub SA privacy policy - how we collect, use, and protect your information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Agri Hub SA (Pty) Ltd respects your privacy.
          </p>
        </div>

        <div className="space-y-6">
          {/* Information Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We collect customer information only for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>processing orders</li>
                <li>delivery and collection</li>
                <li>customer communication and support</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We do not sell or share customer information with third parties, except where required for payment processing or delivery services.
              </p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We take appropriate measures to protect your personal information and ensure secure transactions on our platform.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Questions about privacy? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
