import { type NextRequest, NextResponse } from "next/server"
import {
  findUserByPhone,
  updateUserBalance,
  validateUserPin,
  registerUser,
  getUserBalance,
} from "@/lib/data/static-data"
import { realtimeTransferService } from "@/lib/api/realtime-transfer-service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phoneNumber = searchParams.get("phoneNumber")

  if (!phoneNumber) {
    return NextResponse.json({ success: false, message: "Phone number required" })
  }

  const user = findUserByPhone(phoneNumber)
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" })
  }

  return NextResponse.json({
    success: true,
    user: {
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      isVerified: user.isVerified,
      accountNumber: user.accountNumber,
    },
    balance: user.balance,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { senderPhone, receiverPhone, amount, pin, reference } = await request.json()

    if (!senderPhone || !receiverPhone || !amount || !pin) {
      return NextResponse.json({ success: false, message: "All fields are required" })
    }

    if (amount <= 0) {
      return NextResponse.json({ success: false, message: "Amount must be greater than 0" })
    }

    if (senderPhone === receiverPhone) {
      return NextResponse.json({ success: false, message: "Cannot transfer to yourself" })
    }

    // Find sender and receiver
    let sender = findUserByPhone(senderPhone)
    let receiver = findUserByPhone(receiverPhone)

    if (!sender) {
      console.log(`[v0] Auto-creating sender: ${senderPhone}`)
      const senderBalance = getUserBalance(senderPhone)
      sender = registerUser({
        phoneNumber: senderPhone,
        fullName:
          senderPhone === "01709783145" || senderPhone === "01930314459"
            ? "Admin User"
            : `User ${senderPhone.slice(-4)}`,
        balance: senderBalance, // Use actual balance instead of hardcoded values
        pin: "123456", // Default PIN
      })
      if (!sender) {
        return NextResponse.json({ success: false, message: "Failed to create sender account" })
      }
    }

    if (!receiver) {
      console.log(`[v0] Auto-creating receiver: ${receiverPhone}`)
      const receiverBalance = getUserBalance(receiverPhone)
      receiver = registerUser({
        phoneNumber: receiverPhone,
        fullName:
          receiverPhone === "01709783145" || receiverPhone === "01930314459"
            ? "Admin User"
            : `User ${receiverPhone.slice(-4)}`,
        balance: receiverBalance, // Use actual balance instead of hardcoded values
        pin: "123456", // Default PIN
      })
      if (!receiver) {
        return NextResponse.json({ success: false, message: "Failed to create receiver account" })
      }
    }

    // Validate PIN
    if (!validateUserPin(senderPhone, pin)) {
      return NextResponse.json({ success: false, message: "Invalid PIN" })
    }

    const currentSenderBalance = getUserBalance(senderPhone)
    console.log(`[v0] Checking balance for ${senderPhone}: ${currentSenderBalance} vs required: ${amount}`)

    if (currentSenderBalance < amount) {
      return NextResponse.json({ success: false, message: "Insufficient balance" })
    }

    // Calculate fee (0 for now, but can be added later)
    const transferFee = 0

    const finalSenderBalance = currentSenderBalance - amount - transferFee
    const finalReceiverBalance = receiver.balance + amount

    // Update balances atomically
    const senderBalanceUpdated = updateUserBalance(senderPhone, finalSenderBalance)
    const receiverBalanceUpdated = updateUserBalance(receiverPhone, finalReceiverBalance)

    if (!senderBalanceUpdated || !receiverBalanceUpdated) {
      return NextResponse.json({ success: false, message: "Transfer failed - please try again" })
    }

    const uniqueTransactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    await realtimeTransferService.recordTransfer({
      senderPhone,
      receiverPhone,
      amount,
      transactionId: uniqueTransactionId,
    })

    const transferResponseData = {
      success: true,
      message: "Money transferred successfully",
      transactionId: uniqueTransactionId,
      transaction: {
        id: uniqueTransactionId,
        amount,
        fee: transferFee,
        receiverName: receiver.fullName,
        receiverPhone,
        senderNewBalance: finalSenderBalance,
        receiverNewBalance: finalReceiverBalance,
        timestamp: new Date().toISOString(),
        reference: reference || `Transfer to ${receiverPhone}`,
      },
      localStorage: {
        updateSenderBalance: {
          phone: senderPhone,
          newBalance: finalSenderBalance,
        },
        updateReceiverBalance: {
          phone: receiverPhone,
          newBalance: finalReceiverBalance,
        },
        addSenderTransaction: {
          id: `SEND_${uniqueTransactionId}_${senderPhone.slice(-4)}`, // Unique ID with sender phone
          type: "Send Money",
          amount: -amount,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          status: "completed",
          to: receiverPhone,
          recipient: receiverPhone,
          recipientName: receiver.fullName,
          transactionId: uniqueTransactionId,
          description: `Sent Tk${amount.toLocaleString()} to ${receiver.fullName} (${receiverPhone})`,
        },
        addReceiverTransaction: {
          id: `RECV_${uniqueTransactionId}_${receiverPhone.slice(-4)}`, // Unique ID with receiver phone
          type: "Receive Money",
          amount: amount,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          status: "completed",
          from: senderPhone,
          sender: senderPhone,
          senderName: sender.fullName,
          transactionId: uniqueTransactionId,
          description: `Received Tk${amount.toLocaleString()} from ${sender.fullName} (${senderPhone})`,
        },
      },
    }

    console.log(`[v0] Transfer completed: ${senderPhone} -> ${receiverPhone}, Amount: ${amount}`)
    console.log(`[v0] New balances - Sender: ${finalSenderBalance}, Receiver: ${finalReceiverBalance}`)

    return NextResponse.json(transferResponseData)
  } catch (error) {
    console.error("Transfer error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" })
  }
}
