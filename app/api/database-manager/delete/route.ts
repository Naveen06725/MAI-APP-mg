import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { table, id } = await request.json()

    console.log(`[v0] Deleting record from ${table} with id: ${id}`)

    if (table === "authUsers") {
      // Delete auth user (this will cascade to profiles if foreign key is set up)
      const result = await supabase.auth.admin.deleteUser(id)
      if (result.error) throw result.error
    } else {
      // Delete from regular table
      const result = await supabase.from(table).delete().eq("id", id)
      if (result.error) throw result.error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete error:", error)
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
}
