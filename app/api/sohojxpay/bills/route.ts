import { NextResponse } from "next/server"

const SOHOJXPAY_BASE_URL = "https://sohojxpay.com"

const billerCodes: Record<string, string> = {
  DESCO_POSTPAID: "desco",
  DESCO_PREPAID: "desco",
  WZPDCL_POSTPAID: "wzpdcl",
  NESCO_POSTPAID: "nesco",
  NESCO_PREPAID: "nesco",
  REB_POSTPAID: "breb",
  DWASA: "dwasa",
  RJWASA: "rwasa",
  CTGWASA: "cwasa",
  TITAS: "titas_gas_metered",
  JALALABAD_GAS: "jalalabad_gas",
  BGDCL: "bakhrabad_gas",
  KGDCL: "karnaphuli_gas",
  SGCL: "sundarban_gas",
}

function getBillType(category: string) {
  switch (category.toLowerCase()) {
    case "electricity":
      return "electricity"
    case "water":
      return "water"
    case "gas":
      return "gas"
    default:
      return category.toLowerCase()
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.SOHOJXPAY_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "SohojXPay API key is not configured" }, { status: 503 })
  }

  try {
    const input = await request.json()
    const accountNumber = String(input.accountNumber || "").trim()
    const providerCode = String(input.providerCode || "").trim()
    const category = String(input.category || "").trim()
    const amount = Number(input.amount)
    const contactNumber = String(input.contactNumber || "").trim()

    if (!accountNumber || !providerCode || !category || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Account, provider, category and a valid amount are required" }, { status: 400 })
    }

    const billerCode = billerCodes[providerCode] || providerCode.toLowerCase()
    const transactionId = `SHEBA-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    const payload = {
      bill_type: getBillType(category),
      biller_code: billerCode,
      account_number: accountNumber,
      amount,
      tran_id: transactionId,
      ...(input.meterType ? { meter_type: input.meterType } : {}),
      ...(contactNumber ? { contact_number: contactNumber } : {}),
    }

    const response = await fetch(`${SOHOJXPAY_BASE_URL}/api/v1/bills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const responseText = await response.text()
    let data: unknown
    try {
      data = responseText ? JSON.parse(responseText) : null
    } catch {
      data = { message: responseText }
    }

    if (!response.ok) {
      return NextResponse.json({ error: "SohojXPay rejected the bill payment", details: data }, { status: response.status })
    }

    return NextResponse.json({ success: true, transactionId, data })
  } catch (error) {
    console.error("[v0] SohojXPay bill payment error:", error)
    return NextResponse.json({ error: "Unable to reach SohojXPay" }, { status: 502 })
  }
}
