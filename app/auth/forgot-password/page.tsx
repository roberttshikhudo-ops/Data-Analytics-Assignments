"use client"

import { useActionState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, MailCheck } from "lucide-react"
import { forgotPasswordAction, type ForgotState } from "./actions"

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ForgotState, FormData>(forgotPasswordAction, {
    error: null,
    sent: false,
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4">
            <Image src="/images/agri-hub-logo.jpg" alt="Agri Hub SA" width={56} height={56} className="rounded-xl" />
          </Link>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your account email and we&apos;ll send you a link to choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <MailCheck className="h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, a reset link is on its way. Open it on this device and
                you&apos;ll be asked to set a new password.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              {state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
