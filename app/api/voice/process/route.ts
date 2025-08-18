import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { transcript, meetingId } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 })
    }

    // Generate AI response using Groq
    const { text: aiResponse } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: `You are MAI, an intelligent meeting assistant. Respond helpfully to this voice input: "${transcript}". Keep responses concise and actionable.`,
      maxTokens: 150,
    })

    // Store voice interaction in database
    const { error: dbError } = await supabase.from("voice_interactions").insert({
      user_id: user.id,
      meeting_id: meetingId || null,
      transcript,
      ai_response: aiResponse,
      created_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("Database error:", dbError)
    }

    return NextResponse.json({
      response: aiResponse,
      transcript,
    })
  } catch (error) {
    console.error("Voice processing error:", error)
    return NextResponse.json({ error: "Failed to process voice input" }, { status: 500 })
  }
}
