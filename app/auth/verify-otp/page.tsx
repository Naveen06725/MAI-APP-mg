"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OTPVerification } from "@/components/otp-verification"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!email) {
      setError("Email parameter is missing. Please try signing up again.")
    }
  }, [email])

  const handleVerificationSuccess = async () => {
    // Auto-login the user after successful verification
    try {
      const response = await fetch("/api/auth/auto-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        router.push("/auth/login?message=verified")
      }
    } catch (error) {
      router.push("/auth/login?message=verified")
    }
  }

  const handleResendOTP = async () => {
    if (!email) return

    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error("Failed to resend OTP")
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <OTPVerification email={email} onVerificationSuccess={handleVerificationSuccess} onResendOTP={handleResendOTP} />
    </div>
  )
}
