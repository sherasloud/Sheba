import { NextResponse } from "next/server"

async function handleCallback(request: Request) {
  const url = new URL(request.url)
  const status = (url.searchParams.get("status") || url.searchParams.get("payment_status") || url.searchParams.get("transaction_status") || "").toLowerCase()
  const invoiceNumber = url.searchParams.get("invoice_number") || url.searchParams.get("invoiceNumber") || url.searchParams.get("invoice") || ""
  const transactionId = url.searchParams.get("trx_id") || url.searchParams.get("trxId") || url.searchParams.get("transaction_id") || ""

  if (status !== "success" && status !== "successful" && status !== "completed") {
    return NextResponse.redirect(new URL(`/add-money?payment=failed&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
  }

  const merchantId = process.env.PAYSTATION_MERCHANT_ID
  if (!merchantId || !invoiceNumber) {
    return NextResponse.redirect(new URL(`/add-money?payment=failed`, url.origin))
  }

  const verificationResponse = await fetch("https://api.paystation.com.bd/transaction-status", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", merchantId },
    body: JSON.stringify({ invoice_number: invoiceNumber }),
    cache: "no-store",
  })
  const verification = await verificationResponse.json().catch(() => null)
  const verifiedStatus = String(verification?.trx_status || verification?.status || "").toLowerCase()
  if (!verificationResponse.ok || verifiedStatus !== "success") {
    console.error("[v0] PayStation verification failed", { invoiceNumber, verifiedStatus })
    return NextResponse.redirect(new URL(`/add-money?payment=failed&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
  }

  const phoneNumber = verification?.cust_phone || verification?.customer_phone || url.searchParams.get("cust_phone") || url.searchParams.get("phoneNumber") || invoiceNumber.match(/^SHEBA-(\d{10,15})-/)?.[1]
  const verifiedAmount = Number(verification?.payment_amount || verification?.amount || verification?.transaction_amount || url.searchParams.get("payment_amount") || url.searchParams.get("amount"))
  if (!phoneNumber || !Number.isFinite(verifiedAmount) || verifiedAmount <= 0) {
    return NextResponse.redirect(new URL(`/add-money?payment=failed`, url.origin))
  }

  const creditResponse = await fetch(new URL("/api/add-money", url.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, amount: verifiedAmount, method: "paystation", cardType: "PayStation" }),
  })
  if (!creditResponse.ok) {
    console.error("[v0] PayStation verified but wallet credit failed", { invoiceNumber, phoneNumber })
    return NextResponse.redirect(new URL(`/add-money?payment=pending&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
  }

  return NextResponse.redirect(new URL(`/add-money?payment=success&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
}

export async function GET(request: Request) {
  return handleCallback(request)
}

export async function POST(request: Request) {
  const body = await request.text()
  const url = new URL(request.url)
  const params = new URLSearchParams(body)
  const callbackFields = ["status", "payment_status", "transaction_status", "invoice_number", "invoiceNumber", "invoice", "trx_id", "trxId", "transaction_id", "cust_phone", "phoneNumber", "payment_amount", "amount"]
  for (const key of callbackFields) {
    const value = params.get(key)
    if (value !== null) url.searchParams.set(key, value)
  }
  return handleCallback(new Request(url, { method: "GET" }))
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

