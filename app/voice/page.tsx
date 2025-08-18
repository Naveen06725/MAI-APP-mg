import { VoiceAssistant } from "@/components/voice-assistant"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function VoicePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">MAI Voice Assistant</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Interact with your AI assistant using voice commands
            </p>
          </div>

          <div className="flex justify-center">
            <VoiceAssistant />
          </div>
        </div>
      </div>
    </div>
  )
}
