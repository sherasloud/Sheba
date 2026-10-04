import { NextResponse } from "next/server"

const PAYSTATION_API_URL = "https://api.paystation.com.bd/initiate-payment"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const amount = Number(body.amount)
    const phoneNumber = String(body.phoneNumber || "").trim()
    const userName = String(body.userName || "Customer").trim()
    const userEmail = String(body.userEmail || "customer@sheba.com").trim()

    if (!Number.isFinite(amount) || amount < 10 || amount > 50000 || !phoneNumber) {
      return NextResponse.json({ success: false, message: "Invalid amount or phone number" }, { status: 400 })
    }

    const merchantId = process.env.PAYSTATION_MERCHANT_ID || process.env.PAYSTATION_STORE_ID
    const password = process.env.PAYSTATION_PASSWORD
    const storeId = process.env.PAYSTATION_STORE_ID || merchantId
    if (!merchantId || !password || !storeId) {
      console.error("[v0] PayStation credentials are not configured")
      return NextResponse.json({ success: false, message: "PayStation is not configured" }, { status: 503 })
    }

    const invoiceNumber = `SHEBA-${phoneNumber}-${Date.now()}-${cryptoRandomSuffix()}`
    const origin = new URL(request.url).origin
    const form = new URLSearchParams({
      merchantId,
      store_id: storeId,
      password,
      invoice_number: invoiceNumber,
      payment_amount: amount.toFixed(2),
      cust_name: userName,
      cust_phone: phoneNumber,
      cust_email: userEmail,
      callback_url: `${origin}/api/paystation/callback`,
    })

    const response = await fetch(PAYSTATION_API_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    })

    const result = await response.json().catch(() => null)
    if (!response.ok || !result) {
      console.error("[v0] PayStation initiate failed", response.status)
      return NextResponse.json({ success: false, message: "Unable to start PayStation checkout" }, { status: 502 })
    }

    const redirectUrl = result.payment_url || result.paymentUrl || result.redirect_url || result.redirectUrl || result.url
    if (!redirectUrl || typeof redirectUrl !== "string") {
      console.error("[v0] PayStation response did not contain a checkout URL")
      return NextResponse.json({ success: false, message: "PayStation did not return a checkout URL" }, { status: 502 })
    }

    return NextResponse.json({ success: true, redirectUrl, invoiceNumber })
  } catch (error) {
    console.error("[v0] PayStation initiate error", error)
    return NextResponse.json({ success: false, message: "Unable to start payment" }, { status: 500 })
  }
}

function cryptoRandomSuffix() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

