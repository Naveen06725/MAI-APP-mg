import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SocialFeed } from "@/components/social-feed"

export default async function SocialPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch initial posts for the feed
  const { data: posts } = await supabase
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
    .eq("is_reel", false)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <SocialFeed user={user} initialPosts={posts || []} />
    </div>
  )
}
