import { Resend } from "resend"

const WELCOME_CODE = "WELCOME10"
const SHOP_URL = "https://agrihubsa.co.za/promo/winter-specials"

// Resend requires a verified domain for the "from" address. Until agrihubsa.co.za
// is verified in Resend, the shared onboarding domain is used as a safe default.
const FROM_EMAIL =
  process.env.NEWSLETTER_FROM_EMAIL ||
  process.env.CONTACT_FROM_EMAIL ||
  "Agri Hub SA <onboarding@resend.dev>"

/**
 * Sends the automated welcome email containing the WELCOME10 discount code.
 * Returns true if the email was sent, false otherwise. Never throws so that a
 * mail failure cannot block a newsletter signup.
 */
export async function sendWelcomeEmail(to: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[v0] RESEND_API_KEY is not set - skipping welcome email")
    return false
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Welcome to Agri Hub SA - here's 10% off your first order",
      html: buildWelcomeHtml(),
    })

    if (error) {
      console.error("[v0] Welcome email send error:", error)
      return false
    }
    return true
  } catch (err) {
    console.error("[v0] Welcome email exception:", err)
    return false
  }
}

function buildWelcomeHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Agri Hub SA</title>
</head>
<body style="margin:0; padding:0; background:#f4f5f4; font-family: Arial, Helvetica, sans-serif; color:#1f2937;">
  <div style="max-width:600px; margin:0 auto; padding:24px;">
    <div style="background:#166534; padding:32px 24px; border-radius:12px 12px 0 0; text-align:center;">
      <h1 style="margin:0; color:#ffffff; font-size:24px;">Welcome to Agri Hub SA</h1>
      <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:15px;">
        Quality products for your farm, home &amp; business
      </p>
    </div>

    <div style="background:#ffffff; padding:32px 24px; border:1px solid #e5e7eb; border-top:none;">
      <p style="margin:0 0 16px; font-size:16px;">Hi there,</p>
      <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">
        Thanks for joining our community! As a welcome gift, here's
        <strong>10% off</strong> your first order.
      </p>

      <div style="border:2px dashed #166534; border-radius:10px; padding:20px; text-align:center; background:#f0fdf4; margin-bottom:24px;">
        <p style="margin:0 0 6px; font-size:13px; letter-spacing:1px; text-transform:uppercase; color:#15803d;">
          Your discount code
        </p>
        <p style="margin:0; font-size:30px; font-weight:bold; letter-spacing:3px; color:#166534;">
          ${WELCOME_CODE}
        </p>
        <p style="margin:8px 0 0; font-size:13px; color:#6b7280;">Apply at checkout</p>
      </div>

      <div style="text-align:center; margin-bottom:24px;">
        <a href="${SHOP_URL}" style="display:inline-block; background:#166534; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; font-weight:bold;">
          Shop Winter Specials
        </a>
      </div>

      <p style="margin:0; font-size:15px; line-height:1.6; color:#4b5563;">
        Plus, enjoy <strong>FREE delivery</strong> on orders over R1,000, with fast
        nationwide shipping right to your door.
      </p>
    </div>

    <div style="background:#1f2937; padding:20px 24px; border-radius:0 0 12px 12px; text-align:center;">
      <p style="margin:0; color:#ffffff; font-size:13px;">Agri Hub SA</p>
      <p style="margin:6px 0 0; color:rgba(255,255,255,0.7); font-size:12px;">
        www.agrihubsa.co.za &middot; info@agrihubsa.co.za
      </p>
    </div>
  </div>
</body>
</html>
  `
}
