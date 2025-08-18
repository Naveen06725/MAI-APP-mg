"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

export function VerificationStatus() {
  const [status, setStatus] = useState<"checking" | "verified" | "unverified" | "error">("checking")
  const [userEmail, setUserEmail] = useState<string>("")

  const checkVerificationStatus = async () => {
    setStatus("checking")
    try {
      const response = await fetch("/api/auth/verification-status")
      const data = await response.json()

      if (data.verified) {
        setStatus("verified")
        setUserEmail(data.email)
      } else if (data.email) {
        setStatus("unverified")
        setUserEmail(data.email)
      } else {
        setStatus("error")
      }
    } catch (error) {
      console.error("[v0] Verification check error:", error)
      setStatus("error")
    }
  }

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const resendVerification = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })

      if (response.ok) {
        alert("Verification email sent! Please check your inbox.")
      } else {
        alert("Failed to send verification email. Please try again.")
      }
    } catch (error) {
      alert("Error sending verification email.")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "checking" && <Clock className="h-5 w-5 animate-spin" />}
          {status === "verified" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "unverified" && <XCircle className="h-5 w-5 text-yellow-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          Email Verification Status
        </CardTitle>
        <CardDescription>
          {status === "checking" && "Checking verification status..."}
          {status === "verified" && "Your email has been verified successfully!"}
          {status === "unverified" && "Please verify your email to continue"}
          {status === "error" && "Unable to check verification status"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userEmail && <p className="text-sm text-muted-foreground">Email: {userEmail}</p>}

        {status === "unverified" && (
          <div className="space-y-2">
            <p className="text-sm">Check your inbox for the verification email and click the verification link.</p>
            <Button onClick={resendVerification} variant="outline" className="w-full bg-transparent">
              Resend Verification Email
            </Button>
          </div>
        )}

        {status === "verified" && <p className="text-sm text-green-600">You can now login to your account!</p>}

        <Button onClick={checkVerificationStatus} variant="outline" className="w-full bg-transparent">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  )
}
