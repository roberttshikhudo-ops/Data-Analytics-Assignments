import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-destructive" />
          <CardTitle className="text-2xl">That link didn&apos;t work</CardTitle>
          <CardDescription>
            The sign-in or reset link is invalid, has expired, or was already used.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/forgot-password">Request a new reset link</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
