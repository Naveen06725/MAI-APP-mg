import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"
import UserDashboard from "@/components/user-dashboard"
import ActivityTracker from "@/components/activity-tracker"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const adminSession = cookieStore.get("admin-session")

  // Check admin session first
  if (adminSession?.value) {
    try {
      const sessionData = JSON.parse(adminSession.value)
      const now = Date.now()
      const timeSinceActivity = now - (sessionData.lastActivity || 0)
      const eightMinutesInMs = 8 * 60 * 1000

      if (sessionData.isAdmin === true && timeSinceActivity <= eightMinutesInMs) {
        console.log("[v0] Admin dashboard access granted")
        return (
          <>
            <ActivityTracker />
            <AdminDashboard />
          </>
        )
      } else {
        console.log("[v0] Admin session expired, redirecting to login")
        redirect("/auth/login")
      }
    } catch (error) {
      console.log("[v0] Admin session parse error, redirecting to login")
      redirect("/auth/login")
    }
  }

  // Continue with regular Supabase auth
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.is_admin) {
    return (
      <>
        <ActivityTracker />
        <AdminDashboard />
      </>
    )
  }

  return (
    <>
      <ActivityTracker />
      <UserDashboard />
    </>
  )
}
