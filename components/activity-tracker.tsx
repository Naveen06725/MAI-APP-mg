"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateActivity, checkSessionValidity } from "@/lib/actions"

export default function ActivityTracker() {
  const router = useRouter()

  useEffect(() => {
    let activityTimer: NodeJS.Timeout
    let sessionCheckTimer: NodeJS.Timeout

    const trackActivity = async () => {
      await updateActivity()
    }

    const checkSession = async () => {
      const result = await checkSessionValidity()
      if (!result.valid) {
        console.log("[v0] Session invalid:", result.reason)
        router.push("/auth/login")
      }
    }

    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      clearTimeout(activityTimer)
      activityTimer = setTimeout(trackActivity, 1000) // Debounce activity updates
    }

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    sessionCheckTimer = setInterval(checkSession, 60000)

    // Initial session check
    checkSession()

    return () => {
      // Cleanup
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
      clearTimeout(activityTimer)
      clearInterval(sessionCheckTimer)
    }
  }, [router])

  return null // This component doesn't render anything
}
