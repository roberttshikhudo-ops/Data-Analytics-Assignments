"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { User, Package, MapPin, Heart, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Account Overview", href: "/account", icon: User },
  { name: "My Orders", href: "/account/orders", icon: Package },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart },
  { name: "Settings", href: "/account/settings", icon: Settings },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login?redirect=/account")
        return
      }
      setIsAuthenticated(true)
    }
    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (isAuthenticated === null) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>
      
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}
