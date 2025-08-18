"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaFile {
  file: File
  preview: string
  type: "image" | "video" | "gif"
}

interface MediaPickerProps {
  onMediaSelect: (media: MediaFile | string) => void
  className?: string
  trigger?: React.ReactNode
}

const EMOTICONS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
  "😶",
  "😐",
  "😑",
  "😬",
  "🙄",
  "😯",
  "😦",
  "😧",
  "😮",
  "😲",
  "🥱",
  "😴",
  "🤤",
  "😪",
  "😵",
  "🤐",
  "🥴",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🤒",
  "🤕",
  "🤑",
  "🤠",
  "😈",
  "👿",
  "👹",
  "👺",
  "🤡",
  "💩",
  "👻",
  "💀",
  "☠️",
  "👽",
  "👾",
]

const POPULAR_GIFS = [
  "/happy-dance.png",
  "/thumbs-up-gif.png",
  "/celebration-gif.png",
  "/clapping-hands-animation.png",
  "/laughing-animated-scene.png",
  "/heart-eyes-animated.png",
  "/mind-blown-gif.png",
  "/high-five-gif.png",
]

export function MediaPicker({ onMediaSelect, className, trigger }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = useCallback((files: FileList) => {
    const newFiles: MediaFile[] = []

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const preview = URL.createObjectURL(file)
        const type = file.type.startsWith("image/") ? (file.type === "image/gif" ? "gif" : "image") : "video"

        newFiles.push({ file, preview, type })
      }
    })

    setSelectedFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files) {
        handleFileSelect(e.dataTransfer.files)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      })

      setStream(mediaStream)
      setIsCameraOpen(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" })
              const preview = URL.createObjectURL(blob)
              const mediaFile: MediaFile = { file, preview, type: "image" }

              setSelectedFiles((prev) => [...prev, mediaFile])
              stopCamera()
            }
          },
          "image/jpeg",
          0.9,
        )
      }
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleMediaSelect = (media: MediaFile | string) => {
    onMediaSelect(media)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="emoji">Emoji</TabsTrigger>
            <TabsTrigger value="gifs">GIFs</TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-slate-300 dark:border-slate-600",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-slate-500 mb-4">Supports images, videos, and GIFs</p>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700">
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              />
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Selected Files</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                        {file.type === "video" ? (
                          <video src={file.preview} className="w-full h-full object-cover" controls={false} />
                        ) : (
                          <img
                            src={file.preview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-6 h-6 p-0"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
                        {file.type}
                      </Badge>
                      <Button
                        size="sm"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleMediaSelect(file)}
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Camera Tab */}
          <TabsContent value="camera" className="space-y-4">
            {!isCameraOpen ? (
              <div className="text-center py-8">
                <Camera className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium mb-4">Take a photo or record a video</p>
                <Button onClick={startCamera} className="bg-emerald-600 hover:bg-emerald-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={capturePhoto} className="bg-emerald-600 hover:bg-emerald-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Photo
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Emoji Tab */}
          <TabsContent value="emoji">
            <ScrollArea className="h-64">
              <div className="grid grid-cols-10 gap-2 p-2">
                {EMOTICONS.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="aspect-square text-2xl hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => handleMediaSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* GIFs Tab */}
          <TabsContent value="gifs" className="space-y-4">
            <Input placeholder="Search GIFs..." className="w-full" />
            <ScrollArea className="h-64">
              <div className="grid grid-cols-3 gap-4">
                {POPULAR_GIFS.map((gif, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleMediaSelect(gif)}
                  >
                    <img
                      src={gif || "/placeholder.svg"}
                      alt={`GIF ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
