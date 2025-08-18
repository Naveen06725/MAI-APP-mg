"use client"
import { useRouter } from "next/navigation"
import { Home } from "lucide-react"

export function MAILogo() {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push("/")
  }

  return (
    <div className="fixed top-3 left-3 z-50">
      <button
        onClick={handleLogoClick}
        className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200/50 hover:bg-white/90"
        aria-label="Go to home"
      >
        <Home className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  )
}
