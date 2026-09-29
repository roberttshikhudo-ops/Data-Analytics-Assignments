"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type LoginState = { error: string | null; email?: string }

function safeRedirectPath(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "/"
  return path.startsWith("/") && !path.startsWith("//") ? path : "/"
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const redirectTo = safeRedirectPath(formData.get("redirect"))

  if (!email || !password) {
    return { error: "Please enter your email and password.", email }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("[auth] sign-in failed:", error.status, error.message)
    const msg = error.message.toLowerCase()
    if (msg.includes("email not confirmed")) {
      return { error: "Please confirm your email address before signing in. Check your inbox for the confirmation link.", email }
    }
    if (error.status === 429 || msg.includes("rate limit") || msg.includes("too many")) {
      return { error: "Too many attempts. Please wait a minute and try again.", email }
    }
    if (msg.includes("invalid login credentials")) {
      return { error: "Invalid email or password.", email }
    }
    return { error: "We couldn't sign you in right now. Please try again in a moment.", email }
  }

  // Session cookies are set on this response by the server client; the
  // redirect response carries them, so the destination sees the session.
  redirect(redirectTo)
}
