import { db } from '@/lib/db'
import { appUsers, transactions, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { senderPhone, amount, agentPhone } = await request.json()

    if (!senderPhone || !amount || amount <= 0 || !agentPhone) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    const trimmedSenderPhone = senderPhone.trim()
    const stateAgentPhone = agentPhone.trim() // Use provided agent phone

    console.log('[v0] Cashout request:', { senderPhone: trimmedSenderPhone, agentPhone: stateAgentPhone, amount })

    // Get sender from Neon database
    const sender = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, trimmedSenderPhone),
    })

    if (!sender) {
      return NextResponse.json(
        { success: false, error: 'প্রেরকের অ্যাকাউন্ট পাওয়া যায়নি' },
        { status: 404 }
      )
    }

    // Check sender balance
    const senderBalance = Number(sender.balance)
    if (senderBalance < amount) {
      return NextResponse.json(
        { success: false, error: 'অপর্যাপ্ত ব্যালেন্স' },
        { status: 400 }
      )
    }

    // Note: Fee already calculated on client side, API just processes amount
    const transactionId = `CASHOUT${Date.now()}`
    
    console.log('[v0] Cashout processing:', { amount, phone: trimmedSenderPhone })

    // Perform cashout (deduct from sender, add to state agent with fee share)
    const newSenderBalance = senderBalance - amount
    const netAmountToAgent = amount + stateShare // Agent gets amount + 50% fee share

    // Update sender balance
    await db
      .update(appUsers)
      .set({
        balance: BigInt(Math.floor(newSenderBalance)), // Keep whole numbers for balance
        updatedAt: new Date(),
      })
      .where(eq(appUsers.phoneNumber, trimmedSenderPhone))

    // Save cashout transaction record for SENDER
    try {
      await db.insert(transactions).values({
        id: transactionId,
        userid: sender.id,
        phonenumber: trimmedSenderPhone,
        amount: amount,
        balanceBefore: senderBalance,
        balanceAfter: newSenderBalance,
        type: 'cashout',
        status: 'completed',
        description: `Cashout to ${stateAgentPhone}`,
      } as any)
    } catch (txnError) {
      console.error('[v0] Failed to save cashout record:', txnError)
    }

    // Create/get agent and UPDATE THEIR BALANCE + save transaction for AGENT (receiver)
    try {
      console.log('[v0] Looking for agent with phone:', stateAgentPhone)
      
      // Try multiple phone formats
      const phonesToTry = [
        stateAgentPhone,
        stateAgentPhone.replace(/^0/, '88'),
        stateAgentPhone.replace(/^88/, '0'),
      ]
      
      let agent = null
      for (const phoneToTry of phonesToTry) {
        if (!phoneToTry || phoneToTry.length < 10) continue
        console.log('[v0] Trying to find agent with format:', phoneToTry)
        agent = await db.query.appUsers.findFirst({
          where: eq(appUsers.phoneNumber, phoneToTry),
        })
        if (agent) {
          console.log('[v0] Agent found with format:', phoneToTry)
          break
        }
      }
      
      const agentBalanceBefore = Number(agent?.balance || 0)
      // Fee is already calculated on client - API just receives amount
      const agentBalanceAfter = agentBalanceBefore + amount
      
      console.log('[v0] Agent balance update:', { 
        phone: agent.phoneNumber,
        before: agentBalanceBefore, 
        add: amount, 
        after: agentBalanceAfter
      })
      
      if (!agent) {
        console.log('[v0] Agent not found with any format, creating new agent:', stateAgentPhone)
        const [newAgent] = await db.insert(appUsers).values({
          phoneNumber: stateAgentPhone,
          fullName: `Agent ${stateAgentPhone.slice(-4)}`,
          pin: '123456',
          balance: BigInt(amount), // Create with received amount
          emailVerified: false,
          accountType: 'agent',
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning()
        agent = newAgent
        console.log('[v0] New agent created with balance:', amount)
      } else {
        // UPDATE existing agent balance using correct phone format
        console.log('[v0] Updating existing agent balance from', agentBalanceBefore, 'to', agentBalanceAfter)
        console.log('[v0] Agent phone stored as:', agent.phoneNumber)
        
        await db
          .update(appUsers)
          .set({
            balance: BigInt(Math.floor(agentBalanceAfter)), // Keep whole numbers
            updatedAt: new Date(),
          })
          .where(eq(appUsers.phoneNumber, agent.phoneNumber))
        
        console.log('[v0] Agent balance updated to:', agentBalanceAfter)
        
        // Verify update
        const verifyAgent = await db.query.appUsers.findFirst({
          where: eq(appUsers.phoneNumber, agent.phoneNumber),
        })
        console.log('[v0] Verification - Agent new balance:', Number(verifyAgent?.balance || 0))
      }

      // Save transaction record for agent
      await db.insert(transactions).values({
        id: `${transactionId}_rcv`,
        userid: agent.id,
        phonenumber: stateAgentPhone,
        amount: amount,
        balanceBefore: agentBalanceBefore,
        balanceAfter: agentBalanceAfter,
        type: 'cashout',
        status: 'completed',
        description: `Received from ${trimmedSenderPhone}`,
      } as any)
      
      console.log('[v0] Agent transaction record saved:', stateAgentPhone, 'Received:', amount)
    } catch (txnError) {
      console.error('[v0] Failed to update agent balance:', txnError)
    }

    // Save notification directly
    try {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phonenumber: trimmedSenderPhone.trim(),
        message: `৳${amount} ক্যাশআউট সফল হয়েছে`,
        type: 'cashout',
        isRead: false,
      } as any)
    } catch (err) {
      console.error('[v0] Failed to save cashout notification:', err)
    }

    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: transactionId,
          reference: transactionId,
          senderPhone: trimmedSenderPhone,
          amount,
        },
        newSenderBalance,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error in cashout API:', error)
    return NextResponse.json(
      { success: false, error: 'ক্যাশআউট প্রক্রিয়াকরণে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
