import { type NextRequest, NextResponse } from "next/server"
import { autoLoginAfterVerification } from "@/lib/actions"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await autoLoginAfterVerification(email)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: result.success })
  } catch (error) {
    console.error("Auto-login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
