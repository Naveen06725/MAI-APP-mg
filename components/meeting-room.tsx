"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Users,
  Settings,
  Share2,
  MessageSquare,
  MoreVertical,
  Camera,
} from "lucide-react"
import { joinMeeting, leaveMeeting, updateMeetingStatus } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { MediaPicker } from "./media-picker"
import { VoiceAssistant } from "./voice-assistant"

interface MeetingRoomProps {
  meeting: any
  user: any
  profile: any
}

export default function MeetingRoom({ meeting, user, profile }: MeetingRoomProps) {
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [participants, setParticipants] = useState(meeting.meeting_participants || [])
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false)
  const [sharedMedia, setSharedMedia] = useState<any[]>([])
  const router = useRouter()

  const isHost = meeting.host_id === user.id
  const currentParticipant = participants.find((p: any) => p.user_id === user.id)

  useEffect(() => {
    if (currentParticipant && currentParticipant.status === "joined") {
      setIsJoined(true)
    }
  }, [currentParticipant])

  const handleJoinMeeting = async () => {
    const result = await joinMeeting(meeting.meeting_id)
    if (result.success) {
      setIsJoined(true)
      window.location.reload()
    }
  }

  const handleLeaveMeeting = async () => {
    const result = await leaveMeeting(meeting.meeting_id)
    if (result.success) {
      setIsJoined(false)
      router.push("/dashboard")
    }
  }

  const handleStartMeeting = async () => {
    if (isHost) {
      await updateMeetingStatus(meeting.meeting_id, "active")
      window.location.reload()
    }
  }

  const handleEndMeeting = async () => {
    if (isHost) {
      await updateMeetingStatus(meeting.meeting_id, "completed")
      router.push("/dashboard")
    }
  }

  const handleMediaShare = (media: any) => {
    setSharedMedia((prev) => [...prev, { ...media, timestamp: Date.now(), user: profile.full_name }])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Meeting Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">{meeting.title}</h1>
            <p className="text-muted-foreground">{meeting.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={meeting.status === "active" ? "default" : "secondary"}>{meeting.status}</Badge>
              <span className="text-sm text-muted-foreground">Host: {meeting.host?.full_name}</span>
              <span className="text-sm text-muted-foreground">Meeting ID: {meeting.meeting_id}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <Card className="h-[500px]">
              <CardContent className="p-0 h-full">
                <div className="bg-muted rounded-lg h-full flex items-center justify-center relative">
                  {isJoined ? (
                    <div className="text-center">
                      <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Video feed would appear here</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        In a real implementation, this would show WebRTC video streams
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <VideoOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Join the meeting to see video</p>
                    </div>
                  )}

                  {/* Meeting Controls */}
                  {isJoined && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2">
                        <Button
                          size="sm"
                          variant={isAudioOn ? "default" : "secondary"}
                          onClick={() => setIsAudioOn(!isAudioOn)}
                        >
                          {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant={isVideoOn ? "default" : "secondary"}
                          onClick={() => setIsVideoOn(!isVideoOn)}
                        >
                          {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                        <MediaPicker
                          onMediaSelect={handleMediaShare}
                          trigger={
                            <Button size="sm" variant="outline">
                              <Camera className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          size="sm"
                          variant={showVoiceAssistant ? "default" : "outline"}
                          onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleLeaveMeeting}>
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Meeting Actions */}
            <div className="flex justify-center space-x-4 mt-4">
              {!isJoined ? (
                <Button onClick={handleJoinMeeting} size="lg">
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              ) : null}

              {isHost && meeting.status === "scheduled" && (
                <Button onClick={handleStartMeeting} size="lg">
                  Start Meeting
                </Button>
              )}

              {isHost && meeting.status === "active" && (
                <Button onClick={handleEndMeeting} variant="destructive" size="lg">
                  End Meeting
                </Button>
              )}
            </div>

            {/* Voice Assistant Panel */}
            {showVoiceAssistant && isJoined && (
              <div className="mt-6">
                <VoiceAssistant meetingId={meeting.meeting_id} />
              </div>
            )}

            {/* Shared Media Section */}
            {sharedMedia.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Shared Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sharedMedia.map((media, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                          {typeof media === "string" ? (
                            <div className="w-full h-full flex items-center justify-center text-4xl">{media}</div>
                          ) : media.type === "video" ? (
                            <video src={media.preview} className="w-full h-full object-cover" controls={false} />
                          ) : (
                            <img
                              src={media.preview || "/placeholder.svg"}
                              alt="Shared media"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-xs text-white bg-black/50 rounded px-2 py-1 truncate">
                            Shared by {media.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Participants Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Host */}
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{meeting.host?.full_name?.charAt(0) || "H"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{meeting.host?.full_name}</p>
                      <p className="text-xs text-muted-foreground">Host</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Host
                    </Badge>
                  </div>

                  {/* Participants */}
                  {participants.map((participant: any) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{participant.participant?.full_name?.charAt(0) || "P"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{participant.participant?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.status === "joined" ? "In meeting" : "Left"}
                        </p>
                      </div>
                      <Badge variant={participant.status === "joined" ? "default" : "secondary"} className="text-xs">
                        {participant.status}
                      </Badge>
                    </div>
                  ))}

                  {participants.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No participants yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Meeting Info */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{new Date(meeting.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground capitalize">{meeting.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Meeting ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{meeting.meeting_id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
