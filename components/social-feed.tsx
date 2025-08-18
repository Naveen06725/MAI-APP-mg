"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Heart, MessageCircle, Share, Plus, ImageIcon, VideoIcon, CameraIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MediaPicker } from "./media-picker"

interface Post {
  id: string
  user_id: string
  content: string
  media_url?: string
  media_type?: string
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  profiles?: {
    full_name: string
    avatar_url?: string
  }
}

interface SocialFeedProps {
  user: any
  initialPosts: Post[]
}

export function SocialFeed({ user, initialPosts }: SocialFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    content: "",
    media_url: "",
    media_type: "",
  })
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const handleMediaSelect = (media: any) => {
    if (typeof media === "string") {
      // Handle emoji or GIF URL
      setNewPost((prev) => ({
        ...prev,
        content: prev.content + media,
      }))
    } else {
      // Handle file upload
      const formData = new FormData()
      formData.append("file", media.file)

      // TODO: Upload to storage and get URL
      // For now, use the preview URL
      setNewPost((prev) => ({
        ...prev,
        media_url: media.preview,
        media_type: media.type,
      }))
    }
  }

  const createPost = async () => {
    try {
      const response = await fetch("/api/social/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPost,
          is_reel: false,
        }),
      })

      if (!response.ok) throw new Error("Failed to create post")

      const post = await response.json()
      setPosts((prev) => [post, ...prev])
      setIsCreateDialogOpen(false)
      setNewPost({ content: "", media_url: "", media_type: "" })
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const toggleLike = async (postId: string) => {
    try {
      const isLiked = likedPosts.has(postId)
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: isLiked ? "DELETE" : "POST",
      })

      if (!response.ok) throw new Error("Failed to toggle like")

      setLikedPosts((prev) => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.delete(postId)
        } else {
          newSet.add(postId)
        }
        return newSet
      })

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
              }
            : post,
        ),
      )
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Social Feed</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                className="min-h-24"
              />

              <div className="flex items-center gap-2">
                <MediaPicker
                  onMediaSelect={handleMediaSelect}
                  trigger={
                    <Button variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Photo
                    </Button>
                  }
                />
                <MediaPicker
                  onMediaSelect={handleMediaSelect}
                  trigger={
                    <Button variant="outline" size="sm">
                      <VideoIcon className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                  }
                />
                <MediaPicker
                  onMediaSelect={handleMediaSelect}
                  trigger={
                    <Button variant="outline" size="sm">
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Camera
                    </Button>
                  }
                />
              </div>

              {/* Media Preview */}
              {newPost.media_url && (
                <div className="relative rounded-lg overflow-hidden">
                  {newPost.media_type === "video" ? (
                    <video src={newPost.media_url} controls className="w-full h-auto max-h-64" />
                  ) : (
                    <img
                      src={newPost.media_url || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-auto max-h-64 object-cover"
                    />
                  )}
                </div>
              )}

              <Button onClick={createPost} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Share Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {post.profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {post.profiles?.full_name || "Anonymous User"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatTimeAgo(post.created_at)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Post Content */}
              {post.content && <p className="text-slate-900 dark:text-white">{post.content}</p>}

              {/* Media */}
              {post.media_url && (
                <div className="rounded-lg overflow-hidden">
                  {post.media_type === "image" && (
                    <img src={post.media_url || "/placeholder.svg"} alt="Post media" className="w-full h-auto" />
                  )}
                  {post.media_type === "video" && <video src={post.media_url} controls className="w-full h-auto" />}
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>{post.likes_count} likes</span>
                <span>{post.comments_count} comments</span>
                <span>{post.shares_count} shares</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(post.id)}
                  className={cn("flex-1", likedPosts.has(post.id) && "text-red-500 hover:text-red-600")}
                >
                  <Heart className={cn("w-4 h-4 mr-2", likedPosts.has(post.id) && "fill-current")} />
                  Like
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline" className="px-8 bg-transparent">
          Load More Posts
        </Button>
      </div>
    </div>
  )
}
