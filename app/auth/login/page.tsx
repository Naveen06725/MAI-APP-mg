import { EnhancedLoginForm } from "@/components/enhanced-login-form"

export default async function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4">
      <EnhancedLoginForm />
    </div>
  )
}
