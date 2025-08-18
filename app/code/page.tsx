import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CodeEditor } from "@/components/code-editor"

export default async function CodePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("code_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="min-h-screen bg-slate-900">
      <CodeEditor user={user} initialProjects={projects || []} />
    </div>
  )
}
