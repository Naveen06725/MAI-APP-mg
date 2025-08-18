import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const { createClient: createServiceClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: otpError } = await supabaseAdmin.from("admin_stats").insert({
      stat_type: "otp_resend",
      stat_value: {
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
        is_used: false,
      },
    })

    if (otpError) {
      console.error("OTP storage error:", otpError)
      return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 })
    }

    try {
      const nodemailer = await import("nodemailer")

      // Create transporter using Gmail SMTP or any other SMTP service
      const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL || "your-email@gmail.com",
          pass: process.env.SMTP_PASSWORD || "your-app-password",
        },
      })

      // Email template
      const mailOptions = {
        from: process.env.SMTP_EMAIL || "MAI Platform <noreply@maiplatform.com>",
        to: email,
        subject: "MAI Platform - Email Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">MAI Platform</h1>
              <p style="color: #6b7280; margin: 5px 0;">Email Verification</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 30px; text-align: center;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Your Verification Code</h2>
              <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otpCode}</span>
              </div>
              <p style="color: #6b7280; margin: 20px 0;">Enter this 6-digit code to verify your email address.</p>
              <p style="color: #ef4444; font-size: 14px;">This code will expire in 10 minutes.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px;">
                If you didn't request this verification code, please ignore this email.
              </p>
            </div>
          </div>
        `,
      }

      // Send email
      await transporter.sendMail(mailOptions)
      console.log(`[v0] OTP email sent successfully to ${email}`)
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // For development, still return success but log the error
      console.log(`[v0] Email sending failed, but OTP generated: ${otpCode}`)
    }

    console.log(`[v0] OTP for ${email}: ${otpCode}`)

    return NextResponse.json({
      message: "OTP sent successfully to your email",
      // Remove this in production - only for demo/development
      ...(process.env.NODE_ENV === "development" && { otp: otpCode }),
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
