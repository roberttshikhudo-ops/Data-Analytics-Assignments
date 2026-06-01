import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 })
    }

    // Check validity dates
    const now = new Date()
    
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json({ error: "Coupon is not yet active" }, { status: 400 })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
    }

    // Check minimum order amount
    if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of R${coupon.minimum_order_amount.toFixed(2)} required`,
        },
        { status: 400 }
      )
    }

    // Calculate discount
    let discount = 0
    if (coupon.discount_type === "percentage") {
      discount = (subtotal * coupon.discount_value) / 100
      if (coupon.maximum_discount) {
        discount = Math.min(discount, coupon.maximum_discount)
      }
    } else {
      discount = Math.min(coupon.discount_value, subtotal)
    }

    return NextResponse.json({
      valid: true,
      discount,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      description: coupon.description,
    })
  } catch (error) {
    console.error("Coupon validation error:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
