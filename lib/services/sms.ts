/**
 * SMS Service for sending OTP via MyGP
 * 
 * আপনার MyGP message পাঠানোর method এখানে integrate করুন
 */

interface SMSResult {
  success: boolean
  message: string
  messageId?: string
}

/**
 * Send OTP to phone number using MyGP
 * 
 * TODO: আপনার MyGP SMS পাঠানোর method এখানে add করুন
 */
export async function sendOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
  try {
    // Message content
    const message = `Sheba OTP: ${otp}. This code is valid for 5 minutes.`

    console.log('[v0] Attempting to send OTP SMS:', { to: phoneNumber })

    const apiKey = process.env.AUTOMAS_API_KEY
    const senderId = process.env.AUTOMAS_SENDER_ID

    if (!apiKey || !senderId) {
      return { success: false, message: "AutomAS SMS credentials are not configured" }
    }

    const digits = String(phoneNumber).replace(/\D/g, "")
    const recipient = digits.startsWith("0") ? `88${digits.slice(1)}` : digits
    const params = new URLSearchParams({
      apikey: apiKey,
      sender: senderId,
      msisdn: recipient,
      smstext: message,
    })
    const response = await fetch(`https://api.automas.com.bd/smsapiv3?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    })

    const raw = await response.text()
    const statusCode = Number(raw.trim())
    console.log("[v0] AutomAS SMS response:", { httpStatus: response.status, statusCode })

    if (!response.ok || !Number.isFinite(statusCode) || statusCode !== 0) {
      return {
        success: false,
        message: `AutomAS SMS failed with status ${raw.trim() || response.status}`,
      }
    }

    return { success: true, message: "OTP accepted by AutomAS" }
  } catch (error: any) {
    console.error('[v0] Error sending OTP:', error.message)
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    }
  }
}

/**
 * Verify OTP from the configured persistence layer.
 */
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
