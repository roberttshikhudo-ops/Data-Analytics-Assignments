"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export type ForgotState = { error: string | null; sent: boolean }

export async function forgotPasswordAction(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!email) return { error: "Please enter your email address.", sent: false }

  const h = await headers()
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`

  // In the v0 preview the redirect proxy forwards to /auth/callback; in
  // production we hit the callback route directly.
  const callbackBase = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${origin}/auth/callback`
  const redirectTo = `${callbackBase}${callbackBase.includes("?") ? "&" : "?"}next=${encodeURIComponent("/auth/reset-password")}`

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  if (error) {
    console.error("[auth] reset email failed:", error.status, error.message)
    if (error.status === 429) {
      return { error: "Too many requests. Please wait a few minutes and try again.", sent: false }
    }
    // Do not reveal whether the address exists.
  }

  return { error: null, sent: true }
}
