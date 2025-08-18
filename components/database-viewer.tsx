"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"

interface DatabaseData {
  authUsers: any[]
  profiles: any[]
  meetings: any[]
  posts: any[]
}

export function DatabaseViewer() {
  const [data, setData] = useState<DatabaseData>({
    authUsers: [],
    profiles: [],
    meetings: [],
    posts: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDatabaseData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/database-viewer")
      const result = await response.json()

      if (result.error) {
        setError(result.error)
      } else {
        setData(result.data)
      }
    } catch (err) {
      setError("Failed to fetch database data")
      console.error("[v0] Database viewer error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDatabaseData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Viewer</h2>
          <p className="text-muted-foreground">View all data in your database tables</p>
        </div>
        <Button onClick={fetchDatabaseData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="auth-users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auth-users">
            Auth Users{" "}
            <Badge variant="secondary" className="ml-2">
              {data.authUsers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="profiles">
            Profiles{" "}
            <Badge variant="secondary" className="ml-2">
              {data.profiles.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="meetings">
            Meetings{" "}
            <Badge variant="secondary" className="ml-2">
              {data.meetings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="posts">
            Posts{" "}
            <Badge variant="secondary" className="ml-2">
              {data.posts.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auth-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Users</CardTitle>
              <CardDescription>Users in the auth.users table</CardDescription>
            </CardHeader>
            <CardContent>
              {data.authUsers.length === 0 ? (
                <p className="text-muted-foreground">No auth users found</p>
              ) : (
                <div className="space-y-4">
                  {data.authUsers.map((user, index) => (
                    <div key={user.id || index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>ID:</strong> {user.id}
                        </div>
                        <div>
                          <strong>Email:</strong> {user.email}
                        </div>
                        <div>
                          <strong>Created:</strong> {formatDate(user.created_at)}
                        </div>
                        <div>
                          <strong>Confirmed:</strong> {user.email_confirmed_at ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profiles</CardTitle>
              <CardDescription>Users in the profiles table</CardDescription>
            </CardHeader>
            <CardContent>
              {data.profiles.length === 0 ? (
                <p className="text-muted-foreground">No profiles found</p>
              ) : (
                <div className="space-y-4">
                  {data.profiles.map((profile, index) => (
                    <div key={profile.id || index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>ID:</strong> {profile.id}
                        </div>
                        <div>
                          <strong>Username:</strong> {profile.username}
                        </div>
                        <div>
                          <strong>Email:</strong> {profile.email}
                        </div>
                        <div>
                          <strong>Name:</strong> {profile.first_name} {profile.last_name}
                        </div>
                        <div>
                          <strong>Mobile:</strong> {profile.mobile_number}
                        </div>
                        <div>
                          <strong>Admin:</strong> {profile.is_admin ? "Yes" : "No"}
                        </div>
                        <div>
                          <strong>Created:</strong> {formatDate(profile.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meetings</CardTitle>
              <CardDescription>All meetings in the database</CardDescription>
            </CardHeader>
            <CardContent>
              {data.meetings.length === 0 ? (
                <p className="text-muted-foreground">No meetings found</p>
              ) : (
                <div className="space-y-4">
                  {data.meetings.map((meeting, index) => (
                    <div key={meeting.id || index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>ID:</strong> {meeting.id}
                        </div>
                        <div>
                          <strong>Title:</strong> {meeting.title}
                        </div>
                        <div>
                          <strong>Status:</strong> {meeting.status}
                        </div>
                        <div>
                          <strong>Created:</strong> {formatDate(meeting.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Posts</CardTitle>
              <CardDescription>All posts in the social media system</CardDescription>
            </CardHeader>
            <CardContent>
              {data.posts.length === 0 ? (
                <p className="text-muted-foreground">No posts found</p>
              ) : (
                <div className="space-y-4">
                  {data.posts.map((post, index) => (
                    <div key={post.id || index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>ID:</strong> {post.id}
                        </div>
                        <div>
                          <strong>Content:</strong> {post.content?.substring(0, 100)}...
                        </div>
                        <div>
                          <strong>Author:</strong> {post.author_id}
                        </div>
                        <div>
                          <strong>Created:</strong> {formatDate(post.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
