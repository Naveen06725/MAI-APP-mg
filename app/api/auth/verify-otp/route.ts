import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Find valid OTP
    const { data: otpData, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Mark OTP as used
    await supabase.from("otp_verifications").update({ is_used: true }).eq("id", otpData.id)

    // Mark user as verified
    const { error: profileError } = await supabase.from("profiles").update({ email_verified: true }).eq("email", email)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 })
    }

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
