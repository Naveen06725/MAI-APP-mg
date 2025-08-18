"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Settings,
  Search,
  Trash2,
  Shield,
  Activity,
  MessageSquare,
  Code,
  Video,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Database,
  UserX,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { logout } from "@/lib/actions"
import { fetchAdminStats, type AdminStats } from "@/lib/admin-analytics"
import { DatabaseManager } from "@/components/database-manager"
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  is_admin: boolean
  mobile_number: string
  created_at: string
  street_address: string
  city: string
  state: string
  country: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [filterPeriod, setFilterPeriod] = useState("30")
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [clearingUsers, setClearingUsers] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
    fetchStats()

    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const adminStats = await fetchAdminStats()
      setStats(adminStats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const clearAllUsers = async () => {
    const nonAdminUsers = users.filter((user) => !user.is_admin)

    if (nonAdminUsers.length === 0) {
      alert("No non-admin users to clear.")
      return
    }

    const confirmMessage = `Are you sure you want to delete ALL ${nonAdminUsers.length} non-admin users? This action cannot be undone.`
    if (!confirm(confirmMessage)) return

    setClearingUsers(true)
    console.log("[v0] Starting clear all users operation")

    try {
      const response = await fetch("/api/admin/clear-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        console.log(`[v0] Successfully cleared ${result.deletedCount} users`)
        alert(`Successfully deleted ${result.deletedCount} non-admin users.`)

        // Refresh the users list and stats
        await fetchUsers()
        await fetchStats()
      } else {
        console.error("[v0] Clear users failed:", result.error)
        alert(`Failed to clear users: ${result.error}`)
      }

      if (result.errors && result.errors.length > 0) {
        console.warn("[v0] Some errors occurred:", result.errors)
        alert(`Some errors occurred during cleanup:\n${result.errors.join("\n")}`)
      }
    } catch (error) {
      console.error("[v0] Error clearing users:", error)
      alert("Failed to clear users. Please try again.")
    } finally {
      setClearingUsers(false)
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("profiles").update({ is_admin: !currentStatus }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, is_admin: !currentStatus } : user)))
    } catch (error) {
      console.error("Error updating admin status:", error)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error

      setUsers(users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pieData = stats
    ? [
        { name: "Regular Users", value: stats.regularUsers, color: "#3B82F6" },
        { name: "Admin Users", value: stats.adminUsers, color: "#10B981" },
      ]
    : []

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
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-blue-200">Real-time platform analytics and user management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchStats}
                variant="outline"
                size="sm"
                className="border-blue-600/50 text-blue-200 hover:bg-blue-700/50 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-red-600/50 text-red-200 hover:bg-red-700/50 bg-transparent"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Tabs to organize dashboard sections */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-blue-800/50 border-blue-600/50">
            <TabsTrigger
              value="analytics"
              className="text-blue-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="text-blue-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger
              value="database"
              className="text-blue-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-blue-800/50 border-blue-600/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Live Meetings</CardTitle>
                  <Video className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.liveMeetings || 0}</div>
                  <p className="text-xs text-green-400">Active right now</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 border-blue-600/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Meetings</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalMeetings || 0}</div>
                  <p className="text-xs text-blue-400">+{stats?.meetingsToday || 0} today</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 border-blue-600/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-blue-400">+{stats?.newUsersToday || 0} today</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 border-blue-600/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">AI Interactions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalVoiceInteractions || 0}</div>
                  <p className="text-xs text-purple-400">Voice conversations</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 border-blue-600/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Code Projects</CardTitle>
                  <Code className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalCodeProjects || 0}</div>
                  <p className="text-xs text-orange-400">Generated projects</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-100">Social Posts</CardTitle>
                  <Activity className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalPosts || 0}</div>
                  <p className="text-xs text-pink-400">+{stats?.postsToday || 0} today</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-100">Admin Users</CardTitle>
                  <Shield className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.adminUsers || 0}</div>
                  <p className="text-xs text-yellow-400">Platform admins</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-100">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats?.newUsersToday && stats?.totalUsers
                      ? `${((stats.newUsersToday / stats.totalUsers) * 100).toFixed(1)}%`
                      : "0%"}
                  </div>
                  <p className="text-xs text-green-400">Daily growth</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="bg-blue-800/30 border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    User Growth (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-800/30 border border-blue-600/50 rounded-lg p-6">
                    <div className="h-[300px]">
                      <ChartContainer
                        config={{
                          users: {
                            label: "Users",
                            color: "#3B82F6",
                          },
                        }}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats?.userGrowthData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Frequency Chart */}
              <Card className="bg-blue-800/30 border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Meeting Frequency (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-800/30 border border-blue-600/50 rounded-lg p-6">
                    <div className="h-[300px]">
                      <ChartContainer
                        config={{
                          meetings: {
                            label: "Meetings",
                            color: "#10B981",
                          },
                        }}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.meetingFrequencyData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="meetings" fill="#10B981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Distribution Pie Chart */}
              <Card className="bg-blue-800/30 border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-800/30 border border-blue-600/50 rounded-lg p-6">
                    <div className="h-[300px]">
                      <ChartContainer
                        config={{
                          regularUsers: {
                            label: "Regular Users",
                            color: "#3B82F6",
                          },
                          adminUsers: {
                            label: "Admin Users",
                            color: "#10B981",
                          },
                        }}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Active Users */}
              <Card className="bg-blue-800/30 border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Most Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topActiveUsers.map((user, index) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">@{user.username}</p>
                            <p className="text-sm text-blue-200">
                              {user.meetings} meetings • {user.posts} posts
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-600/50 text-white">
                          {user.meetings + user.posts} total
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div>
              <Card className="bg-blue-800/30 border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-white">Filters & Controls</CardTitle>
                  <div className="flex items-center space-x-4 mt-4">
                    <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                      <SelectTrigger className="w-48 bg-blue-900/50 border-blue-600/50 text-white">
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="border-green-600/50 text-green-200">
                      Auto-refresh: 30s
                    </Badge>
                    {statsLoading && (
                      <Badge variant="outline" className="border-yellow-600/50 text-yellow-200">
                        Updating...
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <Card className="bg-blue-800/30 border-blue-600/50">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-blue-200">View and manage all platform users</CardDescription>

                {/* Search and Actions */}
                <div className="flex items-center justify-between space-x-4 mt-4">
                  <div className="flex items-center space-x-2 flex-1">
                    <Search className="h-4 w-4 text-blue-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-blue-900/50 border-blue-600/50 text-white placeholder-blue-300"
                    />
                  </div>
                  <Button
                    onClick={clearAllUsers}
                    disabled={clearingUsers || users.filter((u) => !u.is_admin).length === 0}
                    variant="outline"
                    className="border-red-600/50 text-red-200 hover:bg-red-700/50 bg-transparent"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    {clearingUsers ? "Clearing..." : "Clear All Users (Keep Admin)"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-blue-900/30 rounded-lg border border-blue-600/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-semibold text-white">{user.full_name}</h3>
                            <p className="text-sm text-blue-200">@{user.username}</p>
                            <p className="text-sm text-blue-300">{user.email}</p>
                            <p className="text-xs text-blue-400">
                              {user.city}, {user.state}, {user.country}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={user.is_admin ? "default" : "secondary"}
                          className={user.is_admin ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}
                        >
                          {user.is_admin ? "Admin" : "User"}
                        </Badge>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          className="border-blue-600/50 text-blue-200 hover:bg-blue-700/50"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteUser(user.id)}
                          className="border-red-600/50 text-red-200 hover:bg-red-700/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            {/* Database Viewer Component */}
            <div className="bg-blue-800/30 border border-blue-600/50 rounded-lg p-6">
              <DatabaseManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
