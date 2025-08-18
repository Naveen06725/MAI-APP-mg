import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReelsFeed } from "@/components/reels-feed"

export default async function ReelsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch reels
  const { data: reels } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      ),
      likes:likes(count),
      comments:comments(count)
    `)
    .eq("is_reel", true)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-black">
      <ReelsFeed user={user} initialReels={reels || []} />
    </div>
  )
}
