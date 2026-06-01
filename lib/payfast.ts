import crypto from "crypto"

// PayFast configuration
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID!
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY!
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || ""
const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === "true"

const PAYFAST_URL = PAYFAST_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process"

const PAYFAST_VALIDATE_URL = PAYFAST_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/query/validate"
  : "https://www.payfast.co.za/eng/query/validate"

export interface PayFastPaymentData {
  orderId: string
  orderNumber: string
  amount: number
  email: string
  firstName: string
  lastName: string
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
}

export interface PayFastParams {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  name_last: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
  item_description?: string
  custom_str1?: string
  signature?: string
}

// Generate MD5 signature for PayFast
function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // PayFast requires specific parameter order matching the form field order
  const orderedKeys = [
    'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
    'name_first', 'name_last', 'email_address', 'm_payment_id', 'amount',
    'item_name', 'item_description', 'custom_str1'
  ]
  
  const params: string[] = []
  for (const key of orderedKeys) {
    if (data[key] !== undefined && data[key] !== "") {
      // URL encode each value, replacing spaces with +
      const value = encodeURIComponent(data[key].trim()).replace(/%20/g, "+")
      params.push(`${key}=${value}`)
    }
  }

  let pfOutput = params.join("&")

  // Add passphrase if provided and not empty
  if (passphrase && passphrase.trim() !== "") {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
  }

  console.log("[v0] PayFast signature string:", pfOutput)
  
  return crypto.createHash("md5").update(pfOutput).digest("hex")
}

// Create PayFast payment URL with form data
export function createPayFastPayment(data: PayFastPaymentData): {
  url: string
  formData: PayFastParams
} {
  const params: PayFastParams = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: data.returnUrl,
    cancel_url: data.cancelUrl,
    notify_url: data.notifyUrl,
    name_first: data.firstName,
    name_last: data.lastName,
    email_address: data.email,
    m_payment_id: data.orderId,
    amount: data.amount.toFixed(2),
    item_name: `Agri Hub SA Order #${data.orderNumber}`,
    item_description: `Order ${data.orderNumber} from Agri Hub SA`,
    custom_str1: data.orderNumber,
  }

  // Generate signature
  const dataForSignature: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      dataForSignature[key] = value
    }
  }
  params.signature = generateSignature(dataForSignature, PAYFAST_PASSPHRASE)

  return {
    url: PAYFAST_URL,
    formData: params,
  }
}

// Validate PayFast ITN (Instant Transaction Notification)
export async function validatePayFastITN(
  pfData: Record<string, string>,
  pfParamString: string
): Promise<{ valid: boolean; error?: string }> {
  // Verify signature
  const signature = pfData.signature
  delete pfData.signature

  const calculatedSignature = generateSignature(pfData, PAYFAST_PASSPHRASE)

  if (signature !== calculatedSignature) {
    return { valid: false, error: "Invalid signature" }
  }

  // Verify source IP (PayFast IPs)
  // In production, you would check the request IP against PayFast's IP list
  // For now, we'll skip this in sandbox mode

  // Verify data with PayFast server
  try {
    const response = await fetch(PAYFAST_VALIDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: pfParamString,
    })

    const result = await response.text()

    if (result !== "VALID") {
      return { valid: false, error: "PayFast validation failed" }
    }

    // Verify payment amount matches order
    // This should be done by comparing pfData.amount_gross with the order total

    return { valid: true }
  } catch (error) {
    console.error("PayFast validation error:", error)
    return { valid: false, error: "Validation request failed" }
  }
}

// Payment status mapping
export function getPaymentStatus(pfPaymentStatus: string): "paid" | "failed" | "pending" {
  switch (pfPaymentStatus) {
    case "COMPLETE":
      return "paid"
    case "FAILED":
    case "CANCELLED":
      return "failed"
    default:
      return "pending"
  }
}
