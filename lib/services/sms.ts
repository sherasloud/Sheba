/**
 * SMS delivery through the Automas JSON API.
 */

interface SMSResult {
  success: boolean
  message: string
  messageId?: string
  data?: unknown
}

const AUTOmAS_URL = "https://api.automas.com.bd/smsapiv4"
const AUTOmAS_MASKING_NAME = "Sheba"

function localPhone(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "")
  if (digits.startsWith("880")) return `0${digits.slice(3)}`
  if (digits.startsWith("88")) return `0${digits.slice(2)}`
  return digits
}

async function sendAutomasSMS(phoneNumber: string, message: string): Promise<SMSResult> {
  const apiKey = process.env.AUTOMAS_API_KEY || process.env.Automas_API || process.env.api_key || process.env.API_KEY
  const senderId = process.env.AUTOMAS_SENDER_ID || process.env.Automas_Sender_ID || AUTOmAS_MASKING_NAME
  if (!apiKey) return { success: false, message: "Automas SMS is not configured" }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(AUTOmAS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        senderid: senderId,
        Masking: AUTOmAS_MASKING_NAME,
        type: "text",
        scheduledDateTime: "",
        msg: message,
        contacts: localPhone(phoneNumber),
      }),
      cache: "no-store",
      signal: controller.signal,
    })
    const raw = await response.text()
    let data: unknown = raw
    try {
      data = JSON.parse(raw)
    } catch {}

    const result = typeof data === "object" && data !== null
      ? data as { status?: unknown; Status?: unknown; code?: unknown; success?: unknown; error?: unknown; message?: unknown }
      : null
    const status = String(result?.status ?? result?.Status ?? result?.code ?? "").trim().toLowerCase()
    const failedStatus = ["false", "failed", "error"].includes(status) || (/^-?\d+$/.test(status) && Number(status) !== 0)
    const explicitSuccess = result?.success === true || ["0", "200", "success", "true"].includes(status)
    const confirmedSuccess = explicitSuccess || (!result && /^(?:0|success|sent|queued|accepted)$/i.test(raw.trim()))

    if (!response.ok || result?.success === false || failedStatus || !confirmedSuccess) {
      const providerMessage = result?.error || result?.message || raw || `HTTP ${response.status}`
      return { success: false, message: `Automas SMS failed: ${String(providerMessage)}`, data }
    }

    return { success: true, message: "SMS sent successfully", data }
  } catch (error: any) {
    return { success: false, message: error?.name === "AbortError" ? "Automas SMS timed out" : "Could not reach Automas SMS" }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Send an OTP to a phone number using Automas.
 */
export async function sendOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
  try {
    // Message content
    const message = `Sheba OTP: ${otp}. This code is valid for 5 minutes.`

    return await sendAutomasSMS(phoneNumber, message)
  } catch (error: any) {
    console.error('[v0] Error sending OTP:', error.message)
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    }
  }
}

/**
 * Verify OTP from database or demo OTP
 */
export async function sendTransactionSMS({
  phoneNumber,
  direction,
  amount,
  fee = 0,
  balance,
  transactionId,
  peerPhone,
  timestamp = new Date(),
}: {
  phoneNumber: string
  direction: "sent" | "received"
  amount: number
  fee?: number
  balance: number
  transactionId: string
  peerPhone?: string
  timestamp?: Date
}): Promise<SMSResult> {
  const label = direction === "sent" ? "Send Money Successful!" : "Money Received Successfully!"
  const currency = "Tk"
  const formattedAmount = String(amount)
  const formattedBalance = String(balance)
  const formattedTime = timestamp.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  const message = `${label}\nUser : ${localPhone(peerPhone || phoneNumber)}\nAmount : ${formattedAmount} ${currency}\nBalance : ${formattedBalance} ${currency}\nTransaction ID : ${transactionId}\n${formattedTime}`
  try {
    return await sendAutomasSMS(phoneNumber, message)
  } catch (error: any) {
    console.error("[v0] Transaction SMS failed:", error?.message)
    return { success: false, message: error?.message || "Transaction SMS failed" }
  }
}

export async function verifyOTP(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Try to verify from Supabase if available
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Get OTP from database
      const { data: otpData, error } = await supabase
        .from('otp_sessions')
        .select('*')
        .eq('phone', phoneNumber)
        .single()

      if (error || !otpData) {
        // OTP not found in database
        return { success: false, message: 'OTP expire hয়ে গেছে বা invalid' }
      }

      // Check if OTP is expired
      if (new Date(otpData.expires_at) < new Date()) {
        return { success: false, message: 'OTP নির্ধারিত সময় শেষ হয়ে গেছে' }
      }

      // Check if OTP matches
      if (otpData.otp !== otp) {
        // Increment attempts
        await supabase
          .from('otp_sessions')
          .update({ attempts: otpData.attempts + 1 })
          .eq('phone', phoneNumber)

        // Block after 3 attempts
        if (otpData.attempts >= 2) {
          return { success: false, message: 'অনেক চেষ্টা করেছেন। পরে চেষ্টা করুন।' }
        }

        return { success: false, message: 'ভুল OTP' }
      }

      // OTP verified - delete it
      await supabase.from('otp_sessions').delete().eq('phone', phoneNumber)

      return { success: true, message: 'OTP যাচাইকরণ সফল' }
    } catch (supabaseError: any) {
      // If Supabase fails, reject OTP (don't fallback to success)
      console.log('[v0] Supabase error during OTP verification:', supabaseError.message)
      return { success: false, message: 'OTP verification service unavailable' }
    }
  } catch (error: any) {
    console.error('[v0] Error verifying OTP:', error.message)
    return { success: false, message: 'যাচাইকরণ ব্যর্থ হয়েছে' }
  }
}
