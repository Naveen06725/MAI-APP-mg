"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle } from "lucide-react"

interface OTPVerificationProps {
  email: string
  onVerified: () => void
  onBack: () => void
}

export function OTPVerification({ email, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [sentOtp, setSentOtp] = useState("")

  const sendOTP = async () => {
    setIsSending(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      setSuccess("OTP sent to your email!")
      // For demo purposes - remove in production
      setSentOtp(data.otp)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP")
    } finally {
      setIsSending(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP")
      }

      setSuccess("Email verified successfully!")
      setTimeout(() => onVerified(), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
        <CardDescription className="text-blue-100">We've sent a verification code to {email}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!success.includes("verified") && (
          <>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-widest bg-white/10 border-white/20 text-white placeholder:text-white/60"
                maxLength={6}
              />
              {sentOtp && (
                <p className="text-xs text-blue-200 text-center">Demo OTP: {sentOtp} (Remove in production)</p>
              )}
            </div>

            <Button
              onClick={verifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className="w-full bg-white text-blue-600 hover:bg-blue-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-blue-100">Didn't receive the code?</p>
              <Button variant="ghost" onClick={sendOTP} disabled={isSending} className="text-white hover:bg-white/10">
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>
          </>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Button variant="ghost" onClick={onBack} className="w-full text-white hover:bg-white/10">
          Back to Registration
        </Button>
      </CardContent>
    </Card>
  )
}
