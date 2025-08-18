import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { field, value } = await request.json()

    if (!field || !value) {
      return NextResponse.json({ isUnique: true, error: "Missing field or value" })
    }

    if (field === "username" && value.toLowerCase() === "admin") {
      return NextResponse.json({
        isUnique: false,
        error: "Username 'Admin' is reserved. Please choose a different username.",
      })
    }

    const supabase = createClient()

    // Check if the field value already exists
    const { data, error } = await supabase.from("profiles").select("id").eq(field, value).maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("Database error during validation:", error)
      return NextResponse.json({ isUnique: true, error: "Database error" })
    }

    // If data exists, field is not unique
    const isUnique = !data

    return NextResponse.json({ isUnique })
  } catch (error) {
    console.error("Field validation error:", error)
    return NextResponse.json({ isUnique: true, error: "Validation failed" })
  }
}
