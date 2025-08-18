import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.log("[v0] Session error:", sessionError)
      return NextResponse.json({ verified: false, error: "No session found" })
    }

    if (!session?.user) {
      return NextResponse.json({ verified: false, error: "No user found" })
    }

    // Check if email is verified
    const isVerified = session.user.email_confirmed_at !== null

    return NextResponse.json({
      verified: isVerified,
      email: session.user.email,
      confirmedAt: session.user.email_confirmed_at,
    })
  } catch (error) {
    console.error("[v0] Verification status error:", error)
    return NextResponse.json({ verified: false, error: "Server error" }, { status: 500 })
  }
}
