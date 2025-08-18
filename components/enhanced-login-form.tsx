"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { enhancedSignIn, forgotPassword } from "@/lib/actions"
import Link from "next/link"

export function EnhancedLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)

    console.log("[v0] Form submission started")
    const result = await enhancedSignIn(formData)
    console.log("[v0] Sign in result:", result)

    if (result?.error) {
      console.log("[v0] Login error:", result.error)
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      console.log("[v0] Login successful")
      setMessage({ type: "success", text: result.success })

      if (result.redirect) {
        console.log("[v0] Redirecting to:", result.redirect)
        // Use direct window navigation for reliability
        window.location.href = result.redirect
        return
      }
    }

    setIsLoading(false)
  }

  async function handleForgotPassword(formData: FormData) {
    setIsLoading(true)
    setMessage(null)

    const result = await forgotPassword(formData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Password reset email sent! Check your inbox." })
    }

    setIsLoading(false)
  }

  if (isForgotPassword) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            {message && (
              <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)}>
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your MAI Platform account</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" type="text" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          {message && (
            <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setIsForgotPassword(true)}>
              Forgot Password?
            </Button>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
