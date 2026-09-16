import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client safely - handle missing keys
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    console.warn(
      "[v0] Supabase not configured for bank transfers. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY."
    )
    return null
  }

  return createClient(url, key)
}

interface BankTransferRequest {
  bankAccountId: string
  transferType: "to_bank" | "from_bank"
  amount: number
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bank transfer feature is not configured. Please contact support.",
        },
        { status: 503 }
      )
    }

    const body: BankTransferRequest = await request.json()
    const { bankAccountId, transferType, amount, description } = body

    console.log("[v0] Bank transfer initiated:", { bankAccountId, transferType, amount })

    // Validate inputs
    if (!bankAccountId || !transferType || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid transfer parameters" },
        { status: 400 }
      )
    }

    // Get authenticated user
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get bank account details
    const { data: bankAccount, error: accountError } = await supabase
      .from("linked_bank_accounts")
      .select("*")
      .eq("id", bankAccountId)
      .single()

    if (accountError || !bankAccount) {
      console.error("[v0] Bank account not found:", accountError)
      return NextResponse.json(
        { success: false, message: "Bank account not found" },
        { status: 404 }
      )
    }

    // Check if account is verified
    if (!bankAccount.is_verified) {
      return NextResponse.json(
        { success: false, message: "Bank account is not verified" },
        { status: 400 }
      )
    }

    // Get bank integration settings
    const { data: bankSettings, error: settingsError } = await supabase
      .from("bank_integration_settings")
      .select("*")
      .eq("bank_name", bankAccount.bank_name)
      .single()

    if (settingsError || !bankSettings || bankSettings.status !== "active") {
      return NextResponse.json(
        { success: false, message: `${bankAccount.bank_name} is not currently available` },
        { status: 400 }
      )
    }

    // Calculate transaction fee
    const transactionFee = (amount * (bankSettings.transaction_fee || 0)) / 100
    const totalAmount = amount + transactionFee

    console.log("[v0] Transaction fee calculated:", { amount, fee: transactionFee, total: totalAmount })

    // Call bank API based on bank name
    let bankResponse
    try {
      bankResponse = await callBankAPI(
        bankAccount.bank_name,
        bankSettings,
        {
          bankAccountId,
          accountNumber: bankAccount.account_number,
          accountHolder: bankAccount.account_holder_name,
          transferType,
          amount: totalAmount,
          description: description || "Payment via Sheba App"
        }
      )
    } catch (bankError) {
      console.error("[v0] Bank API error:", bankError)
      
      // Log failed transfer
      await supabase.from("bank_transfers").insert({
        bank_account_id: bankAccountId,
        bank_name: bankAccount.bank_name,
        transfer_type: transferType,
        amount: totalAmount,
        status: "failed",
        error_message: String(bankError),
        bank_response: { error: String(bankError) }
      })

      return NextResponse.json(
        { success: false, message: "Bank transfer failed. Please try again." },
        { status: 500 }
      )
    }

    // Store transfer in database
    const { data: transfer, error: transferError } = await supabase
      .from("bank_transfers")
      .insert({
        bank_account_id: bankAccountId,
        bank_name: bankAccount.bank_name,
        transfer_type: transferType,
        amount: totalAmount,
        transaction_reference: bankResponse.reference || bankResponse.transactionId,
        status: bankResponse.status || "processing",
        bank_response: bankResponse
      })
      .select()
      .single()

    if (transferError) {
      console.error("[v0] Failed to store transfer:", transferError)
      return NextResponse.json(
        { success: false, message: "Failed to process transfer" },
        { status: 500 }
      )
    }

    console.log("[v0] Bank transfer successful:", transfer)

    return NextResponse.json({
      success: true,
      message: "Transfer initiated successfully",
      transferId: transfer.id,
      reference: bankResponse.reference || bankResponse.transactionId,
      status: transfer.status,
      amount: totalAmount,
      fee: transactionFee
    })
  } catch (error) {
    console.error("[v0] Bank transfer error:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}

/**
 * Call appropriate bank API based on bank name
 */
async function callBankAPI(
  bankName: string,
  settings: any,
  transferData: any
): Promise<any> {
  console.log("[v0] Calling bank API for:", bankName)

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env[`${bankName.replace(/\s+/g, "_").toUpperCase()}_API_KEY`] || ""}`,
  }

  const payload = {
    merchantId: settings.merchant_id,
    ...transferData,
    timestamp: new Date().toISOString(),
  }

  try {
    const response = await fetch(`${settings.api_endpoint}/transfer`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Bank API error")
    }

    const result = await response.json()
    console.log("[v0] Bank API response:", { reference: result.reference, status: result.status })

    return result
  } catch (error) {
    console.error("[v0] Bank API call failed:", error)
    throw error
  }
}

/**
 * GET endpoint to check transfer status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transferId = searchParams.get("id")
    const reference = searchParams.get("reference")

    if (!transferId && !reference) {
      return NextResponse.json(
        { success: false, message: "Transfer ID or reference is required" },
        { status: 400 }
      )
    }

    let query = supabase.from("bank_transfers").select("*")

    if (transferId) {
      query = query.eq("id", transferId)
    } else if (reference) {
      query = query.eq("transaction_reference", reference)
    }

    const { data: transfer, error } = await query.single()

    if (error || !transfer) {
      return NextResponse.json(
        { success: false, message: "Transfer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      transfer
    })
  } catch (error) {
    console.error("[v0] Failed to fetch transfer status:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
