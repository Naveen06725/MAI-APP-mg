"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const supabase = createClient()

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string

  if (!email || !password || !fullName) {
    return { error: "All fields are required" }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile
  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      is_admin: false,
    })
  }

  return { success: "Check your email to confirm your account!" }
}

export async function signOut() {
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function createMeeting(prevState: any, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title) {
    return { error: "Meeting title is required" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a meeting" }
  }

  const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const { error } = await supabase.from("meetings").insert({
    title,
    description,
    host_id: user.id,
    meeting_id: meetingId,
    status: "scheduled",
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: "Meeting created successfully!" }
}

export async function joinMeeting(meetingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to join a meeting" }
  }

  // Check if user is already a participant
  const { data: existingParticipant } = await supabase
    .from("meeting_participants")
    .select("*")
    .eq("meeting_id", meetingId)
    .eq("user_id", user.id)
    .single()

  if (existingParticipant) {
    // Update status to joined
    const { error } = await supabase
      .from("meeting_participants")
      .update({
        status: "joined",
        joined_at: new Date().toISOString(),
      })
      .eq("id", existingParticipant.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    // Create new participant record
    const { error } = await supabase.from("meeting_participants").insert({
      meeting_id: meetingId,
      user_id: user.id,
      status: "joined",
      joined_at: new Date().toISOString(),
    })

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath(`/meetings/${meetingId}`)
  return { success: "Joined meeting successfully!" }
}

export async function leaveMeeting(meetingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  const { error } = await supabase
    .from("meeting_participants")
    .update({
      status: "left",
      left_at: new Date().toISOString(),
    })
    .eq("meeting_id", meetingId)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/meetings/${meetingId}`)
  return { success: "Left meeting successfully!" }
}

export async function updateMeetingStatus(meetingId: string, status: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  // Verify user is the host
  const { data: meeting } = await supabase.from("meetings").select("host_id").eq("meeting_id", meetingId).single()

  if (!meeting || meeting.host_id !== user.id) {
    return { error: "Only the host can update meeting status" }
  }

  const { error } = await supabase.from("meetings").update({ status }).eq("meeting_id", meetingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/meetings/${meetingId}`)
  return { success: "Meeting status updated!" }
}

export async function enhancedSignUp(formData: FormData) {
  console.log("[v0] ===== ENHANCED SIGNUP FUNCTION CALLED =====")
  const username = formData.get("username") as string
  console.log("[v0] SignUp attempt for username:", username)
  console.log("[v0] FormData keys:", Array.from(formData.keys()))

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const mobileNumber = formData.get("mobileNumber") as string
  const streetAddress = formData.get("streetAddress") as string
  const buildingNumber = formData.get("buildingNumber") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const country = formData.get("country") as string
  const county = formData.get("county") as string
  const zipcode = formData.get("zipcode") as string

  if (!email || !password || !username || !firstName || !lastName || !mobileNumber) {
    console.log("[v0] SignUp validation failed: missing required fields")
    return { error: "Required fields are missing" }
  }

  if (username.toLowerCase() === "admin") {
    console.log("[v0] SignUp blocked: Admin username not allowed for registration")
    return { error: "Username 'Admin' is reserved. Please choose a different username." }
  }

  console.log("[v0] SignUp proceeding with username:", username)

  const { createClient } = await import("@supabase/supabase-js")
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Check for existing username, email, and mobile number using admin client
  const { data: existingUsername } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle()

  if (existingUsername) {
    return { error: "Username already exists. Please choose a different username." }
  }

  const { data: existingEmail } = await supabaseAdmin.from("profiles").select("email").eq("email", email).maybeSingle()

  if (existingEmail) {
    return { error: "Email already registered. Please use a different email address." }
  }

  const { data: existingMobile } = await supabaseAdmin
    .from("profiles")
    .select("mobile_number")
    .eq("mobile_number", mobileNumber)
    .maybeSingle()

  if (existingMobile) {
    return { error: "Mobile number already registered. Please use a different mobile number." }
  }

  let createdUserId: string | null = null

  try {
    // Create auth user using regular client
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
        data: {
          full_name: `${firstName} ${lastName}`,
          username: username,
        },
      },
    })

    if (error) {
      console.log("[v0] Auth signup error:", error.message)
      return { error: error.message }
    }

    if (!data.user) {
      return { error: "Failed to create user account" }
    }

    createdUserId = data.user.id
    console.log("[v0] Auth user created successfully with ID:", createdUserId)

    // Create enhanced profile using admin client to bypass RLS
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle()

    if (existingProfile) {
      console.log("[v0] Existing profile found with same ID, deleting it first")
      await supabaseAdmin.from("profiles").delete().eq("id", data.user.id)
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      username: username,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      mobile_number: mobileNumber,
      street_address: streetAddress,
      building_number: buildingNumber,
      city: city,
      state: state,
      country: country,
      county: county,
      zipcode: zipcode,
      is_admin: false,
    })

    if (profileError) {
      console.log("[v0] Profile creation error:", profileError.message)

      console.log("[v0] Rolling back: Deleting auth user due to profile creation failure")
      await supabaseAdmin.auth.admin.deleteUser(createdUserId)

      // Handle unique constraint violations with user-friendly messages
      if (profileError.message.includes('duplicate key value violates unique constraint "unique_username"')) {
        return { error: "Username already exists. Please choose a different username." }
      }
      if (profileError.message.includes('duplicate key value violates unique constraint "unique_email"')) {
        return { error: "Email already registered. Please use a different email address." }
      }
      if (profileError.message.includes('duplicate key value violates unique constraint "unique_mobile_number"')) {
        return { error: "Mobile number already registered. Please use a different mobile number." }
      }
      if (profileError.message.includes('duplicate key value violates unique constraint "profiles_pkey"')) {
        return { error: "Account creation failed due to a system conflict. Please try again." }
      }
      return { error: "Account creation failed. Please try again." }
    }

    console.log("[v0] SignUp completed successfully for username:", username)
    return { success: "Account created successfully! Please check your email to verify your account." }
  } catch (error: any) {
    console.log("[v0] Unexpected error during signup:", error.message)

    if (createdUserId) {
      console.log("[v0] Rolling back: Deleting auth user due to unexpected error")
      try {
        await supabaseAdmin.auth.admin.deleteUser(createdUserId)
      } catch (rollbackError) {
        console.log("[v0] Rollback failed:", rollbackError)
      }
    }

    return { error: "Account creation failed. Please try again." }
  }
}

