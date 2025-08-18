import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: otpData, error: otpError } = await supabaseAdmin
      .from("admin_stats")
      .select("*")
      .eq("stat_type", "otp_verification")
      .eq("stat_value->email", email)
      .eq("stat_value->otp_code", otp)
      .eq("stat_value->is_used", false)
      .gt("stat_value->expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    const updatedStatValue = { ...otpData.stat_value, is_used: true }
    await supabaseAdmin.from("admin_stats").update({ stat_value: updatedStatValue }).eq("id", otpData.id)

    const { email: userEmail, password, profile_id } = otpData.stat_value

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        profile_id: profile_id,
      },
    })

    if (authError || !authData.user) {
      console.error("Auth user creation failed:", authError?.message)
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ id: authData.user.id })
      .eq("id", profile_id)

    if (profileError) {
      console.error("Profile update error:", profileError)
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to complete account setup" }, { status: 500 })
    }

    await supabaseAdmin.from("admin_stats").delete().eq("id", otpData.id)

    return NextResponse.json({
      message: "Email verified successfully",
      authUser: authData.user,
      email: userEmail,
      password: password,
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
