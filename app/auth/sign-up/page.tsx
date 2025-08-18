import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EnhancedSignUpForm } from "@/components/enhanced-sign-up-form"

export default async function SignUpPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4 py-8">
      <EnhancedSignUpForm />
    </div>
  )
}
