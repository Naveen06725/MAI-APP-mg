import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    console.log(`[v0] Executing SQL query: ${query}`)

    // Execute raw SQL query
    const result = await supabase.rpc("execute_sql", { sql_query: query })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] SQL execution error:", error)
    return NextResponse.json({ error: "Failed to execute SQL query" }, { status: 500 })
  }
}
