import { type NextRequest, NextResponse } from "next/server"
import {
  findUserByPhone,
  updateUserBalance,
  validateUserPin,
  registerUser,
  getUserBalance,
} from "@/lib/data/static-data"
import { realtimeTransferService } from "@/lib/api/realtime-transfer-service"
import { db } from "@/lib/db"
import { appUsers, transactions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

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

    // Find sender and receiver from Neon database with fresh data
    let sender = null
    let receiver = null
    
    try {
      sender = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, senderPhone),
      })
      
      receiver = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, receiverPhone),
      })
    } catch (err) {
      console.error('[v0] Database error during user lookup:', err)
      return NextResponse.json({ success: false, message: "Database error" })
    }

    if (!sender) {
      console.log(`[v0] Sender not found: ${senderPhone}`)
      return NextResponse.json({ success: false, message: "Sender account not found" })
    }

    if (!receiver) {
      console.log(`[v0] Receiver not found: ${receiverPhone}`)
      return NextResponse.json({ success: false, message: "Receiver account not found" })
    }

    // Validate PIN
    if (sender.pin !== pin) {
      console.log(`[v0] PIN mismatch for ${senderPhone}`)
      return NextResponse.json({ success: false, message: "Invalid PIN" })
    }

    // Get fresh balance from database - handle BigInt properly
    const senderBalanceBigInt = BigInt(sender.balance || 0)
    const receiverBalanceBigInt = BigInt(receiver.balance || 0)
    const amountBigInt = BigInt(amount)
    
    console.log(`[v0] Fresh balance check - Sender ${senderPhone}: ${senderBalanceBigInt.toString()} Tk, needs: ${amount} Tk`)
    console.log(`[v0] Receiver ${receiverPhone} current balance: ${receiverBalanceBigInt.toString()} Tk`)

    // Strict balance validation using BigInt
    if (senderBalanceBigInt < amountBigInt) {
      console.log(`[v0] INSUFFICIENT BALANCE ERROR - Has: ${senderBalanceBigInt.toString()}, Needs: ${amount}`)
      return NextResponse.json({ 
        success: false, 
        message: `অপর্জাপ্ত ব্যালেন্স। আপনার ব্যালেন্স: ${senderBalanceBigInt.toString()} Tk, প্রয়োজন: ${amount} Tk` 
      })
    }

    // Calculate fee (0 for now, but can be added later)
    const transferFee = BigInt(0)

    const finalSenderBalance = senderBalanceBigInt - amountBigInt - transferFee
    const finalReceiverBalance = receiverBalanceBigInt + amountBigInt
    
    console.log(`[v0] After transfer - Sender: ${finalSenderBalance.toString()}, Receiver: ${finalReceiverBalance.toString()}`)

    // Update balances atomically in Neon database
    try {
      // Update sender balance
      await db.update(appUsers)
        .set({ balance: finalSenderBalance })
        .where(eq(appUsers.phoneNumber, senderPhone))
      
      // Update receiver balance
      await db.update(appUsers)
        .set({ balance: finalReceiverBalance })
        .where(eq(appUsers.phoneNumber, receiverPhone))
      
      console.log(`[v0] Balances updated in Neon - Sender: ${finalSenderBalance.toString()}, Receiver: ${finalReceiverBalance.toString()}`)
    } catch (err) {
      console.error('[v0] Failed to update balances in Neon:', err)
      return NextResponse.json({ success: false, message: "Transfer failed - database error" })
    }

    const uniqueTransactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Neon database এ transaction record করছি
    try {
      await db.insert(transactions).values({
        id: uniqueTransactionId,
        fromPhone: senderPhone,
        toPhone: receiverPhone,
        amount,
        type: 'transfer',
        status: 'completed',
        description: `Transfer to ${receiver.fullName}`,
        createdAt: new Date(),
      })
      console.log('[v0] Transaction logged in Neon:', uniqueTransactionId)
    } catch (dbError) {
      console.error('[v0] Failed to log transaction in Neon:', dbError)
      // Continue anyway - transaction already happened
    }

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
