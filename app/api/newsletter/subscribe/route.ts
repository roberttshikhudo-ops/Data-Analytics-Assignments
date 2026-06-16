import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/emails/welcome"

const WELCOME_CODE = "WELCOME10"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()
    const supabase = await createClient()

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: normalized,
      source: typeof source === "string" ? source.slice(0, 50) : "website",
      discount_code: WELCOME_CODE,
    })

    // 23505 = unique violation: the email is already subscribed. Treat as success
    // so returning visitors still get their code without leaking who is subscribed.
    if (error && error.code !== "23505") {
      console.error("[v0] Newsletter subscribe error:", error.message)
      return NextResponse.json({ error: "Could not subscribe right now. Please try again." }, { status: 500 })
    }

    const alreadySubscribed = error?.code === "23505"

    // Send the welcome email with the discount code to genuinely new subscribers.
    // sendWelcomeEmail never throws, so a mail failure won't break signup.
    if (!alreadySubscribed) {
      await sendWelcomeEmail(normalized)
    }

    return NextResponse.json({
      success: true,
      alreadySubscribed,
      discountCode: WELCOME_CODE,
      message: alreadySubscribed
        ? "You're already on the list! Use your code at checkout."
        : "Welcome to Agri Hub SA! Here's your discount code.",
    })
  } catch (err) {
    console.error("[v0] Newsletter subscribe exception:", err)
    return NextResponse.json({ error: "Could not subscribe right now. Please try again." }, { status: 500 })
  }
}
