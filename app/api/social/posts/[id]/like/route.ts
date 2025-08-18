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

    // Insert like
    const { error: likeError } = await supabase.from("likes").insert({
      user_id: user.id,
      post_id: params.id,
    })

    if (likeError) {
      return NextResponse.json({ error: likeError.message }, { status: 500 })
    }

    // Update likes count
    const { error: updateError } = await supabase.rpc("increment_likes_count", {
      post_id: params.id,
    })

    if (updateError) {
      console.error("Error updating likes count:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete like
    const { error: deleteError } = await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", params.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Update likes count
    const { error: updateError } = await supabase.rpc("decrement_likes_count", {
      post_id: params.id,
    })

    if (updateError) {
      console.error("Error updating likes count:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unliking post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
