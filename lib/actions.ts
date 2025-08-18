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

  try {
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
    const userWithEmail = existingAuthUser.users.find((user) => user.email === email)

    if (userWithEmail) {
      console.log("[v0] Found existing auth user, deleting:", userWithEmail.id)
      await supabaseAdmin.auth.admin.deleteUser(userWithEmail.id)
      // Also delete any existing profile
      await supabaseAdmin.from("profiles").delete().eq("id", userWithEmail.id)
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false, // We'll handle verification with OTP
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        username: username,
      },
    })

    if (authError || !authData.user) {
      console.log("[v0] Auth user creation failed:", authError?.message)
      return { error: "Account creation failed. Please try again." }
    }

    console.log("[v0] Auth user created successfully with ID:", authData.user.id)

    const profileData = {
      id: authData.user.id,
      email: email,
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
    }

    console.log("[v0] Creating profile with data:", profileData)

    const { data: insertedProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(profileData, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (profileError) {
      console.log("[v0] Profile creation error:", profileError.message)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { error: "Account creation failed. Please try again." }
    }

    console.log("[v0] Profile created successfully:", insertedProfile)

    await supabaseAdmin.from("admin_stats").delete().eq("stat_type", "otp_verification").eq("stat_value->email", email)

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: otpError } = await supabaseAdmin.from("admin_stats").insert({
      stat_type: "otp_verification",
      stat_value: {
        email,
        user_id: authData.user.id,
        otp_code: otpCode,
        expires_at: expiresAt,
        is_used: false,
      },
    })

    if (otpError) {
      await supabaseAdmin.from("profiles").delete().eq("id", authData.user.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { error: "Failed to prepare verification. Please try again." }
    }

    console.log(`[v0] OTP for ${email}: ${otpCode}`)
    console.log("[v0] OTP generated successfully for email:", email)
    console.log("[v0] SignUp completed successfully for username:", username)

    return {
      success: "Account created successfully! Please check your email for the verification code.",
      requiresOTP: true,
      email: email,
      otp: otpCode,
    }
  } catch (error: any) {
    console.log("[v0] Unexpected error during signup:", error.message)
    return { error: "Account creation failed. Please try again." }
  }
}

export async function autoLoginAfterVerification(email: string) {
  console.log("[v0] Auto-login after verification for email:", email)

  const { createClient } = await import("@supabase/supabase-js")
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from("admin_stats")
      .select("stat_value")
      .eq("stat_type", "otp_verification")
      .eq("stat_value->email", email)
      .single()

    if (otpError || !otpRecord) {
      return { error: "Verification record not found" }
    }

    const userId = otpRecord.stat_value.user_id

    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (confirmError) {
      console.log("[v0] Email confirmation failed:", confirmError.message)
      return { error: "Failed to confirm email" }
    }

    // Clean up OTP record
    await supabaseAdmin.from("admin_stats").delete().eq("stat_type", "otp_verification").eq("stat_value->email", email)

    console.log("[v0] Email confirmed successfully for user:", userId)
    return { success: "Email verified successfully", userId: userId }
  } catch (error: any) {
    console.log("[v0] Auto-login error:", error.message)
    return { error: "Verification failed. Please try again." }
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

  const { createClient } = await import("@supabase/supabase-js")
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: profile, error: profileError } = await supabaseAdmin
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

    if (error.message.includes("Email not confirmed")) {
      return {
        error: "Please verify your email address before logging in. Check your inbox for the verification email.",
      }
    }

    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid password. Please check your password and try again." }
    }

    if (error.message.includes("Email link is invalid or has expired")) {
      return { error: "Email verification link has expired. Please request a new verification email." }
    }

    if (error.message.includes("Too many requests")) {
      return { error: "Too many login attempts. Please wait a few minutes before trying again." }
    }

    // Generic fallback for other auth errors
    return { error: `Authentication failed: ${error.message}` }
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

export async function checkUserProfile(username: string) {
  console.log("[v0] Checking profile for username:", username)

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle()

  console.log("[v0] Profile check result:", { profile, error })

  return { profile, error }
}
