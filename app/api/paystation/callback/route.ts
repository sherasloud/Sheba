import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const status = (url.searchParams.get("status") || "").toLowerCase()
  const invoiceNumber = url.searchParams.get("invoice_number") || url.searchParams.get("invoiceNumber") || ""
  const transactionId = url.searchParams.get("trx_id") || url.searchParams.get("trxId") || ""

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

  const invoiceParts = invoiceNumber.split("-")
  const phoneNumber = invoiceParts[1]
  const verifiedAmount = Number(verification?.payment_amount || verification?.amount || url.searchParams.get("payment_amount"))
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

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

