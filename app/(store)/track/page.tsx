"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react"

interface TrackingEvent {
  date: string
  status: string
  location: string
}

interface TrackingResult {
  trackingNumber: string
  status: string
  events: TrackingEvent[]
}

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState("")

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`/api/shipping/track?trackingNumber=${encodeURIComponent(trackingNumber)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to track shipment")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to track shipment")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "in transit":
        return <Truck className="h-6 w-6 text-blue-500" />
      case "out for delivery":
        return <MapPin className="h-6 w-6 text-orange-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Package className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Track Your Order</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Enter your tracking number to see the delivery status
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Tracking Number</CardTitle>
            <CardDescription>
              You can find your tracking number in your order confirmation email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 text-base"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Tracking..." : "Track"}
              </Button>
            </form>

            {error && (
              <p className="mt-4 text-destructive text-base">{error}</p>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tracking: {result.trackingNumber}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Status: <span className="font-semibold text-foreground">{result.status}</span>
                  </CardDescription>
                </div>
                {getStatusIcon(result.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.events && result.events.length > 0 ? (
                  result.events.map((event, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium text-base">{event.status}</p>
                        <p className="text-muted-foreground">{event.location}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No tracking events available yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-muted-foreground">
          <p className="text-base">
            Need help? Contact us at{" "}
            <a href="tel:+27833061529" className="text-primary hover:underline">
              083 306 1529
            </a>{" "}
            or via{" "}
            <a
              href="https://wa.me/27833061529"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
