import { VerificationStatus } from "@/components/verification-status"

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Email Verification</h1>
          <p className="text-muted-foreground mt-2">Check your verification status below</p>
        </div>
        <VerificationStatus />
      </div>
    </div>
  )
}
