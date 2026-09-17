"use client"

import { createClient } from "./client"

export interface Profile {
  id: string
  phone: string
  name: string
  pin: string
  balance: number
  account_type: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  sender_phone: string
  receiver_phone: string
  amount: number
  transaction_type: string
  reference: string
  status: string
  created_at: string
}

export interface OTPSession {
  id: string
  phone: string
  otp: string
  expires_at: string
  attempts: number
  created_at: string
}

// Initialize tables if they don't exist (for first-time setup)
export async function initializeTables() {
  const supabase = createClient()
  
  // Check if profiles table exists by trying to select from it
  const { error } = await supabase.from("profiles").select("id").limit(1)
  
  if (error && error.code === "42P01") {
    console.log("[v0] Tables need to be created via Supabase dashboard")
    return false
  }
  
  return true
}

// Check if user is admin
export function isAdminPhone(phone: string): boolean {
  return phone === "01709783145"
}

// Get user profile by phone number
export async function getProfileByPhone(phone: string): Promise<Profile | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("phone", phone)
    .single()
  
  if (error) {
    return null
  }
  
  return data
}

// Create new user profile
export async function createProfile(profile: {
  phone: string
  name: string
  pin: string
  balance?: number
  account_type?: string
}): Promise<Profile | null> {
  const supabase = createClient()
  
  console.log("[v0] Starting profile creation for phone:", profile.phone)
  console.log("[v0] Supabase client initialized:", !!supabase)
  
  // Validate input
  if (!profile.phone || !profile.name || !profile.pin) {
    console.error("[v0] Missing required fields - phone:", profile.phone, "name:", profile.name, "pin:", !!profile.pin)
    return null
  }

  // Ensure phone number is string and properly formatted
  const phoneStr = String(profile.phone).trim()
  const nameStr = String(profile.name).trim()
  const pinStr = String(profile.pin).trim()

  try {
    console.log("[v0] Attempting to insert profile with phone:", phoneStr)
    
    const insertData = {
      phone: phoneStr,
      name: nameStr,
      pin: pinStr,
      balance: profile.balance || 0,
      account_type: profile.account_type || "personal",
      is_verified: true,
    }
    
    console.log("[v0] Insert data:", JSON.stringify(insertData))
    
    const { data, error } = await supabase
      .from("profiles")
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error("[v0] Database error code:", error.code)
      console.error("[v0] Database error message:", error.message)
      console.error("[v0] Database error details:", error.details)
      console.error("[v0] Database error hint:", error.hint)
      console.error("[v0] Database error status:", error.status)
      
      // Check if it's a table not found error
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.error("[v0] CRITICAL: profiles table does not exist. Run SQL setup first.")
        return null
      }
      
      // Check if it's an auth error
      if (error.code === "42501" || error.message?.includes("permission")) {
        console.error("[v0] CRITICAL: RLS policy blocking insert. Check database permissions.")
        return null
      }
      
      // Check for duplicate phone
      if (error.code === "23505" || error.message?.includes("duplicate")) {
        console.error("[v0] Phone number already exists:", phoneStr)
        return null
      }
      
      console.error("[v0] Unknown database error:", error)
      return null
    }
    
    if (!data) {
      console.error("[v0] Insert successful but no data returned")
      return null
    }
    
    console.log("[v0] Profile created successfully:", data)
    return data
    
  } catch (err) {
    console.error("[v0] Exception in createProfile:", err instanceof Error ? err.message : String(err))
    console.error("[v0] Full error object:", err)
    return null
  }
}

// Update account type (admin only)
export async function updateAccountType(
  targetPhone: string,
  adminPhone: string,
  newAccountType: "personal" | "state" | "business"
): Promise<{ success: boolean; error?: string }> {
  // Verify admin
  if (!isAdminPhone(adminPhone)) {
    return { success: false, error: "Only admin can change account types" }
  }

  const supabase = createClient()
  
  const { error } = await supabase
    .from("profiles")
    .update({ 
      account_type: newAccountType,
      updated_at: new Date().toISOString()
    })
    .eq("phone", targetPhone)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// Update user balance
export async function updateBalance(phone: string, newBalance: number): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("profiles")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("phone", phone)
  
  if (error) {
    console.log("[v0] Error updating balance:", error.message)
    return false
  }
  
  return true
}

// Verify user PIN
export async function verifyPin(phone: string, pin: string): Promise<boolean> {
  const profile = await getProfileByPhone(phone)
  
  if (!profile) {
    return false
  }
  
  return profile.pin === pin
}

