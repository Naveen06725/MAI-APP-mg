"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { enhancedSignUp } from "@/lib/actions"

export function EnhancedSignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    email?: string
    mobileNumber?: string
    confirmPassword?: string
  }>({})
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const handlePasswordChange = (field: "password" | "confirmPassword", value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    if (field === "confirmPassword" || (field === "password" && formData.confirmPassword)) {
      if (newFormData.password !== newFormData.confirmPassword && newFormData.confirmPassword) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      } else {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
      }
    }
  }

  async function handleSubmit(formData: FormData) {
    console.log("[v0] Form submission started - SIGNUP FORM")
    console.log("[v0] About to call enhancedSignUp function")
    setIsLoading(true)
    setMessage(null)
    setFieldErrors({})

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      setIsLoading(false)
      return
    }

    console.log("[v0] Calling enhancedSignUp with username:", formData.get("username"))
    const result = await enhancedSignUp(formData)
    console.log("[v0] enhancedSignUp result:", result)

    if (result?.error) {
      if (result.error.includes("username")) {
        setFieldErrors((prev) => ({ ...prev, username: result.error }))
      } else if (result.error.includes("email")) {
        setFieldErrors((prev) => ({ ...prev, email: result.error }))
      } else if (result.error.includes("mobile")) {
        setFieldErrors((prev) => ({ ...prev, mobileNumber: result.error }))
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } else {
      setMessage({
        type: "success",
        text: result?.success || "Account created successfully! You can now log in with your credentials.",
      })

      // Redirect to dashboard after 2 seconds for a seamless flow
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join the MAI Platform community</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" type="text" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              className={fieldErrors.username ? "border-red-500" : ""}
            />
            {fieldErrors.username ? (
              <p className="text-sm text-red-500">{fieldErrors.username}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Username must be unique</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className={fieldErrors.email ? "border-red-500" : ""}
              />
              {fieldErrors.email ? (
                <p className="text-sm text-red-500">{fieldErrors.email}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Email must be unique</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                required
                className={fieldErrors.mobileNumber ? "border-red-500" : ""}
              />
              {fieldErrors.mobileNumber ? (
                <p className="text-sm text-red-500">{fieldErrors.mobileNumber}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Mobile number must be unique</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                onChange={(e) => handlePasswordChange("password", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                className={fieldErrors.confirmPassword ? "border-red-500" : ""}
              />
              {fieldErrors.confirmPassword && <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input id="streetAddress" name="streetAddress" type="text" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildingNumber">Building Number</Label>
                <Input id="buildingNumber" name="buildingNumber" type="text" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" type="text" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" type="text" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" type="text" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input id="county" name="county" type="text" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipcode">Zip Code</Label>
                <Input id="zipcode" name="zipcode" type="text" required />
              </div>
            </div>
          </div>

          {message && (
            <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
