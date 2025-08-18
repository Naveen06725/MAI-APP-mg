import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    console.log("[v0] Clearing test data")

    const { data: users } = await supabase.auth.admin.listUsers()
    const authUserIds = users?.users?.map((user) => user.id) || []

    // Delete all profiles except admin (if any) - use auth user IDs to ensure complete cleanup
    await supabase.from("profiles").delete().neq("username", "Admin")

    // Delete all meetings
    await supabase.from("meetings").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    // Delete all posts
    await supabase.from("posts").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    if (users?.users) {
      for (const user of users.users) {
        // Delete users that don't have admin email and aren't the hardcoded admin
        if (!user.email?.includes("admin") && user.email !== "admin@maiplatform.com") {
          await supabase.auth.admin.deleteUser(user.id)
        }
      }
    }

    const { data: remainingProfiles } = await supabase.from("profiles").select("id, username")
    if (remainingProfiles) {
      for (const profile of remainingProfiles) {
        if (profile.username !== "Admin") {
          await supabase.from("profiles").delete().eq("id", profile.id)
        }
      }
    }

    return NextResponse.json({ success: true, message: "Test data cleared successfully" })
  } catch (error) {
    console.error("[v0] Clear test data error:", error)
    return NextResponse.json({ error: "Failed to clear test data" }, { status: 500 })
  }
}
