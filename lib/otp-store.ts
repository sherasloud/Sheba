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
const RESEND_COOLDOWN_SECONDS = 60 // min gap between two sends

const otpKey = (phone: string) => `otp:${phone}`
const attemptsKey = (phone: string) => `otp_attempts:${phone}`
const hourlyKey = (phone: string) => `otp_rate_hour:${phone}`
const cooldownKey = (phone: string) => `otp_cooldown:${phone}`

export type GenerateResult = { ok: true; otp: string } | { ok: false; message: string }

/**
 * Generate a 6-digit OTP, store it in Redis with a TTL, and enforce rate limits.
 * Returns the plain OTP so the caller can hand it to the WhatsApp sender.
 */
export async function generateAndStoreOTP(phone: string): Promise<GenerateResult> {
  // Cooldown: block rapid re-sends
  const onCooldown = await redis.get(cooldownKey(phone))
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

  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  await redis.set(otpKey(phone), otp, { ex: OTP_TTL_SECONDS })
  await redis.del(attemptsKey(phone))
  await redis.set(cooldownKey(phone), "1", { ex: RESEND_COOLDOWN_SECONDS })

  return { ok: true, otp }
}

export type VerifyResult = { success: boolean; message: string }

/**
 * Verify a submitted OTP against the stored code.
 * Deletes the code on success and after too many wrong attempts.
 */
export async function verifyStoredOTP(phone: string, otp: string): Promise<VerifyResult> {
  const stored = await redis.get<string | number>(otpKey(phone))
  if (stored === null || stored === undefined) {
    return { success: false, message: "OTP মেয়াদ শেষ হয়ে গেছে। নতুন OTP নিন।" }
  }

  const attempts = await redis.incr(attemptsKey(phone))
  if (attempts === 1) {
    await redis.expire(attemptsKey(phone), OTP_TTL_SECONDS)
  }
  if (attempts > MAX_VERIFY_ATTEMPTS) {
    await redis.del(otpKey(phone))
    await redis.del(attemptsKey(phone))
    return { success: false, message: "অনেকবার ভুল হয়েছে। নতুন OTP নিন।" }
  }

  if (String(stored) !== String(otp)) {
    return { success: false, message: "ভুল OTP" }
  }

  await redis.del(otpKey(phone))
  await redis.del(attemptsKey(phone))
  return { success: true, message: "OTP verified successfully" }
}
