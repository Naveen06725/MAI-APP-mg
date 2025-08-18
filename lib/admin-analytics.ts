import { createClient } from "@/lib/supabase/client"

export interface AdminStats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  liveMeetings: number
  totalMeetings: number
  totalPosts: number
  totalVoiceInteractions: number
  totalCodeProjects: number
  newUsersToday: number
  meetingsToday: number
  postsToday: number
  userGrowthData: Array<{ date: string; users: number }>
  meetingFrequencyData: Array<{ date: string; meetings: number }>
  topActiveUsers: Array<{ username: string; meetings: number; posts: number }>
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const supabase = createClient()

  try {
    // Get current date for today's stats
    const today = new Date().toISOString().split("T")[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch all basic counts
    const [
      { count: totalUsers },
      { data: adminData },
      { count: liveMeetings },
      { count: totalMeetings },
      { count: totalPosts },
      { count: totalVoiceInteractions },
      { count: totalCodeProjects },
      { count: newUsersToday },
      { count: meetingsToday },
      { count: postsToday },
      { data: userGrowthData },
      { data: meetingFrequencyData },
      { data: topUsersData },
    ] = await Promise.all([
      // Total users
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),

      // Admin users
      supabase
        .from("profiles")
        .select("*")
        .eq("is_admin", true),

      // Live meetings
      supabase
        .from("meetings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),

      // Total meetings
      supabase
        .from("meetings")
        .select("*", { count: "exact", head: true }),

      // Total posts
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true }),

      // Total voice interactions
      supabase
        .from("voice_interactions")
        .select("*", { count: "exact", head: true }),

      // Total code projects
      supabase
        .from("code_projects")
        .select("*", { count: "exact", head: true }),

      // New users today
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),

      // Meetings today
      supabase
        .from("meetings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),

      // Posts today
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),

      // User growth data (last 30 days)
      supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at"),

      // Meeting frequency data (last 30 days)
      supabase
        .from("meetings")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at"),

      // Top active users
      supabase
        .from("profiles")
        .select(`
          username,
          meetings:meetings(count),
          posts:posts(count)
        `)
        .limit(10),
    ])

    // Process user growth data
    const processedUserGrowth = processTimeSeriesData(userGrowthData || [], 30)

    // Process meeting frequency data
    const processedMeetingFrequency = processTimeSeriesData(meetingFrequencyData || [], 30)

    // Process top active users
    const processedTopUsers = (topUsersData || [])
      .map((user: any) => ({
        username: user.username,
        meetings: user.meetings?.length || 0,
        posts: user.posts?.length || 0,
      }))
      .sort((a, b) => b.meetings + b.posts - (a.meetings + a.posts))
      .slice(0, 5)

    return {
      totalUsers: totalUsers || 0,
      adminUsers: adminData?.length || 0,
      regularUsers: (totalUsers || 0) - (adminData?.length || 0),
      liveMeetings: liveMeetings || 0,
      totalMeetings: totalMeetings || 0,
      totalPosts: totalPosts || 0,
      totalVoiceInteractions: totalVoiceInteractions || 0,
      totalCodeProjects: totalCodeProjects || 0,
      newUsersToday: newUsersToday || 0,
      meetingsToday: meetingsToday || 0,
      postsToday: postsToday || 0,
      userGrowthData: processedUserGrowth,
      meetingFrequencyData: processedMeetingFrequency,
      topActiveUsers: processedTopUsers,
    }
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    throw error
  }
}

function processTimeSeriesData(data: any[], days: number) {
  const result = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const count = data.filter((item) => item.created_at.split("T")[0] === dateStr).length

    result.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: count,
      meetings: count,
    })
  }

  return result
}
