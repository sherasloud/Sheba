import { NextResponse } from "next/server"
import { productionRechargeService } from "@/lib/api/production-recharge-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { operator, phoneNumber, amount, userId, paymentMethod = "wallet", pin } = body

    console.log("🚀 Production Recharge API Called:", {
      operator,
      phoneNumber: phoneNumber?.slice(0, 3) + "****" + phoneNumber?.slice(-2),
      amount,
      paymentMethod,
      timestamp: new Date().toISOString(),
    })

    // Validate required fields
    if (!operator || !phoneNumber || !amount || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: operator, phoneNumber, amount, userId",
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

    // Process recharge through production service
    const transaction = await productionRechargeService.processRecharge({
      operator,
      phoneNumber,
      amount: rechargeAmount,
      userId,
      paymentMethod,
      pin,
    })

    if (transaction.status === "success") {
      return NextResponse.json({
        success: true,
        transactionId: transaction.transactionId,
        operatorTxnId: transaction.operatorTxnId,
        message: "Recharge completed successfully",
        status: "completed",
        timestamp: transaction.timestamp,
        operator,
        phoneNumber,
        amount: rechargeAmount,
        paymentMethod,
        commission: transaction.commission,
        profit: transaction.profit,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Recharge failed",
          error: "RECHARGE_FAILED",
          transactionId: transaction.transactionId,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("💥 Production Recharge API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
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
    const userId = searchParams.get("userId")

    if (action === "history" && userId) {
      const history = await productionRechargeService.getTransactionHistory(userId)
      return NextResponse.json({
        success: true,
        transactions: history,
        timestamp: new Date().toISOString(),
      })
    }

    if (action === "status") {
      const transactionId = searchParams.get("transactionId")
      if (!transactionId) {
        return NextResponse.json({ success: false, message: "Transaction ID required" }, { status: 400 })
      }

      const transaction = await productionRechargeService.getTransactionStatus(transactionId)
      return NextResponse.json({
        success: true,
        transaction,
        timestamp: new Date().toISOString(),
      })
    }

    if (action === "operators") {
      const operators = await productionRechargeService.getSupportedOperators()
      return NextResponse.json({
        success: true,
        operators,
        timestamp: new Date().toISOString(),
      })
    }

    if (action === "stats") {
      const stats = await productionRechargeService.getDailyStats()
      return NextResponse.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Production Recharge GET API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
