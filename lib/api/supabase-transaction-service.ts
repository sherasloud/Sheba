import { createClient } from "@/lib/supabase/server"

export interface Transaction {
  id: string
  phone_number: string
  amount: number
  type: string
  description: string
  operator?: string
  status: string
  created_at: string
}

export async function saveTransaction(transaction: {
  phone_number: string
  amount: number
  type: string
  description: string
  operator?: string
  status?: string
}): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("transactions").insert({
    phone_number: transaction.phone_number,
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description,
    operator: transaction.operator,
    status: transaction.status || "completed",
  })

  if (error) {
    console.error("[v0] Error saving transaction:", error)
    return false
  }

  return true
}

export async function getTransactions(phoneNumber: string): Promise<Transaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("phone_number", phoneNumber)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }

  return data || []
}
