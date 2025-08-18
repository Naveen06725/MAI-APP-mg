export interface OTPData {
  email: string
  otpCode: string
  expiresAt: string
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function isOTPExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt)
}

export function getOTPExpirationTime(): string {
  return new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
}
