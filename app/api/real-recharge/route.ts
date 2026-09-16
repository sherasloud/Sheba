import { NextResponse } from "next/server"
import { SSLRechargeIntegration } from "@/lib/api/ssl-recharge-integration"

const sslRecharge = new SSLRechargeIntegration()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { operator, phoneNumber, amount, packageId, userId } = body

    // Validate input
    if (!operator || !phoneNumber || !amount) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate phone number (Bangladesh format)
    if (!/^01\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ success: false, message: "Invalid phone number format" }, { status: 400 })
    }

    // Process recharge through SSL Wireless
    const result = await sslRecharge.processRecharge({
      operator,
      phoneNumber,
      amount: Number(amount),
      packageId,
    })

    if (result.success) {
      // Log successful transaction
      console.log(`Recharge successful: ${result.transactionId}`)

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        operatorTxnId: result.operatorTxnId,
        message: result.message,
        timestamp: result.timestamp,
      })
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Recharge API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "balance") {
      const balance = await sslRecharge.checkBalance()
      return NextResponse.json({ balance })
    }

    if (action === "packages") {
      const operator = searchParams.get("operator")
      if (!operator) {
        return NextResponse.json({ error: "Operator is required" }, { status: 400 })
      }

      const packages = await sslRecharge.getOperatorPackages(operator)
      return NextResponse.json({ packages })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Recharge GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
