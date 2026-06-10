import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Where contact form submissions are delivered.
const TO_EMAIL = "robert.tshikhudo@gmail.com"

// Resend requires the "from" address to use a domain you've verified in Resend.
// Until agrihubsa.co.za is verified, Resend's shared onboarding domain is used.
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Agri Hub SA <onboarding@resend.dev>"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error("[v0] RESEND_API_KEY is not set")
      return NextResponse.json(
        { error: "Email service is not configured. Please contact the site administrator." },
        { status: 500 },
      )
    }

    const body = await request.json()
    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim()
    const phone = String(body.phone || "").trim()
    const subject = String(body.subject || "").trim()
    const message = String(body.message || "").trim()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
    }

    const resend = new Resend(apiKey)

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #166534;">New Contact Form Submission</h2>
        <p>You have received a new message from the Agri Hub SA website contact form.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 120px;">Name</td><td style="padding: 8px;">${escapeHtml(name)}</td></tr>
          <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${escapeHtml(phone) || "Not provided"}</td></tr>
          <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Subject</td><td style="padding: 8px;">${escapeHtml(subject)}</td></tr>
        </table>
        <div style="margin-top: 16px;">
          <p style="font-weight: bold; margin-bottom: 4px;">Message</p>
          <p style="white-space: pre-wrap; padding: 12px; background: #f9fafb; border-radius: 8px;">${escapeHtml(message)}</p>
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject: `[Agri Hub SA Contact] ${subject}`,
      html,
    })

    if (error) {
      console.error("[v0] Resend send error:", error)
      return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Contact route error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 })
  }
}
