"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Mic, Code, Calendar, Share2, Play, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { logout } from "@/lib/actions"
import Link from "next/link"

interface Meeting {
  id: string
  title: string
  status: string
  created_at: string
  meeting_id: string
}

interface CodeProject {
  id: string
  project_name: string
  project_type: string
  created_at: string
}

export default function UserDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [codeProjects, setCodeProjects] = useState<CodeProject[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch recent meetings
      const { data: meetingsData } = await supabase
        .from("meetings")
        .select("*")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch recent code projects
      const { data: projectsData } = await supabase
        .from("code_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      setMeetings(meetingsData || [])
      setCodeProjects(projectsData || [])
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Welcome to MAI Platform</h1>
              <p className="text-blue-200">Your all-in-one collaboration platform</p>
            </div>
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                className="border-red-600/50 text-red-200 hover:bg-red-700/50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/meetings">
            <Card className="bg-blue-800/50 border-blue-600/50 hover:bg-blue-700/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Smart Meetings</CardTitle>
                <Video className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-200">Start or join meetings</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/voice">
            <Card className="bg-blue-800/50 border-blue-600/50 hover:bg-blue-700/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">AI Voice</CardTitle>
                <Mic className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-200">Voice AI assistant</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/code">
            <Card className="bg-blue-800/50 border-blue-600/50 hover:bg-blue-700/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Code Editor</CardTitle>
                <Code className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-200">Collaborative coding</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/social">
            <Card className="bg-blue-800/50 border-blue-600/50 hover:bg-blue-700/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Social Feed</CardTitle>
                <Share2 className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-200">Share and connect</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Meetings */}
          <Card className="bg-blue-800/30 border-blue-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Meetings
              </CardTitle>
              <CardDescription className="text-blue-200">Your latest meeting activity</CardDescription>
            </CardHeader>
            <CardContent>
              {meetings.length > 0 ? (
                <div className="space-y-3">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{meeting.title}</h4>
                        <p className="text-sm text-blue-300">ID: {meeting.meeting_id}</p>
                      </div>
                      <Badge
                        variant={meeting.status === "active" ? "default" : "secondary"}
                        className={meeting.status === "active" ? "bg-green-600" : "bg-gray-600"}
                      >
                        {meeting.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-300 text-center py-4">No meetings yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Code Projects */}
          <Card className="bg-blue-800/30 border-blue-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Code Projects
              </CardTitle>
              <CardDescription className="text-blue-200">Your recent coding projects</CardDescription>
            </CardHeader>
            <CardContent>
              {codeProjects.length > 0 ? (
                <div className="space-y-3">
                  {codeProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{project.project_name}</h4>
                        <p className="text-sm text-blue-300">{project.project_type}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-blue-600/50 text-blue-200 bg-transparent">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-300 text-center py-4">No projects yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
