import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface RealtimeTransfer {
  id: string
  sender_phone: string
  receiver_phone: string
  amount: number
  transaction_id: string
  status: string
  created_at: string
}

export interface TransferNotification {
  type: "sent" | "received"
  amount: number
  phone: string
  transactionId: string
  timestamp: string
}

class RealtimeTransferService {
  private _supabase: SupabaseClient | null = null
  private listeners: Map<string, (notification: TransferNotification) => void> = new Map()

  private get supabase(): SupabaseClient {
    if (!this._supabase) {
      this._supabase = createClient()
    }
    return this._supabase
  }

  // Subscribe to real-time transfer updates for a specific phone number
  subscribeToTransfers(phoneNumber: string, callback: (notification: TransferNotification) => void) {
    const channel = this.supabase
      .channel(`transfers:${phoneNumber}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transfers",
          filter: `receiver_phone=eq.${phoneNumber}`,
        },
        (payload) => {
          const transfer = payload.new as RealtimeTransfer
          callback({
            type: "received",
            amount: transfer.amount,
            phone: transfer.sender_phone,
            transactionId: transfer.transaction_id,
            timestamp: transfer.created_at,
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transfers",
          filter: `sender_phone=eq.${phoneNumber}`,
        },
        (payload) => {
          const transfer = payload.new as RealtimeTransfer
          callback({
            type: "sent",
            amount: transfer.amount,
            phone: transfer.receiver_phone,
            transactionId: transfer.transaction_id,
            timestamp: transfer.created_at,
          })
        },
      )
      .subscribe()

    this.listeners.set(phoneNumber, callback)
    return () => {
      channel.unsubscribe()
      this.listeners.delete(phoneNumber)
    }
  }

  // Record a transfer in the database
  async recordTransfer(data: {
    senderPhone: string
    receiverPhone: string
    amount: number
    transactionId: string
  }) {
    try {
      const { data: transfer, error } = await this.supabase
        .from("transfers")
        .insert({
          sender_phone: data.senderPhone,
          receiver_phone: data.receiverPhone,
          amount: data.amount,
          transaction_id: data.transactionId,
          status: "completed",
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error recording transfer:", error)
        return { success: false, error: error.message }
      }

      return { success: true, transfer }
    } catch (error) {
      console.error("[v0] Error recording transfer:", error)
      return { success: false, error: "Failed to record transfer" }
    }
  }

  // Get recent transfers for a phone number
  async getRecentTransfers(phoneNumber: string, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from("transfers")
        .select("*")
        .or(`sender_phone.eq.${phoneNumber},receiver_phone.eq.${phoneNumber}`)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[v0] Error fetching transfers:", error)
        return { success: false, error: error.message }
      }

      return { success: true, transfers: data }
    } catch (error) {
      console.error("[v0] Error fetching transfers:", error)
      return { success: false, error: "Failed to fetch transfers" }
    }
  }
}

let _instance: RealtimeTransferService | null = null

export function getRealtimeTransferService(): RealtimeTransferService {
  if (!_instance) {
    _instance = new RealtimeTransferService()
  }
  return _instance
}

// For backwards compatibility - but avoid using this direct export
export const realtimeTransferService = {
  subscribeToTransfers: (...args: Parameters<RealtimeTransferService["subscribeToTransfers"]>) =>
    getRealtimeTransferService().subscribeToTransfers(...args),
  recordTransfer: (...args: Parameters<RealtimeTransferService["recordTransfer"]>) =>
    getRealtimeTransferService().recordTransfer(...args),
  getRecentTransfers: (...args: Parameters<RealtimeTransferService["getRecentTransfers"]>) =>
    getRealtimeTransferService().getRecentTransfers(...args),
}
