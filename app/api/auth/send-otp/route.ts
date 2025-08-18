import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Store OTP in database
    const { error: otpError } = await supabase.from("otp_verifications").insert({
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
    })

    if (otpError) {
      console.error("OTP storage error:", otpError)
      return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 })
    }

    // In a real app, you would send this via email service
    // For demo purposes, we'll return it (remove this in production)
    console.log(`[v0] OTP for ${email}: ${otpCode}`)

    return NextResponse.json({
      message: "OTP sent successfully",
      // Remove this in production - only for demo
      otp: otpCode,
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
