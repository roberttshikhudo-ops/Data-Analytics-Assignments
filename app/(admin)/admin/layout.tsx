import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // The middleware already confirmed a session exists before this layout
  // runs, so this reuses that same server-verified session instead of
  // re-checking it a second time from the browser (which raced the
  // middleware and could bounce users back to login right after signing in).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") {
    redirect("/auth/error?message=" + encodeURIComponent("This account does not have admin access."))
  }

  return <AdminShell>{children}</AdminShell>
}
