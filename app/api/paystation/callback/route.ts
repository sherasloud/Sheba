import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appUsers, transactions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

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

  const paymentTransactionId = `PAYSTATION-${invoiceNumber}`
  const existingPayment = await db.query.transactions.findFirst({
    where: eq(transactions.id, paymentTransactionId),
  })

  if (!existingPayment) {
    const credited = await db.transaction(async (tx) => {
      const user = await tx.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, String(phoneNumber).trim()),
      })
      if (!user) return false

      const currentBalance = Number(user.balance ?? 0)
      const nextBalance = currentBalance + verifiedAmount
      await tx.update(appUsers).set({ balance: nextBalance, updatedAt: new Date() }).where(eq(appUsers.id, user.id))
      await tx.insert(transactions).values({
        id: paymentTransactionId,
        userid: user.id,
        phonenumber: String(phoneNumber).trim(),
        amount: verifiedAmount,
        balanceBefore: currentBalance,
        balanceAfter: nextBalance,
        type: "add_money",
        status: "completed",
        description: `PayStation card top-up ${invoiceNumber}`,
      })
      return true
    })

    if (!credited) {
      console.error("[v0] PayStation user not found", { invoiceNumber, phoneNumber })
      return NextResponse.redirect(new URL(`/add-money?payment=pending&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
    }
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