// Update user PIN
export async function updatePin(phone: string, newPin: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("profiles")
    .update({ pin: newPin, updated_at: new Date().toISOString() })
    .eq("phone", phone)
  
  if (error) {
    console.log("[v0] Error updating PIN:", error.message)
    return false
  }
  
  return true
}

// Send money between users - Sender balance decreases, Receiver balance increases
// Uses Supabase Realtime for instant updates across all devices in Bangladesh
export async function sendMoney(
  senderPhone: string,
  receiverPhone: string,
  amount: number,
  reference?: string
): Promise<{ success: boolean; error?: string; transaction?: Transaction; newSenderBalance?: number; newReceiverBalance?: number }> {
  const supabase = createClient()
  
  // Get sender profile
  const sender = await getProfileByPhone(senderPhone)
  if (!sender) {
    return { success: false, error: "প্রেরকের অ্যাকাউন্ট পাওয়া যায়নি" }
  }
  
  // Check sender balance
  if (sender.balance < amount) {
    return { success: false, error: "অপর্যাপ্ত ব্যালেন্স" }
  }
  
  // Prevent sending to self
  if (senderPhone === receiverPhone) {
    return { success: false, error: "নিজেকে টাকা পাঠানো যায় না" }
  }
  
  // Get or create receiver profile
  let receiver = await getProfileByPhone(receiverPhone)
  if (!receiver) {
    // Auto-create receiver profile with the phone number
    receiver = await createProfile({
      phone: receiverPhone,
      name: `User ${receiverPhone.slice(-4)}`,
      pin: "123456", // Default PIN - user should change it
      balance: 0,
    })
    
    if (!receiver) {
      return { success: false, error: "প্রাপকের অ্যাকাউন্ট তৈরি করতে ব্যর্থ" }
    }
  }
  
  // Calculate new balances
  // Sender: balance DECREASES (-)
  // Receiver: balance INCREASES (+)
  const newSenderBalance = sender.balance - amount
  const newReceiverBalance = receiver.balance + amount
  
  // Update sender balance (DECREASE)
  const { error: senderError } = await supabase
    .from("profiles")
    .update({ 
      balance: newSenderBalance, 
      updated_at: new Date().toISOString() 
    })
    .eq("phone", senderPhone)
  
  if (senderError) {
    return { success: false, error: "প্রেরকের ব্যালেন্স আপডেট করতে ব্যর্থ" }
  }
  
  // Update receiver balance (INCREASE)
  const { error: receiverError } = await supabase
    .from("profiles")
    .update({ 
      balance: newReceiverBalance, 
      updated_at: new Date().toISOString() 
    })
    .eq("phone", receiverPhone)
  
  if (receiverError) {
    // Rollback sender balance
    await supabase
      .from("profiles")
      .update({ balance: sender.balance })
      .eq("phone", senderPhone)
    return { success: false, error: "প্রাপকের ব্যালেন্স আপডেট করতে ব্যর্থ" }
  }
  
  // Create transaction record
  const txnRef = reference || `TXN${Date.now()}`
  const { data: transaction, error: txnError } = await supabase
    .from("transactions")
    .insert({
      sender_phone: senderPhone,
      receiver_phone: receiverPhone,
      amount: amount,
      transaction_type: "send_money",
      reference: txnRef,
      status: "completed",
    })
    .select()
    .single()
  
  if (txnError) {
    console.log("[v0] Transaction record error (balances already updated):", txnError.message)
  }
  
  return { 
    success: true, 
    transaction,
    newSenderBalance,
    newReceiverBalance
  }
}

// Get all profiles (for admin)
export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (error) {
    console.log("[v0] Error fetching all profiles:", error.message)
    return []
  }
  
  return data || []
}

