import { createHash, randomInt } from "node:crypto"
import { Redis } from "@upstash/redis"

/**
 * Upstash Redis-backed OTP store.
 * Uses the KV_REST_API_* env vars provided by the Upstash for Redis integration.
 */
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const OTP_TTL_SECONDS = 300 // code valid for 5 minutes
const MAX_VERIFY_ATTEMPTS = 5 // wrong-guess limit per code
const MAX_SENDS_PER_HOUR = 5 // how many codes a number can request per hour
const MAX_REQUESTS_PER_IP_PER_HOUR = 15
const RESEND_COOLDOWN_SECONDS = 60 // min gap between two sends
type OTPPurpose = "payment-gateway"

const otpKey = (phone: string, purpose?: OTPPurpose) => purpose ? `otp:${purpose}:${phone}` : `otp:${phone}`
const attemptsKey = (phone: string, purpose?: OTPPurpose) => purpose ? `otp_attempts:${purpose}:${phone}` : `otp_attempts:${phone}`
const hourlyKey = (phone: string) => `otp_rate_hour:${phone}`
const cooldownKey = (phone: string, purpose?: OTPPurpose) => purpose ? `otp_cooldown:${purpose}:${phone}` : `otp_cooldown:${phone}`
const ipRateKey = (ip: string) => `otp_rate_ip:${createHash("sha256").update(ip).digest("hex")}`

export async function consumeOTPRequestIpLimit(ip: string): Promise<boolean> {
  const key = ipRateKey(ip)
  const requests = await redis.incr(key)
  if (requests === 1) {
    await redis.expire(key, 3600)
  }
  return requests <= MAX_REQUESTS_PER_IP_PER_HOUR
}

export async function invalidateStoredOTP(phone: string, purpose?: OTPPurpose): Promise<void> {
  await redis.del(otpKey(phone, purpose), attemptsKey(phone, purpose), cooldownKey(phone, purpose))
}

export type GenerateResult = { ok: true; otp: string } | { ok: false; message: string }

/**
 * Generate a 6-digit OTP, store it in Redis with a TTL, and enforce rate limits.
 * Returns the plain OTP for the SMS provider; payment gateway codes use a separate namespace.
 */
export async function generateAndStoreOTP(phone: string, purpose?: OTPPurpose): Promise<GenerateResult> {
  // Cooldown: block rapid re-sends
  const onCooldown = await redis.get(cooldownKey(phone, purpose))
  if (onCooldown) {
    return { ok: false, message: "একটু পরে আবার চেষ্টা করুন" }
  }

  // Hourly cap
  const sends = await redis.incr(hourlyKey(phone))
  if (sends === 1) {
    await redis.expire(hourlyKey(phone), 3600)
  }
  if (sends > MAX_SENDS_PER_HOUR) {
    return { ok: false, message: "অনেকবার চেষ্টা করেছেন। ১ ঘণ্টা পর আবার চেষ্টা করুন।" }
  }

  const otp = randomInt(100000, 1000000).toString()

  await redis.set(otpKey(phone, purpose), otp, { ex: OTP_TTL_SECONDS })
  await redis.del(attemptsKey(phone, purpose))
  await redis.set(cooldownKey(phone, purpose), "1", { ex: RESEND_COOLDOWN_SECONDS })

  return { ok: true, otp }
}

export type VerifyResult = { success: boolean; message: string }

/**
 * Verify a submitted OTP against the stored code.
 * Deletes the code on success and after too many wrong attempts.
 */
export async function verifyStoredOTP(phone: string, otp: string, purpose?: OTPPurpose): Promise<VerifyResult> {
  const stored = await redis.get<string | number>(otpKey(phone, purpose))
  if (stored === null || stored === undefined) {
    return { success: false, message: "OTP মেয়াদ শেষ হয়ে গেছে। নতুন OTP নিন।" }
  }

  const attempts = await redis.incr(attemptsKey(phone, purpose))
  if (attempts === 1) {
    await redis.expire(attemptsKey(phone, purpose), OTP_TTL_SECONDS)
  }
  if (attempts > MAX_VERIFY_ATTEMPTS) {
    await redis.del(otpKey(phone, purpose))
    await redis.del(attemptsKey(phone, purpose))
    return { success: false, message: "অনেকবার ভুল হয়েছে। নতুন OTP নিন।" }
  }

  if (String(stored) !== String(otp)) {
    return { success: false, message: "ভুল OTP" }
  }

  await redis.del(otpKey(phone, purpose))
  await redis.del(attemptsKey(phone, purpose))
  return { success: true, message: "OTP verified successfully" }
}
