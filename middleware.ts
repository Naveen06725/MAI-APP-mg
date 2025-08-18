import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check admin session first (simpler and faster)
  const adminSession = request.cookies.get("admin-session")
  let isAdminLoggedIn = false

  if (adminSession?.value) {
    try {
      const sessionData = JSON.parse(adminSession.value)
      const now = Date.now()
      const timeSinceActivity = now - (sessionData.lastActivity || 0)
      const eightMinutesInMs = 8 * 60 * 1000

      isAdminLoggedIn = sessionData.isAdmin === true && timeSinceActivity <= eightMinutesInMs
      console.log("[v0] Admin session check:", { isAdminLoggedIn, timeSinceActivity })
    } catch (error) {
      console.log("[v0] Admin session parse error:", error)
      isAdminLoggedIn = false
    }
  }

  // If admin is logged in, allow access to all routes
  if (isAdminLoggedIn) {
    console.log("[v0] Admin session valid, allowing access")
    return NextResponse.next()
  }

  // Continue with Supabase auth for regular users
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith("/auth") && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
