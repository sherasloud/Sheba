"use server"

import { rechargeService } from "@/lib/api/recharge-service"
import { db } from "@/lib/db"
import { appUsers, transactions } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function processRechargeAction(formData: {
  phoneNumber: string
  operator: string
  type: string
  amount: number
  pin: string
  userId: string
}) {
  try {
    const amount = Number(formData.amount)
    if (!Number.isSafeInteger(amount) || amount < 10 || amount > 5000) {
      return { success: false, error: "Recharge amount must be between Tk10 and Tk5000." }
    }

    const phoneNumber = formData.userId.trim()
    const walletDebit = await db.transaction(async (tx) => {
      const updated = await tx
        .update(appUsers)
        .set({ balance: sql`${appUsers.balance} - ${amount}`, updatedAt: new Date() })
        .where(sql`${eq(appUsers.phoneNumber, phoneNumber)} AND COALESCE(${appUsers.balance}, 0) >= ${amount}`)
        .returning({ id: appUsers.id, balance: appUsers.balance })
      return updated[0]
    })

    if (!walletDebit) {
      return { success: false, error: "Insufficient Sheba balance or account not found." }
    }

    const result = await rechargeService.processRecharge({
      phoneNumber: formData.phoneNumber,
      operator: formData.operator,
      type: formData.type,
      amount,
      pin: formData.pin,
      userId: formData.userId,
    })

    if (!result.success) {
      await db.update(appUsers).set({ balance: sql`${appUsers.balance} + ${amount}`, updatedAt: new Date() }).where(eq(appUsers.id, walletDebit.id))
      return { success: false, error: result.message || "Recharge failed; your Sheba balance was restored." }
    }

    await db.insert(transactions).values({
      id: result.transactionId || `RECHARGE-${Date.now()}`,
      userid: walletDebit.id,
      phonenumber: phoneNumber,
      amount,
      balanceBefore: Number(walletDebit.balance ?? 0) + amount,
      balanceAfter: Number(walletDebit.balance ?? 0),
      type: "recharge",
      status: "completed",
      description: `${formData.operator} mobile recharge for ${formData.phoneNumber}`,
    }).onConflictDoNothing()

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
