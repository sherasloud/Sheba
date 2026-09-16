"use client"

import { useState } from "react"

interface RechargeData {
  operator: string
  phoneNumber: string
  amount: number
  packageId?: string
  paymentMethod?: "wallet" | "recharge"
}

interface RechargeResult {
  success: boolean
  transactionId?: string
  operatorTxnId?: string
  message: string
  timestamp?: string
  balance?: number
}

export function useRecharge() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processRecharge = async (data: RechargeData): Promise<RechargeResult> => {
    setLoading(true)
    setError(null)

    try {
      console.log("🚀 Starting recharge process:", {
        operator: data.operator,
        amount: data.amount,
        paymentMethod: data.paymentMethod || "wallet",
      })

      const response = await fetch("/api/recharge/real", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          paymentMethod: data.paymentMethod || "wallet",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Recharge failed")
      }

      console.log("✅ Recharge successful:", result.transactionId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("❌ Recharge error:", errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkBalance = async (): Promise<number> => {
    try {
      const response = await fetch("/api/recharge/real?action=balance")
      const result = await response.json()
      return result.balance || 0
    } catch (error) {
      console.error("Balance check failed:", error)
      return 0
    }
  }

  const checkStatus = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/recharge/real?action=status&transactionId=${transactionId}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error("Status check failed:", error)
      return null
    }
  }

  const getOperators = async () => {
    try {
      const response = await fetch("/api/recharge/real?action=operators")
      const result = await response.json()
      return result.operators || []
    } catch (error) {
      console.error("Operators fetch failed:", error)
      return []
    }
  }

  return {
    processRecharge,
    checkBalance,
    checkStatus,
    getOperators,
    loading,
    error,
  }
}