// Record a transaction
export async function recordTransaction(
  senderPhone: string,
  receiverPhone: string,
  amount: number,
  type: "send_money" | "cashout" | "payment",
  reference: string
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("transactions").insert([
    {
      sender_phone: senderPhone,
      receiver_phone: receiverPhone,
      amount: amount,
      transaction_type: type,
      reference: reference,
      status: "completed",
      created_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error("[v0] Error recording transaction:", error.message)
    return false
  }

  return true
}

// Subscribe to real-time balance updates
export function subscribeToBalanceUpdates(
  phone: string,
  onUpdate: (newBalance: number) => void
) {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`balance-${phone}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `phone=eq.${phone}`,
      },
      (payload) => {
        console.log("[v0] Balance update received:", payload)
        if (payload.new && typeof payload.new === "object" && "balance" in payload.new) {
          onUpdate(Number(payload.new.balance))
        }
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// Get sent transactions for a phone number
export async function getSentTransactions(
  phone: string
): Promise<Transaction[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("sender_phone", phone)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching sent transactions:", error.message)
    return []
  }

  return data || []
}

// Get received transactions for a phone number
export async function getReceivedTransactions(
  phone: string
): Promise<Transaction[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("receiver_phone", phone)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching received transactions:", error.message)
    return []
  }

  return data || []
}

// Get transactions for a phone number
export async function getTransactions(
  phone: string
): Promise<Transaction[]> {
  const supabase = createClient()

  // Fetch sent transactions
  const { data: sentData, error: sentError } = await supabase
    .from("transactions")
    .select("*")
    .eq("sender_phone", phone)
    .order("created_at", { ascending: false })

  // Fetch received transactions
  const { data: receivedData, error: receivedError } = await supabase
    .from("transactions")
    .select("*")
    .eq("receiver_phone", phone)
    .order("created_at", { ascending: false })

  if (sentError) {
    console.error("[v0] Error fetching sent transactions:", sentError.message)
  }
  if (receivedError) {
    console.error("[v0] Error fetching received transactions:", receivedError.message)
  }

  // Merge and sort by date
  const allTransactions = [...(sentData || []), ...(receivedData || [])]
  allTransactions.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return allTransactions || []
}

// Subscribe to real-time transaction updates
export function subscribeToTransactions(
  phone: string,
  callback: (transactions: Transaction[]) => void
): (() => void) | null {
  const supabase = createClient()

  const channel = supabase
    .channel(`transactions:${phone}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transactions",
        filter: `sender_phone=eq.${phone}`,
      },
      () => {
        // Refetch all transactions
        getTransactions(phone).then(callback)
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transactions",
        filter: `receiver_phone=eq.${phone}`,
      },
      () => {
        // Refetch all transactions
        getTransactions(phone).then(callback)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Alias for backward compatibility
export const subscribeToTransactionsRealTime = subscribeToTransactions
export const supabaseSendMoney = sendMoney

// OTP Functions - Free and Simple Implementation
// Generate a 6-digit OTP
export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  return otp
}

// Create OTP session - Store in localStorage (free solution)
export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string; otp?: string }> {
  try {
    // Generate OTP
    const otp = generateOTP()
    
    // Store in localStorage with expiry (5 minutes)
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
    const otpData = {
      phone,
      otp,
      expiresAt,
      attempts: 0,
    }
    
    localStorage.setItem(`otp_${phone}`, JSON.stringify(otpData))
    
    console.log(`[v0] OTP generated for ${phone}: ${otp} (expires in 5 minutes)`)
    
    // In production with real SMS, you would call an SMS API here
    // For now, return the OTP for testing (remove in production)
    return { success: true, otp }
  } catch (error) {
    console.error("[v0] Error generating OTP:", error)
    return { success: false, error: "OTP তৈরিতে সমস্যা হয়েছে" }
  }
}

// Verify OTP
export async function verifyOTP(phone: string, enteredOTP: string): Promise<{ success: boolean; error?: string }> {
  try {
    const otpDataStr = localStorage.getItem(`otp_${phone}`)
    
    if (!otpDataStr) {
      return { success: false, error: "OTP প্রাপ্ত হয়নি বা মেয়াদ শেষ হয়েছে" }
    }
    
    const otpData = JSON.parse(otpDataStr)
    
    // Check expiry
    if (Date.now() > otpData.expiresAt) {
      localStorage.removeItem(`otp_${phone}`)
      return { success: false, error: "OTP মেয়াদ শেষ হয়েছে" }
    }
    
    // Check attempts (max 5 attempts)
    if (otpData.attempts >= 5) {
      localStorage.removeItem(`otp_${phone}`)
      return { success: false, error: "খুব বেশি ভুল চেষ্টা হয়েছে" }
    }
    
    // Verify OTP
    if (otpData.otp === enteredOTP) {
      // OTP verified - mark phone as verified temporarily
      localStorage.setItem(`verified_${phone}`, "true")
      localStorage.removeItem(`otp_${phone}`)
      return { success: true }
    }
    
    // Increment attempts
    otpData.attempts += 1
    localStorage.setItem(`otp_${phone}`, JSON.stringify(otpData))
    
    return { success: false, error: "OTP সঠিক নয়" }
  } catch (error) {
    console.error("[v0] Error verifying OTP:", error)
    return { success: false, error: "OTP যাচাইতে সমস্যা হয়েছে" }
  }
}

// Check if OTP is verified for a phone
export function isOTPVerified(phone: string): boolean {
  return localStorage.getItem(`verified_${phone}`) === "true"
}

// Clear OTP session
export function clearOTPSession(phone: string): void {
  localStorage.removeItem(`otp_${phone}`)
  localStorage.removeItem(`verified_${phone}`)
}
