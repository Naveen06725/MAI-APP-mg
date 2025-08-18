"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, LogOut, Plus, Video, Mic, Users, Calendar } from "lucide-react"
import { signOut } from "@/lib/actions"
import CreateMeetingDialog from "@/components/create-meeting-dialog"

interface DashboardContentProps {
  user: any
  profile: any
  meetings: any[]
  voiceInteractions: any[]
}

export default function DashboardContent({ user, profile, meetings, voiceInteractions }: DashboardContentProps) {
  const [showCreateMeeting, setShowCreateMeeting] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">MAI Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white">Welcome, {profile?.full_name || user.email}</span>
            {profile?.is_admin && (
              <Badge variant="secondary" className="bg-purple-600 text-white">
                Admin
              </Badge>
            )}
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm" className="text-white hover:text-purple-300">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Meetings</CardTitle>
              <Video className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{meetings.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Voice Interactions</CardTitle>
              <Mic className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{voiceInteractions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Meetings</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {meetings.filter((m) => m.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {
                  meetings.filter((m) => {
                    const meetingDate = new Date(m.created_at)
                    const now = new Date()
                    return meetingDate.getMonth() === now.getMonth() && meetingDate.getFullYear() === now.getFullYear()
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Meetings */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Recent Meetings</CardTitle>
                  <CardDescription className="text-gray-300">Your latest meeting activity</CardDescription>
                </div>
                <Button onClick={() => setShowCreateMeeting(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No meetings yet. Create your first meeting!</p>
                ) : (
                  meetings.slice(0, 5).map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{meeting.title}</h4>
                        <p className="text-sm text-gray-400">{meeting.description}</p>
                        <p className="text-xs text-gray-500">{new Date(meeting.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={meeting.status === "active" ? "default" : "secondary"}
                          className={meeting.status === "active" ? "bg-green-600" : "bg-gray-600"}
                        >
                          {meeting.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/meetings/${meeting.meeting_id}`, "_blank")}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voice Interactions */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Recent AI Interactions</CardTitle>
              <CardDescription className="text-gray-300">Your latest voice conversations with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {voiceInteractions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No voice interactions yet.</p>
                ) : (
                  voiceInteractions.map((interaction) => (
                    <div key={interaction.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Mic className="h-5 w-5 text-purple-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm text-white">{interaction.user_message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(interaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateMeetingDialog open={showCreateMeeting} onOpenChange={setShowCreateMeeting} />
    </div>
  )
}
