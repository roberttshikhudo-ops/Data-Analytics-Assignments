import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Copy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SetupAvailabilityPage() {
  const supabase = await createClient()
  
  // Check if availability column exists
  const { data: testProduct, error } = await supabase
    .from("products")
    .select("availability")
    .limit(1)
  
  const columnExists = !error || !error.message.includes("availability")
  
  const sql = `ALTER TABLE products ADD COLUMN availability TEXT NOT NULL DEFAULT 'both' CHECK (availability IN ('both', 'online_only', 'in_store_only'));`

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm">Back to Admin</Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Product Availability Setup
            {columnExists ? (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Setup Required
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure products to be available online only, in-store only, or both.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {columnExists ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  The availability feature is set up and ready to use!
                </p>
                <p className="text-green-700 text-sm mt-1">
                  You can now mark products as online only, in-store only, or available in both locations.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">How to use:</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Go to Admin &rarr; Products</li>
                  <li>Edit any product</li>
                  <li>In the Availability card, select where the product is available</li>
                  <li>Save the product</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Availability Options:</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Both - Available online and in-store
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Online Only - Only purchasable online
                  </Badge>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    In-Store Only - Only available at physical stores
                  </Badge>
                </div>
              </div>
              
              <Link href="/admin/products">
                <Button>Go to Products</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 font-medium">
                  Database migration required
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  Run the following SQL in your Supabase SQL Editor to enable the availability feature.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Copy and run the SQL below</li>
                  <li>Refresh this page to verify</li>
                </ol>
              </div>
              
              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  {sql}
                </pre>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard?.writeText(sql)
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={() => window.location.reload()}>
                Refresh to Check Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
