import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { is_public, collaborators } = await request.json()

    const { data: project, error } = await supabase
      .from("code_projects")
      .update({
        is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // TODO: Handle collaborators - would need a separate table for project_collaborators
    // For now, just return the updated project

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error sharing project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
