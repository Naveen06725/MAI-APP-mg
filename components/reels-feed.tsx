"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, Play, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

interface Reel {
  id: string
  user_id: string
  content: string
  media_url?: string
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  profiles?: {
    full_name: string
    avatar_url?: string
  }
}

interface ReelsFeedProps {
  user: any
  initialReels: Reel[]
}

export function ReelsFeed({ user, initialReels }: ReelsFeedProps) {
  const [reels, setReels] = useState<Reel[]>(initialReels)
  const [currentReelIndex, setCurrentReelIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set())

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const newIndex = Math.round(scrollTop / containerHeight)

      if (newIndex !== currentReelIndex && newIndex < reels.length) {
        setCurrentReelIndex(newIndex)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [currentReelIndex, reels.length])

  useEffect(() => {
    // Play/pause videos based on current index
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentReelIndex && isPlaying) {
          video.play()
        } else {
          video.pause()
        }
        video.muted = isMuted
      }
    })
  }, [currentReelIndex, isPlaying, isMuted])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleLike = async (reelId: string) => {
    try {
      const isLiked = likedReels.has(reelId)
      const response = await fetch(`/api/social/posts/${reelId}/like`, {
        method: isLiked ? "DELETE" : "POST",
      })

      if (!response.ok) throw new Error("Failed to toggle like")

      setLikedReels((prev) => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.delete(reelId)
        } else {
          newSet.add(reelId)
        }
        return newSet
      })

      setReels((prev) =>
        prev.map((reel) =>
          reel.id === reelId
            ? {
                ...reel,
                likes_count: isLiked ? reel.likes_count - 1 : reel.likes_count + 1,
              }
            : reel,
        ),
      )
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Reels Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="relative h-screen w-full snap-start flex items-center justify-center">
            {/* Video */}
            {reel.media_url && (
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={reel.media_url}
                className="w-full h-full object-cover"
                loop
                playsInline
                onClick={togglePlayPause}
              />
            )}

            {/* Overlay Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              {/* Top Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="bg-black/20 text-white hover:bg-black/40 rounded-full w-10 h-10 p-0"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={togglePlayPause}
                    className="bg-black/20 text-white hover:bg-black/40 rounded-full w-16 h-16 p-0"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                </div>
              )}

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end justify-between">
                  {/* User Info & Caption */}
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-10 h-10 border-2 border-white">
                        <AvatarImage src={reel.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-emerald-500 text-white">
                          {reel.profiles?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-white text-sm">
                          {reel.profiles?.full_name || "Anonymous User"}
                        </h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white border-white hover:bg-white/20 bg-transparent"
                      >
                        Follow
                      </Button>
                    </div>
                    {reel.content && <p className="text-white text-sm mb-2">{reel.content}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4">
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(reel.id)}
                        className="text-white hover:bg-white/20 rounded-full w-12 h-12 p-0 flex flex-col"
                      >
                        <Heart className={cn("w-6 h-6", likedReels.has(reel.id) && "fill-red-500 text-red-500")} />
                      </Button>
                      <span className="text-white text-xs">{reel.likes_count}</span>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 rounded-full w-12 h-12 p-0"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </Button>
                      <span className="text-white text-xs">{reel.comments_count}</span>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 rounded-full w-12 h-12 p-0"
                      >
                        <Share className="w-6 h-6" />
                      </Button>
                      <span className="text-white text-xs">{reel.shares_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
        {reels.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1 h-8 rounded-full transition-colors",
              index === currentReelIndex ? "bg-white" : "bg-white/30",
            )}
          />
        ))}
      </div>
    </div>
  )
}
