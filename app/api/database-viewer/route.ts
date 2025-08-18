import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Database viewer API called")

    // Use service role key to bypass RLS and read all data
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Fetch auth users (from auth.users table)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    // Fetch meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false })

    // Fetch posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("[v0] Database query results:", {
      authUsers: authUsers?.users?.length || 0,
      profiles: profiles?.length || 0,
      meetings: meetings?.length || 0,
      posts: posts?.length || 0,
      errors: { authError, profilesError, meetingsError, postsError },
    })

    if (authError || profilesError || meetingsError || postsError) {
      console.error("[v0] Database query errors:", { authError, profilesError, meetingsError, postsError })
      return NextResponse.json(
        {
          error: "Failed to fetch some database data",
          details: { authError, profilesError, meetingsError, postsError },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      data: {
        authUsers: authUsers?.users || [],
        profiles: profiles || [],
        meetings: meetings || [],
        posts: posts || [],
      },
    })
  } catch (error) {
    console.error("[v0] Database viewer error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch database data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
