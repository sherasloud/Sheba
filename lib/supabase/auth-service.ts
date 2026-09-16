import { createClient } from "./client"
import { createClient as createServerClient } from "./server"

export async function sendOTP(phone: string) {
  try {
    console.log("[v0] Sending OTP to:", phone)
    
    const supabase = createClient()
    
    // Send OTP using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    })

    if (error) {
      console.error("[v0] Error sending OTP:", error.message)
      return { success: false, message: error.message }
    }

    console.log("[v0] OTP sent successfully:", data)
    return { 
      success: true, 
      message: "OTP sent successfully",
      sessionId: data.session?.id
    }
  } catch (error) {
    console.error("[v0] Error in sendOTP:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to send OTP" 
    }
  }
}

export async function verifyOTP(phone: string, otp: string) {
  try {
    console.log("[v0] Verifying OTP for:", phone)
    
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: "sms",
    })

    if (error) {
      console.error("[v0] Error verifying OTP:", error.message)
      return { success: false, message: error.message }
    }

    console.log("[v0] OTP verified successfully")
    return { 
      success: true, 
      message: "OTP verified successfully",
      user: data.user,
      session: data.session
    }
  } catch (error) {
    console.error("[v0] Error in verifyOTP:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to verify OTP" 
    }
  }
}

export async function signOut() {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[v0] Error signing out:", error.message)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Signed out successfully" }
  } catch (error) {
    console.error("[v0] Error in signOut:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to sign out" 
    }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error("[v0] Error getting user:", error.message)
      return null
    }

    return user
  } catch (error) {
    console.error("[v0] Error in getCurrentUser:", error)
    return null
  }
}
