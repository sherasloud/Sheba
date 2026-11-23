/**
 * AutoMas SMS service for Sheba OTPs and transaction notifications.
 */

interface SMSResult {
  success: boolean
  message: string
  errorCode?: string
  messageId?: string
  data?: unknown
}

const AUTOMAS_URL = "https://api.automas.com.bd/smsapiv3"

function localBangladeshPhone(phoneNumber: string): string | null {
  const digits = phoneNumber.replace(/\D/g, "")
  const nationalDigits = digits.startsWith("880") ? digits.slice(3) : digits
  const localNumber = nationalDigits.startsWith("0") ? nationalDigits : `0${nationalDigits}`
  return /^01[3-9]\d{8}$/.test(localNumber) ? localNumber : null
}

async function sendAutomasSMS(
  phoneNumber: string,
  message: string,
  useInternationalMsisdn = false,
): Promise<SMSResult> {
  const contact = localBangladeshPhone(phoneNumber)
  if (!contact) return { success: false, message: "Invalid Bangladesh mobile number", errorCode: "INVALID_MSISDN" }
  const recipient = useInternationalMsisdn ? `880${contact.slice(1)}` : contact

  const apiKey = process.env.AUTOMAS_API_KEY || process.env.api_key || process.env.API_KEY
  const senderId = process.env.AUTOMAS_SENDER_ID || "Sheba"
  if (!apiKey || !senderId) return { success: false, message: "AutoMas SMS is not configured", errorCode: "NOT_CONFIGURED" }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(AUTOMAS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        senderid: senderId,
        type: "text",
        scheduledDateTime: "",
        msg: message,
        contacts: recipient,
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
      ? data as { status?: unknown; id?: unknown; response?: unknown }
      : null
    const responseRecords = Array.isArray(result?.response)
      ? result.response.filter((record): record is { status?: unknown; id?: unknown } =>
          typeof record === "object" && record !== null,
        )
      : []
    const topLevelStatus = String(result?.status ?? "").trim().toUpperCase()
    const responseReference = typeof result?.response === "string" ? result.response.trim() : ""
    const recordStatuses = responseRecords.map((record) => String(record.status ?? "").trim().toUpperCase())
    const isAcceptedStatus = (status: string) => status === "0" || status === "SUCCESS"
    const responseReferenceIsAccepted = Boolean(responseReference)
      && !/^[1-9]\d*$/.test(responseReference)
      && !/\b(?:error|failed|invalid|rejected)\b/i.test(responseReference)
    const accepted = response.ok && (responseRecords.length > 0
      ? recordStatuses.every(isAcceptedStatus)
      : topLevelStatus
        ? isAcceptedStatus(topLevelStatus)
        : responseReferenceIsAccepted)

    if (accepted) {
      const messageId = responseRecords[0]?.id ?? result?.id ?? (responseReference || undefined)
      return {
        success: true,
        message: "SMS accepted by AutoMas",
        messageId: typeof messageId === "string" || typeof messageId === "number" ? String(messageId) : undefined,
        data,
      }
    }

    const providerStatus = responseRecords.length > 0 ? recordStatuses.join(",") : topLevelStatus
    const stringResponseCode = /^[1-9]\d*$/.test(responseReference) ? responseReference : ""
    const errorCode = response.ok
      ? providerStatus || stringResponseCode || (responseReference ? "PROVIDER_REJECTED" : "UNRECOGNIZED")
      : `HTTP_${response.status}`

    if (errorCode === "105" && !useInternationalMsisdn) {
      return sendAutomasSMS(phoneNumber, message, true)
    }

    const reason = !response.ok
      ? `HTTP ${response.status}`
      : providerStatus
        ? `provider status ${providerStatus}`
        : responseReference
          ? "provider response rejected"
          : `unrecognized provider response (HTTP ${response.status})`
    return { success: false, message: `AutoMas did not accept the SMS (${reason})`, errorCode }
  } catch (error: unknown) {
    const timedOut = error instanceof Error && error.name === "AbortError"
    return {
      success: false,
      message: timedOut ? "AutoMas SMS timed out" : "Could not reach AutoMas SMS",
      errorCode: timedOut ? "TIMEOUT" : "NETWORK_ERROR",
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Send a Sheba-branded OTP, optionally bound to this app's origin for WebOTP autofill.
 */
export async function sendOTP(phoneNumber: string, otp: string, originHost?: string): Promise<SMSResult> {
  try {
    const host = originHost?.trim().toLowerCase()
    const canBindToOrigin = Boolean(host && (host === "localhost" || (/^[a-z0-9.-]+$/.test(host) && host.includes("."))))
    const originBinding = canBindToOrigin ? `\n@${host} #${otp}` : ""
    const message = `Sheba verification code: ${otp}. It expires in 5 minutes.${originBinding}`

    return await sendAutomasSMS(phoneNumber, message)
  } catch (error: unknown) {
    console.error("[v0] Error sending OTP:", error instanceof Error ? error.message : "Unknown error")
    return {
      success: false,
      message: "Failed to send OTP",
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
  const displayPhone = localBangladeshPhone(peerPhone || phoneNumber) ?? (peerPhone || phoneNumber)
  const message = `${label}\nUser : ${displayPhone}\nAmount : ${formattedAmount} ${currency}\nBalance : ${formattedBalance} ${currency}\nTransaction ID : ${transactionId}\n${formattedTime}`
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
