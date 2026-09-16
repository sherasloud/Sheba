"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type CashoutTransaction = {
  id: string
  user_id: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  recipient_phone?: string
  transaction_reference: string
  notes?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export async function createCashoutTransaction(data: {
  amount: number
  recipient_phone?: string
  notes?: string
}) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "User not authenticated" }
  }

  // Create cashout transaction
  const { data: transaction, error } = await supabase
    .from("cashout_transactions")
    .insert({
      user_id: user.id,
      amount: data.amount,
      recipient_phone: data.recipient_phone,
      notes: data.notes,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/cashout")
  return { data: transaction }
}

export async function getCashoutTransactions() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "User not authenticated" }
  }

  const { data, error } = await supabase
    .from("cashout_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function updateCashoutStatus(
  transactionId: string,
  status: "processing" | "completed" | "failed" | "cancelled",
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "User not authenticated" }
  }

  const { data, error } = await supabase
    .from("cashout_transactions")
    .update({ status })
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/cashout")
  return { data }
}
