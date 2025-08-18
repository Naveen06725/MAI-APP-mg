import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Clear users request received")

    // Create admin client with service role key
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get all non-admin profiles
    const { data: nonAdminProfiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, username")
      .eq("is_admin", false)

    if (profilesError) {
      console.error("[v0] Error fetching non-admin profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    console.log(`[v0] Found ${nonAdminProfiles?.length || 0} non-admin users to delete`)

    let deletedCount = 0
    const errors: string[] = []

    // Delete each non-admin user
    for (const profile of nonAdminProfiles || []) {
      try {
        // Delete from Supabase auth
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(profile.id)
        if (authDeleteError) {
          console.error(`[v0] Error deleting auth user ${profile.username}:`, authDeleteError)
          errors.push(`Failed to delete auth user ${profile.username}: ${authDeleteError.message}`)
        }

        // Delete profile (this should cascade or be handled by triggers)
        const { error: profileDeleteError } = await supabaseAdmin.from("profiles").delete().eq("id", profile.id)

        if (profileDeleteError) {
          console.error(`[v0] Error deleting profile ${profile.username}:`, profileDeleteError)
          errors.push(`Failed to delete profile ${profile.username}: ${profileDeleteError.message}`)
        } else {
          deletedCount++
          console.log(`[v0] Successfully deleted user: ${profile.username} (${profile.email})`)
        }

        // Clean up any OTP records in admin_stats
        await supabaseAdmin
          .from("admin_stats")
          .delete()
          .like("key", "otp_%")
          .contains("value", { email: profile.email })
      } catch (error) {
        console.error(`[v0] Unexpected error deleting user ${profile.username}:`, error)
        errors.push(`Unexpected error deleting ${profile.username}`)
      }
    }

    console.log(`[v0] Cleanup completed. Deleted ${deletedCount} users. Errors: ${errors.length}`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} non-admin users`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("[v0] Error in clear users endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
