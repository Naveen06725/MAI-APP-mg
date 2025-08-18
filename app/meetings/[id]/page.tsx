import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import MeetingRoom from "@/components/meeting-room"

interface MeetingPageProps {
  params: {
    id: string
  }
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get meeting details
  const { data: meeting, error } = await supabase
    .from("meetings")
    .select(`
      *,
      host:profiles!meetings_host_id_fkey(full_name, email),
      meeting_participants(
        *,
        participant:profiles!meeting_participants_user_id_fkey(full_name, email)
      )
    `)
    .eq("meeting_id", params.id)
    .single()

  if (error || !meeting) {
    notFound()
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <MeetingRoom meeting={meeting} user={user} profile={profile} />
}
