import { createClient } from "@/lib/supabase/server"

export async function getUserBalance(phoneNumber: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_balances")
    .select("balance")
    .eq("phone_number", phoneNumber)
    .single()

  if (error) {
    console.error("[v0] Error fetching balance:", error)
    return 0
  }

  return data?.balance || 0
}

export async function updateUserBalance(phoneNumber: string, newBalance: number): Promise<boolean> {
  const supabase = await createClient()

  // Try to update existing record
  const { error: updateError } = await supabase
    .from("user_balances")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("phone_number", phoneNumber)

  if (updateError) {
    // If update fails, try to insert new record
    const { error: insertError } = await supabase
      .from("user_balances")
      .insert({ phone_number: phoneNumber, balance: newBalance })

    if (insertError) {
      console.error("[v0] Error updating balance:", insertError)
      return false
    }
  }

  return true
}

export async function deductBalance(phoneNumber: string, amount: number): Promise<boolean> {
  const currentBalance = await getUserBalance(phoneNumber)
  const newBalance = currentBalance - amount

  if (newBalance < 0) {
    console.error("[v0] Insufficient balance")
    return false
  }

  return await updateUserBalance(phoneNumber, newBalance)
}
