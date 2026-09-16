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
    const message = `আপনার OTP কোড: ${otp}\nএই কোডটি 5 মিনিটের জন্য বৈধ।`

    console.log('[v0] Attempting to send SMS:', {
      to: phoneNumber,
      message: message,
    })

    // ========================
    // YOUR MyGP SMS METHOD HERE
    // ========================
    // Example structure:
    /*
    const result = await myGPSendSMS({
      toNumber: phoneNumber,
      message: message,
      fromNumber: process.env.MYGP_NUMBER
    })

    if (result.success) {
      return {
        success: true,
        message: 'OTP sent successfully',
        messageId: result.messageId
      }
    } else {
      return {
        success: false,
        message: result.error || 'Failed to send SMS'
      }
    }
    */

    // PLACEHOLDER: Replace above with your actual implementation
    // For now, we'll simulate success for testing
    console.log('[v0] SMS sending - IMPLEMENT YOUR METHOD HERE')

    return {
      success: true,
      message: 'OTP message configured (implement your SMS method)',
      messageId: `msg_${Date.now()}`,
    }
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
export async function verifyOTP(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  try {
    // For demo purposes - allow any 6-digit OTP that matches the last 6 digits of phone
    // In production, verify against database
    
    // DEMO: Accept OTP "123456" or "111111" for any phone number
    const demoOTPs = ['123456', '111111', '000000']
    if (demoOTPs.includes(otp)) {
      console.log('[v0] Demo OTP verified for phone:', phoneNumber)
      return { success: true, message: 'OTP verified successfully' }
    }

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
