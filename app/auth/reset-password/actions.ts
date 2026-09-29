"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type ResetState = { error: string | null }

export async function resetPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (password.length < 8) return { error: "Password must be at least 8 characters." }
  if (password !== confirm) return { error: "Passwords do not match." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "This reset link has expired or already been used. Please request a new one." }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    console.error("[auth] password update failed:", error.status, error.message)
    return { error: error.message.includes("different from the old") ? "Please choose a password you haven't used before." : "Could not update your password. Please try again." }
  }

  redirect("/admin")
}
