"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, CreditCard, Banknote, Loader2, Truck, MapPin, Zap } from "lucide-react"
import { SHIPPING_RATES } from "@/lib/types"

// localStorage key for remembering a shopper's checkout details between visits.
const SAVED_DETAILS_KEY = "checkout_details"

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
]

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  phone: string
  company: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
  sameAsBilling: boolean
  billingFirstName: string
  billingLastName: string
  billingCompany: string
  billingAddressLine1: string
  billingAddressLine2: string
  billingCity: string
  billingProvince: string
  billingPostalCode: string
  paymentMethod: "payfast" | "eft"
  shippingMethod: "standard" | "express" | "pickup"
  notes: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items: cart, subtotal, clearCart, isLoading: cartLoading } = useCart()
  const { user, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState("")
  
  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    sameAsBilling: true,
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
    billingProvince: "",
    billingPostalCode: "",
    paymentMethod: "payfast",
    shippingMethod: "standard",
    notes: "",
  })

  // Track whether we restored previously-saved details, to show a small notice.
  const [restoredDetails, setRestoredDetails] = useState(false)

  // Restore saved checkout details on first load so returning shoppers don't
  // have to re-enter everything (Shein-style faster checkout). We never store
  // payment card data here — payment is handled by PayFast on their servers.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_DETAILS_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved) as Partial<CheckoutForm>
      const hasAny = Object.values(parsed).some(
        (v) => typeof v === "string" && v.trim() !== "",
      )
      if (!hasAny) return
      setForm((prev) => ({
        ...prev,
        ...parsed,
        // Order notes are order-specific, so always start them fresh.
        notes: "",
      }))
      setRestoredDetails(true)
    } catch {
      // Ignore malformed saved data.
    }
  }, [])

  // Pre-fill contact fields from the signed-in user's profile. These overlay
  // any restored details so a logged-in customer's identity stays correct,
  // but we fall back to existing values when a profile field is empty.
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: profile?.first_name || prev.firstName,
        lastName: profile?.last_name || prev.lastName,
        phone: profile?.phone || prev.phone,
      }))
    }
  }, [user, profile])

  const clearSavedDetails = () => {
    try {
      localStorage.removeItem(SAVED_DETAILS_KEY)
    } catch {
      // Ignore storage errors.
    }
    setRestoredDetails(false)
  }

  // Redirect if cart is empty (but wait until the saved cart has finished
  // loading, and not while we're redirecting to payment). This prevents a
  // page refresh on checkout from bouncing a shopper who still has items.
  useEffect(() => {
    if (!cartLoading && cart.length === 0 && !isRedirecting) {
      router.push("/cart")
    }
  }, [cart, cartLoading, router, isRedirecting])

  // Calculate shipping based on selected method
  const getShippingCost = () => {
    if (form.shippingMethod === "pickup") return 0
    const rate = form.shippingMethod === "express" ? SHIPPING_RATES.express : SHIPPING_RATES.standard
    if (rate.freeThreshold && subtotal >= rate.freeThreshold) return 0
    return rate.price
  }
  const shipping = getShippingCost()
  const total = subtotal - couponDiscount + shipping

  const handleInputChange = (field: keyof CheckoutForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setCouponError("")
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon")
        setCouponDiscount(0)
        return
      }
      
      setCouponDiscount(data.discount)
    } catch {
      setCouponError("Failed to validate coupon")
      setCouponDiscount(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!form.email || !form.firstName || !form.lastName || !form.phone || 
        !form.addressLine1 || !form.city || !form.province || !form.postalCode) {
      alert("Please fill in all required fields")
      return
    }

    // Remember the shopper's contact, address and delivery/payment preferences
    // so their next checkout is pre-filled. Order-specific notes are excluded.
    try {
      const { notes: _notes, ...detailsToSave } = form
      localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify(detailsToSave))
    } catch {
      // Ignore storage errors (e.g. private mode / quota).
    }

    setIsLoading(true)

    try {
      // Create order for non-Stripe payments
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            company: form.company,
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
            phone: form.phone,
          },
          billingAddress: form.sameAsBilling
            ? {
                firstName: form.firstName,
                lastName: form.lastName,
                company: form.company,
                addressLine1: form.addressLine1,
                addressLine2: form.addressLine2,
                city: form.city,
                province: form.province,
                postalCode: form.postalCode,
                phone: form.phone,
              }
            : {
                firstName: form.billingFirstName,
                lastName: form.billingLastName,
                company: form.billingCompany,
                addressLine1: form.billingAddressLine1,
                addressLine2: form.billingAddressLine2,
                city: form.billingCity,
                province: form.billingProvince,
                postalCode: form.billingPostalCode,
                phone: form.phone,
              },
          email: form.email,
          paymentMethod: form.paymentMethod,
          shippingMethod: form.shippingMethod,
          couponCode: couponDiscount > 0 ? couponCode : null,
          notes: form.notes,
          subtotal,
          shipping,
          discount: couponDiscount,
          total,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order")
      }

      if (form.paymentMethod === "payfast") {
        // Redirect to PayFast
        const paymentRes = await fetch("/api/payfast/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            orderNumber: orderData.orderNumber,
            // Use the server-calculated total so the amount charged always
            // matches the stored order total (prevents ITN amount mismatches).
            amount: orderData.total ?? total,
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
          }),
        })

        const paymentData = await paymentRes.json()

        if (!paymentRes.ok) {
          throw new Error(paymentData.error || "Failed to initiate payment")
        }

        // Store order number in localStorage for after payment
        localStorage.setItem("pendingOrder", orderData.orderNumber)
        
        // Mark as redirecting so the empty-cart screen doesn't flash
        setIsRedirecting(true)
        
        // Clear cart before redirecting
        clearCart()
        
        // Create a hidden form and submit it to PayFast
        // PayFast requires POST submission - this will redirect the page
        const payfastForm = document.createElement("form")
        payfastForm.method = "POST"
        payfastForm.action = paymentData.payfastUrl
        // Don't use target="_blank" - submit directly in current window
        
        // Add all form fields
        for (const [key, value] of Object.entries(paymentData.formData)) {
          if (value !== undefined && value !== "") {
            const input = document.createElement("input")
            input.type = "hidden"
            input.name = key
            input.value = String(value)
            payfastForm.appendChild(input)
          }
        }
        
        document.body.appendChild(payfastForm)
        payfastForm.submit()
        // Don't remove form - page will redirect
      } else {
        // EFT payment - redirect to order confirmation with banking details
        setIsRedirecting(true)
        clearCart()
        router.push(`/checkout/eft-instructions?order=${orderData.orderNumber}`)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert(error instanceof Error ? error.message : "Checkout failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (cartLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {isRedirecting && (
          <p className="text-muted-foreground">Redirecting to secure payment...</p>
        )}
      </div>
    )
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-3xl text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-6xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {restoredDetails && (
                    <div className="flex items-center justify-between gap-3 rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
                      <p className="text-sm text-muted-foreground">
                        Welcome back! We&apos;ve filled in your saved details for faster checkout.
                      </p>
                      <button
                        type="button"
                        onClick={clearSavedDetails}
                        className="text-sm font-medium text-primary underline whitespace-nowrap"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        required
                        value={form.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        required
                        value={form.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="082 123 4567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      value={form.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine1">Street Address *</Label>
                    <Input
                      id="addressLine1"
                      required
                      value={form.addressLine1}
                      onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                      placeholder="123 Farm Road"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Apartment, suite, etc. (Optional)</Label>
                    <Input
                      id="addressLine2"
                      value={form.addressLine2}
                      onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City/Town *</Label>
                      <Input
                        id="city"
                        required
                        value={form.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Province *</Label>
                      <select
                        id="province"
                        required
                        value={form.province}
                        onChange={(e) => handleInputChange("province", e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select province</option>
                        {SA_PROVINCES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      required
                      value={form.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      placeholder="0001"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={form.shippingMethod}
                    onValueChange={(value) => handleInputChange("shippingMethod", value)}
                    className="space-y-3"
                  >
                    {/* Standard Shipping */}
                    <div className={`relative flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${form.shippingMethod === "standard" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <RadioGroupItem value="standard" id="shipping-standard" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="shipping-standard" className="flex items-center gap-2 cursor-pointer font-medium">
                            <Truck className="h-4 w-4" />
                            {SHIPPING_RATES.standard.name}
                          </Label>
                          <span className="font-semibold">
                            {subtotal >= SHIPPING_RATES.standard.freeThreshold ? (
                              <span className="text-green-600">FREE</span>
                            ) : (
                              formatPrice(SHIPPING_RATES.standard.price)
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{SHIPPING_RATES.standard.description}</p>
                        {subtotal < SHIPPING_RATES.standard.freeThreshold && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Free shipping on orders over {formatPrice(SHIPPING_RATES.standard.freeThreshold)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Express Shipping */}
                    <div className={`relative flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${form.shippingMethod === "express" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <RadioGroupItem value="express" id="shipping-express" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="shipping-express" className="flex items-center gap-2 cursor-pointer font-medium">
                            <Zap className="h-4 w-4" />
                            {SHIPPING_RATES.express.name}
                          </Label>
                          <span className="font-semibold">{formatPrice(SHIPPING_RATES.express.price)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{SHIPPING_RATES.express.description}</p>
                      </div>
                    </div>

                    {/* Local Pickup */}
                    <div className={`relative flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${form.shippingMethod === "pickup" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <RadioGroupItem value="pickup" id="shipping-pickup" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="shipping-pickup" className="flex items-center gap-2 cursor-pointer font-medium">
                            <MapPin className="h-4 w-4" />
                            Local Pickup
                          </Label>
                          <span className="font-semibold text-green-600">FREE</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Pick up from our store location</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Agri Hub SA, Limpopo Province
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsBilling"
                      checked={form.sameAsBilling}
                      onCheckedChange={(checked) =>
                        handleInputChange("sameAsBilling", checked as boolean)
                      }
                    />
                    <Label htmlFor="sameAsBilling" className="font-normal">
                      Same as shipping address
                    </Label>
                  </div>

                  {!form.sameAsBilling && (
                    <div className="space-y-4 pt-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingFirstName">First Name *</Label>
                          <Input
                            id="billingFirstName"
                            required={!form.sameAsBilling}
                            value={form.billingFirstName}
                            onChange={(e) =>
                              handleInputChange("billingFirstName", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">Last Name *</Label>
                          <Input
                            id="billingLastName"
                            required={!form.sameAsBilling}
                            value={form.billingLastName}
                            onChange={(e) =>
                              handleInputChange("billingLastName", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="billingCompany">Company (Optional)</Label>
                        <Input
                          id="billingCompany"
                          value={form.billingCompany}
                          onChange={(e) =>
                            handleInputChange("billingCompany", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingAddressLine1">Street Address *</Label>
                        <Input
                          id="billingAddressLine1"
                          required={!form.sameAsBilling}
                          value={form.billingAddressLine1}
                          onChange={(e) =>
                            handleInputChange("billingAddressLine1", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingAddressLine2">
                          Apartment, suite, etc. (Optional)
                        </Label>
                        <Input
                          id="billingAddressLine2"
                          value={form.billingAddressLine2}
                          onChange={(e) =>
                            handleInputChange("billingAddressLine2", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingCity">City/Town *</Label>
                          <Input
                            id="billingCity"
                            required={!form.sameAsBilling}
                            value={form.billingCity}
                            onChange={(e) =>
                              handleInputChange("billingCity", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingProvince">Province *</Label>
                          <select
                            id="billingProvince"
                            required={!form.sameAsBilling}
                            value={form.billingProvince}
                            onChange={(e) =>
                              handleInputChange("billingProvince", e.target.value)
                            }
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Select province</option>
                            {SA_PROVINCES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <Label htmlFor="billingPostalCode">Postal Code *</Label>
                        <Input
                          id="billingPostalCode"
                          required={!form.sameAsBilling}
                          value={form.billingPostalCode}
                          onChange={(e) =>
                            handleInputChange("billingPostalCode", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={form.paymentMethod}
                    onValueChange={(value) =>
                      handleInputChange("paymentMethod", value as "payfast" | "eft")
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 border-primary bg-primary/5">
                      <RadioGroupItem value="payfast" id="payfast" />
                      <Label
                        htmlFor="payfast"
                        className="flex-1 cursor-pointer flex items-center gap-3"
                      >
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">PayFast (Recommended)</p>
                          <p className="text-sm text-muted-foreground">
                            Card, Instant EFT, SnapScan, Mobicred
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="eft" id="eft" />
                      <Label
                        htmlFor="eft"
                        className="flex-1 cursor-pointer flex items-center gap-3"
                      >
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Manual EFT/Bank Transfer</p>
                          <p className="text-sm text-muted-foreground">
                            Pay directly to our bank account
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Special delivery instructions, farm gate access codes, etc."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden relative">
                          {item.image ? (
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <Label htmlFor="coupon">Coupon Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyCoupon}
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-destructive">{couponError}</p>
                    )}
                    {couponDiscount > 0 && (
                      <p className="text-sm text-green-600">
                        Coupon applied! You save {formatPrice(couponDiscount)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        {form.shippingMethod === "pickup" ? (
                          <>
                            <MapPin className="h-3 w-3" />
                            Local Pickup
                          </>
                        ) : form.shippingMethod === "express" ? (
                          <>
                            <Zap className="h-3 w-3" />
                            Express
                          </>
                        ) : (
                          <>
                            <Truck className="h-3 w-3" />
                            Standard
                          </>
                        )}
                      </span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    {shipping === 0 && form.shippingMethod !== "pickup" && (
                      <p className="text-xs text-green-600">
                        Free shipping on orders over {formatPrice(SHIPPING_RATES.standard.freeThreshold)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : form.paymentMethod === "payfast" ? (
                      "Pay with PayFast"
                    ) : (
                      "Complete Order (EFT)"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our{" "}
                    <Link href="/terms" className="underline">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
