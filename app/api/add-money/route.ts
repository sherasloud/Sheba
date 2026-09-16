import { NextResponse } from "next/server"
import { shebaSMS } from "@/lib/api/sheba-sms-service"
import { sendWorkingOTPEmail } from "@/lib/working-email-service"
import { updateUserBalance, getUserBalance } from "@/lib/api/supabase-balance-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, method, cardType, userEmail, userName } = body

    console.log("[v0] Add Money API called:", { phoneNumber, amount, method, cardType })

    if (!phoneNumber || !amount) {
      return NextResponse.json({ success: false, message: "Phone number and amount are required" }, { status: 400 })
    }

    let currentBalance = 0
    try {
      currentBalance = await getUserBalance(phoneNumber)
      console.log("[v0] Current balance from Supabase:", currentBalance)
    } catch (error) {
      console.log("[v0] Could not fetch balance from Supabase, starting from 0")
      currentBalance = 0
    }

    const newBalance = currentBalance + Number(amount)
    console.log("[v0] New balance will be:", newBalance)

    try {
      const updateSuccess = await updateUserBalance(phoneNumber, newBalance)
      if (!updateSuccess) {
        console.error("[v0] Failed to update balance in Supabase")
        return NextResponse.json({ success: false, message: "Failed to update balance in database" }, { status: 500 })
      }
      console.log("[v0] Balance updated successfully in Supabase")
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ success: false, message: "Database error occurred" }, { status: 500 })
    }

    // Send SMS notification
    try {
      await shebaSMS.sendTransactionSMS(phoneNumber, "cashin", amount, newBalance)
      console.log("[v0] SMS notification sent successfully")
    } catch (smsError) {
      console.error("[v0] SMS notification failed:", smsError)
    }

    // Send Email notification for Add Money
    if (userEmail && userName) {
      try {
        const emailContent = `
Dear ${userName},

Your Add Money transaction has been completed successfully!

Transaction Details:
- Amount: Tk${amount.toLocaleString()}
- Method: ${method === "card" ? `${cardType} Card` : method}
- New Balance: Tk${newBalance.toLocaleString()}
- Date: ${new Date().toLocaleDateString()}
- Time: ${new Date().toLocaleTimeString()}

Your money has been added to your Sheba wallet.

Thank you for using Sheba!

Best regards,
Sheba Team
        `

        await sendWorkingOTPEmail(userEmail, `Add Money Success - Tk${amount}`, userName)
        console.log("[v0] Email notification sent successfully")
      } catch (emailError) {
        console.error("[v0] Email notification failed:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Add Money completed successfully",
      newBalance: newBalance,
      phoneNumber: phoneNumber,
    })
  } catch (error) {
    console.error("[v0] Add Money API error:", error)
    return NextResponse.json({ success: false, message: "Failed to process add money request" }, { status: 500 })
  }
}
