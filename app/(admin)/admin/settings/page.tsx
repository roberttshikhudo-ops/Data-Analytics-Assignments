"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Truck, Bell, Shield, Save } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Agri Hub SA",
    storeEmail: "robert.tshikhudo@gmail.com",
    storePhone: "+27 12 345 6789",
    storeAddress: "123 Farm Road, Pretoria, Gauteng, South Africa",
    currency: "ZAR",
    taxRate: "15",
  })

  // Shipping Settings
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: "1000",
    standardShippingRate: "80",
    expressShippingRate: "300",
    enableLocalPickup: true,
    pickupAddress: "123 Farm Road, Pretoria, Gauteng",
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNewOrders: true,
    emailLowStock: true,
    emailCustomerSignup: false,
    lowStockThreshold: "10",
  })

  const handleSaveSettings = async () => {
    setLoading(true)
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings and preferences</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Shipping</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={storeSettings.taxRate}
                  onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: e.target.value })}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>Configure shipping rates and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (R)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Orders above this amount get free shipping</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="standardShippingRate">Standard Shipping Rate (R)</Label>
                  <Input
                    id="standardShippingRate"
                    type="number"
                    value={shippingSettings.standardShippingRate}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, standardShippingRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expressShippingRate">Express Shipping Rate (R)</Label>
                  <Input
                    id="expressShippingRate"
                    type="number"
                    value={shippingSettings.expressShippingRate}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, expressShippingRate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Enable Local Pickup</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to pick up orders from your location</p>
                </div>
                <Switch
                  checked={shippingSettings.enableLocalPickup}
                  onCheckedChange={(checked) => setShippingSettings({ ...shippingSettings, enableLocalPickup: checked })}
                />
              </div>
              {shippingSettings.enableLocalPickup && (
                <div className="space-y-2">
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <Textarea
                    id="pickupAddress"
                    value={shippingSettings.pickupAddress}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, pickupAddress: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>New Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email when a new order is placed</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNewOrders}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNewOrders: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive email when product stock is low</p>
                </div>
                <Switch
                  checked={notificationSettings.emailLowStock}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailLowStock: checked })}
                />
              </div>
              {notificationSettings.emailLowStock && (
                <div className="space-y-2 pl-4">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={notificationSettings.lowStockThreshold}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockThreshold: e.target.value })}
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground">Alert when stock falls below this number</p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Customer Signup Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email when a new customer signs up</p>
                </div>
                <Switch
                  checked={notificationSettings.emailCustomerSignup}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailCustomerSignup: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security and access settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Admin Access</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Only users with the admin role can access this panel. Manage user roles in the Customers section.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Session Security</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sessions are managed by Supabase Auth with secure token refresh.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">API Keys</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  API keys are securely stored as environment variables and are not exposed to the client.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
        {saved && (
          <span className="text-sm text-green-600">Settings saved successfully!</span>
        )}
      </div>
    </div>
  )
}
