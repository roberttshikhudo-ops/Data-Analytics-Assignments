import { NextRequest, NextResponse } from "next/server"
import { createPayFastPayment } from "@/lib/payfast"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderNumber, amount, email, firstName, lastName } = body

    if (!orderId || !orderNumber || !amount || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get("origin") || "http://localhost:3000"

    const paymentData = {
      orderId,
      orderNumber,
      amount,
      email,
      firstName: firstName || "Customer",
      lastName: lastName || "",
      returnUrl: `${baseUrl}/checkout/success?order=${orderNumber}`,
      cancelUrl: `${baseUrl}/checkout/cancelled?order=${orderNumber}`,
      notifyUrl: `${baseUrl}/api/payfast/itn`,
    }

    const { url, formData } = createPayFastPayment(paymentData)

    console.log("[v0] PayFast payment created:", {
      url,
      orderId,
      amount,
      merchantId: formData.merchant_id,
      formDataKeys: Object.keys(formData),
    })

    // Return the PayFast URL and form data for POST submission
    // PayFast requires form POST, not GET with query params
    return NextResponse.json({
      payfastUrl: url,
      formData,
    })
  } catch (error) {
    console.error("PayFast create payment error:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
