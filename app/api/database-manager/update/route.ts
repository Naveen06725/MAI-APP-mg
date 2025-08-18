import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { table, id, updates } = await request.json()

    console.log(`[v0] Updating record in ${table} with id: ${id}`)

    if (table === "authUsers") {
      // Update auth user
      const result = await supabase.auth.admin.updateUserById(id, updates)
      if (result.error) throw result.error
    } else {
      // Update regular table
      const result = await supabase.from(table).update(updates).eq("id", id)
      if (result.error) throw result.error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update error:", error)
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 })
  }
}
