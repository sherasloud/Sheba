import { NextResponse } from "next/server"

// Global transaction store (in production, this would be a database)
let globalTransactions: any[] = []

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userPhone = searchParams.get("userPhone")

    if (!userPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "User phone number is required",
        },
        { status: 400 },
      )
    }

    // Filter transactions for the specific user only
    const userTransactions = globalTransactions.filter((transaction) => {
      const isSender = transaction.from === userPhone || transaction.senderPhone === userPhone
      const isReceiver = transaction.to === userPhone || transaction.recipientPhone === userPhone
      return isSender || isReceiver
    })

    return NextResponse.json({
      success: true,
      transactions: userTransactions,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to sync transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const transaction = await request.json()

    // Add to global transaction store
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
    }

    globalTransactions.unshift(newTransaction)

    // Keep only last 1000 transactions
    if (globalTransactions.length > 1000) {
      globalTransactions = globalTransactions.slice(0, 1000)
    }

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: "Transaction synced globally",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to add transaction" }, { status: 500 })
  }
}
