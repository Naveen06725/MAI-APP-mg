import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    console.log("[v0] Database manager API called")

    // Fetch all data with full details
    const [authUsersResult, profilesResult, meetingsResult, postsResult] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from("profiles").select("*"),
      supabase.from("meetings").select("*"),
      supabase.from("posts").select("*"),
    ])

    const authUsers = authUsersResult.data?.users || []
    const profiles = profilesResult.data || []
    const meetings = meetingsResult.data || []
    const posts = postsResult.data || []

    const result = {
      authUsers,
      profiles,
      meetings,
      posts,
      counts: {
        authUsers: authUsers.length,
        profiles: profiles.length,
        meetings: meetings.length,
        posts: posts.length,
      },
      errors: {
        authError: authUsersResult.error,
        profilesError: profilesResult.error,
        meetingsError: meetingsResult.error,
        postsError: postsResult.error,
      },
    }

    console.log("[v0] Database manager results:", {
      authUsers: result.counts.authUsers,
      profiles: result.counts.profiles,
      meetings: result.counts.meetings,
      posts: result.counts.posts,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Database manager error:", error)
    return NextResponse.json({ error: "Failed to fetch database data" }, { status: 500 })
  }
}
