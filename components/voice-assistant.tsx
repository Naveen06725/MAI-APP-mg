"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import SpeechRecognition from "speech-recognition"

interface VoiceInteraction {
  id: string
  transcript: string
  ai_response: string
  created_at: string
}

interface VoiceAssistantProps {
  meetingId?: string
  className?: string
}

export function VoiceAssistant({ meetingId, className }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([])
  const [transcript, setTranscript] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        processVoiceInput(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }

    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setIsRecording(true)
      setTranscript("")

      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } catch (error) {
      console.error("Error starting recording:", error)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const processVoiceInput = async (transcript: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/voice/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          meetingId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process voice input")
      }

      const data = await response.json()

      // Add to interactions
      const newInteraction: VoiceInteraction = {
        id: Date.now().toString(),
        transcript: data.transcript,
        ai_response: data.response,
        created_at: new Date().toISOString(),
      }

      setInteractions((prev) => [newInteraction, ...prev])

      // Speak the response
      speakResponse(data.response)
    } catch (error) {
      console.error("Error processing voice:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = (text: string) => {
    if (synthRef.current && text) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      synthRef.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          MAI Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            size="lg"
            className={cn(
              "rounded-full w-16 h-16",
              isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-emerald-500 hover:bg-emerald-600",
            )}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            onClick={isSpeaking ? stopSpeaking : undefined}
            disabled={!isSpeaking}
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 bg-transparent"
          >
            {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>

        {/* Status */}
        <div className="text-center">
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              Recording...
            </Badge>
          )}
          {isProcessing && <Badge variant="secondary">Processing...</Badge>}
          {isSpeaking && (
            <Badge variant="default" className="bg-emerald-500">
              Speaking...
            </Badge>
          )}
          {transcript && <p className="text-sm text-muted-foreground mt-2">"{transcript}"</p>}
        </div>

        {/* Conversation History */}
        {interactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Conversations</h4>
            <ScrollArea className="h-64 w-full">
              <div className="space-y-3">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                      <p className="text-sm">{interaction.transcript}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="default" className="text-xs bg-emerald-500">
                        MAI
                      </Badge>
                      <p className="text-sm text-muted-foreground">{interaction.ai_response}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(interaction.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Click the microphone to start talking with MAI</p>
          <p className="text-xs mt-1">Try: "Schedule a meeting", "Take notes", "What's my agenda?"</p>
        </div>
      </CardContent>
    </Card>
  )
}