export async function enhancedSignIn(formData: FormData) {
  console.log("[v0] ===== ENHANCED SIGNIN FUNCTION CALLED =====")
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  console.log("[v0] Login attempt for username:", username)
  console.log("[v0] Function name: enhancedSignIn")

  if (!username || !password) {
    console.log("[v0] Missing username or password")
    return { error: "Username and password are required" }
  }

  if (username.toLowerCase() === "admin" && password === "Happy@152624") {
    console.log("[v0] Hardcoded admin login successful")

    const cookieStore = cookies()
    const sessionData = {
      user: "admin",
      lastActivity: Date.now(),
      isAdmin: true,
    }

    cookieStore.set("admin-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60, // 8 minutes
    })

    return { success: "Admin login successful", isAdmin: true, redirect: "/dashboard" }
  }

  console.log("[v0] Looking up user profile for username:", username)

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, username, is_admin, first_name, last_name")
    .eq("username", username)
    .single()

  console.log("[v0] Profile lookup result:", { profile, profileError })

  if (profileError || !profile) {
    console.log("[v0] User not found in database")
    return { error: "User doesn't exist. Please check your username or sign up for a new account." }
  }

  console.log("[v0] Attempting login with email:", profile.email)

  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  })

  if (error) {
    console.log("[v0] Authentication failed:", error.message)
    return { error: "Invalid password. Please check your password and try again." }
  }

  console.log("[v0] Authentication successful for user:", profile.username)
  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Password reset email sent!" }
}

export async function updateActivity() {
  const cookieStore = cookies()
  const adminSession = cookieStore.get("admin-session")

  if (adminSession) {
    try {
      const sessionData = JSON.parse(adminSession.value)
      sessionData.lastActivity = Date.now()

      cookieStore.set("admin-session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60, // Reset to 8 minutes
      })

      return { success: true }
    } catch (error) {
      return { error: "Invalid session" }
    }
  }

  return { error: "No active session" }
}

export async function checkSessionValidity() {
  const cookieStore = cookies()
  const adminSession = cookieStore.get("admin-session")

  if (!adminSession) {
    return { valid: false, reason: "No session" }
  }

  try {
    const sessionData = JSON.parse(adminSession.value)
    const now = Date.now()
    const timeSinceActivity = now - sessionData.lastActivity
    const eightMinutesInMs = 8 * 60 * 1000

    if (timeSinceActivity > eightMinutesInMs) {
      // Session expired due to inactivity
      cookieStore.delete("admin-session")
      return { valid: false, reason: "Session expired due to inactivity" }
    }

    return { valid: true, sessionData }
  } catch (error) {
    cookieStore.delete("admin-session")
    return { valid: false, reason: "Invalid session data" }
  }
}

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete("admin-session")

  // Also sign out from Supabase if there's a session
  await supabase.auth.signOut()

  redirect("/auth/login")
}
