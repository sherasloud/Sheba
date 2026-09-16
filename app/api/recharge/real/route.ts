import { NextResponse } from "next/server"
import { SSLWirelessRecharge } from "@/lib/api/ssl-wireless-recharge"

const sslRecharge = new SSLWirelessRecharge()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { operator, phoneNumber, amount, packageId, userId, paymentMethod = "wallet" } = body

    console.log("🔌 Real Recharge API Called:", {
      operator,
      phoneNumber: phoneNumber?.slice(0, 3) + "****" + phoneNumber?.slice(-2),
      amount,
      paymentMethod,
      timestamp: new Date().toISOString(),
    })

    // Validate required fields
    if (!operator || !phoneNumber || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: operator, phoneNumber, amount",
          error: "VALIDATION_ERROR",
        },
        { status: 400 },
      )
    }

    // Validate phone number format (Bangladesh)
    if (!/^01\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number format. Use 01XXXXXXXXX",
          error: "INVALID_PHONE",
        },
        { status: 400 },
      )
    }

    // Validate amount
    const rechargeAmount = Number(amount)
    if (isNaN(rechargeAmount) || rechargeAmount < 10 || rechargeAmount > 5000) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount must be between Tk10 and Tk5000",
          error: "INVALID_AMOUNT",
        },
        { status: 400 },
      )
    }

    // Check balance based on payment method
    let availableBalance = 0
    if (paymentMethod === "wallet") {
      // In production, get user's wallet balance from database
      // For demo, we'll use a high balance
      availableBalance = 999999999 // Demo wallet balance
    } else {
      availableBalance = await sslRecharge.checkBalance()
    }

    if (availableBalance < rechargeAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient ${paymentMethod} balance`,
          error: "INSUFFICIENT_BALANCE",
          availableBalance,
        },
        { status: 400 },
      )
    }

    // Process recharge through SSL Wireless
    console.log(`🚀 Processing real recharge using ${paymentMethod} balance...`)
    const result = await sslRecharge.processRecharge({
      operator,
      phoneNumber,
      amount: rechargeAmount,
      merchantTxnId: `SHEBA-${paymentMethod.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })

    if (result.status === "SUCCESS") {
      console.log("✅ Recharge successful:", result.transactionId)

      // Log successful transaction
      const transactionLog = {
        transactionId: result.transactionId,
        operatorTxnId: result.operatorTxnId,
        operator,
        phoneNumber,
        amount: rechargeAmount,
        paymentMethod,
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        userId: userId || "anonymous",
      }

      console.log("💾 Transaction logged:", transactionLog)

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        operatorTxnId: result.operatorTxnId,
        message: result.message || "Recharge completed successfully",
        status: "completed",
        timestamp: new Date().toISOString(),
        operator,
        phoneNumber,
        amount: rechargeAmount,
        paymentMethod,
        balance: result.balance,
      })
    } else {
      console.log("❌ Recharge failed:", result.message)
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Recharge failed",
          error: "RECHARGE_FAILED",
          status: result.status,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("💥 Recharge API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Please try again later.",
        error: "INTERNAL_ERROR",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "balance") {
      const balance = await sslRecharge.checkBalance()
      return NextResponse.json({
        success: true,
        balance,
        formatted: formatBalance(balance),
        timestamp: new Date().toISOString(),
      })
    }

    if (action === "status") {
      const transactionId = searchParams.get("transactionId")
      if (!transactionId) {
        return NextResponse.json({ success: false, message: "Transaction ID required" }, { status: 400 })
      }

      const status = await sslRecharge.checkStatus(transactionId)
      return NextResponse.json({
        success: true,
        status: status.status,
        message: status.message,
        transactionId,
        timestamp: new Date().toISOString(),
      })
    }

    if (action === "operators") {
      return NextResponse.json({
        success: true,
        operators: [
          { code: "GP", name: "Grameenphone", status: "active" },
          { code: "ROBI", name: "Robi", status: "active" },
          { code: "BL", name: "Banglalink", status: "active" },
          { code: "AIRTEL", name: "Airtel", status: "active" },
          { code: "TT", name: "Teletalk", status: "active" },
          { code: "SKITTO", name: "Skitto", status: "active" },
        ],
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Recharge GET API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

function formatBalance(balance: number): string {
  if (balance >= 1000000000000) {
    return `Tk${(balance / 1000000000000).toFixed(1)}T`
  } else if (balance >= 1000000000) {
    return `Tk${(balance / 1000000000).toFixed(1)}B`
  } else if (balance >= 1000000) {
    return `Tk${(balance / 1000000).toFixed(1)}M`
  } else if (balance >= 1000) {
    return `Tk${(balance / 1000).toFixed(1)}K`
  }
  return `Tk${balance.toLocaleString()}`
}
