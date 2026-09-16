import { NextResponse } from "next/server"
import { shebaSMS } from "@/lib/api/sheba-sms-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { senderPhone, receiverPhone, amount, senderBalance, receiverBalance } = body

    console.log("[v0] Send Money notification API called:", { senderPhone, receiverPhone, amount })

    // Send SMS to sender
    try {
      await shebaSMS.sendTransactionSMS(senderPhone, "transfer", amount, senderBalance)
      console.log("[v0] Sender SMS notification sent successfully")
    } catch (error) {
      console.error("[v0] Sender SMS notification failed:", error)
    }

    // Send SMS to receiver
    try {
      const receiverMessage = `Dear Customer, You have received Tk.${amount} from ${senderPhone}. Your Sheba wallet balance: Tk.${receiverBalance}. Thank you for using Sheba.`

      await shebaSMS.sendTransactionSMS(receiverPhone, "transfer", amount, receiverBalance)
      console.log("[v0] Receiver SMS notification sent successfully")
    } catch (error) {
      console.error("[v0] Receiver SMS notification failed:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Send Money notifications sent successfully",
    })
  } catch (error) {
    console.error("[v0] Send Money notification API error:", error)
    return NextResponse.json({ success: false, message: "Failed to send notifications" }, { status: 500 })
  }
}
