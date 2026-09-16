import { NextResponse } from "next/server"
import { updateUserBalance, getUserBalance } from "@/lib/api/supabase-balance-service"
import { shebaSMS } from "@/lib/api/sheba-sms-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log("[v0] SSLCommerz Success Callback received:", body)

    const { tran_id, status, amount, currency, card_issuer, risk_level, value_c, value_a } = body
    
    if (status !== "VALIDATED") {
      console.error("[v0] Payment validation failed. Status:", status)
      return NextResponse.json({
        success: false,
        message: "Payment validation failed",
        tran_id: tran_id,
      })
    }

    const phoneNumber = value_c // Phone number stored in value_c
    const cardType = value_a // Card type stored in value_a
    const amountNumeric = Number(amount)

    console.log("[v0] Processing successful payment:", {
      transactionId: tran_id,
      amount: amountNumeric,
      phone: phoneNumber,
      cardType: cardType,
    })

    // Get current balance
    let currentBalance = 0
    try {
      currentBalance = await getUserBalance(phoneNumber)
    } catch (error) {
      console.log("[v0] Could not fetch balance, starting from 0")
    }

    // Update balance with added amount
    const newBalance = currentBalance + amountNumeric
    
    try {
      const updateSuccess = await updateUserBalance(phoneNumber, newBalance)
      if (!updateSuccess) {
        console.error("[v0] Failed to update balance after SSLCommerz success")
        return NextResponse.json({
          success: false,
          message: "Payment confirmed but balance update failed",
        })
      }
    } catch (error) {
      console.error("[v0] Database error during balance update:", error)
    }

    // Send SMS notification
    try {
      await shebaSMS.sendTransactionSMS(phoneNumber, "cashin", amountNumeric, newBalance)
    } catch (error) {
      console.error("[v0] SMS notification failed:", error)
    }

    // Store transaction record
    const transaction = {
      id: Date.now(),
      transactionId: tran_id,
      type: "Card to Sheba",
      amount: amountNumeric,
      method: `${cardType} Card`,
      status: "Completed",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      cardIssuer: card_issuer || "Unknown",
      riskLevel: risk_level || "Low",
      phone: phoneNumber,
    }

    try {
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]") || []
      transactions.push(transaction)
      localStorage.setItem("transactions", JSON.stringify(transactions))
    } catch (error) {
      console.log("[v0] Could not store transaction in localStorage")
    }

    console.log("[v0] Payment successful. New balance:", newBalance)

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      newBalance: newBalance,
      transactionId: tran_id,
    })
  } catch (error) {
    console.error("[v0] SSLCommerz Success Callback Error:", error)
    return NextResponse.json(
      { success: false, message: "Payment processing error" },
      { status: 500 }
    )
  }
}
