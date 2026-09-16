"use server"

import { rechargeService } from "@/lib/api/recharge-service"

export async function processRechargeAction(formData: {
  phoneNumber: string
  operator: string
  type: string
  amount: number
  pin: string
  userId: string
}) {
  try {
    console.log("[v0] Server Action: Processing recharge request")

    const result = await rechargeService.processRecharge({
      phoneNumber: formData.phoneNumber,
      operator: formData.operator,
      type: formData.type,
      amount: formData.amount,
      pin: formData.pin,
      userId: formData.userId,
    })

    console.log("[v0] Server Action: Recharge result:", result)

    if (!result.success) {
      return {
        success: false,
        error: result.message || "Recharge failed",
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    console.error("[v0] Server Action: Recharge error:", error)
    return {
      success: false,
      error: error.message || "Recharge failed",
    }
  }
}
