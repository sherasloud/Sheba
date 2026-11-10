import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appUsers, transactions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

async function handleCallback(request: Request, callbackData: Record<string, unknown> = {}) {
  const url = new URL(request.url)
  const getValue = (...keys: string[]) => {
    for (const key of keys) {
      const value = callbackData[key] ?? url.searchParams.get(key)
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim()
    }
    return ""
  }
  const status = getValue("status", "payment_status", "transaction_status").toLowerCase()
  const invoiceNumber = getValue("invoice_number", "invoiceNumber", "invoice", "invoice_id", "order_id", "orderId")
  const transactionId = getValue("trx_id", "trxId", "transaction_id", "transactionId", "transaction_ref")

  const acceptedStatuses = ["1", "true", "success", "successful", "completed", "complete", "paid", "approved"]
  // Some PayStation callbacks omit status and only provide the invoice/trx id;
  // verification below is the source of truth in that case.
  if (status && !acceptedStatuses.includes(status)) {
    return NextResponse.redirect(new URL(`/add-money?payment=failed&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
  }

  const merchantId = process.env.PAYSTATION_MERCHANT_ID || process.env.PAYSTATION_STORE_ID
  const password = process.env.PAYSTATION_PASSWORD
  if (!merchantId || !password || !invoiceNumber) {
    return NextResponse.redirect(new URL(`/add-money?payment=failed`, url.origin))
  }

  const verificationRequests = transactionId
    ? [
        fetch("https://api.paystation.com.bd/v2/transaction-status", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json", merchantId, password },
          body: JSON.stringify({ merchantId, password, trxId: transactionId }),
          cache: "no-store",
        }),
        fetch("https://api.paystation.com.bd/transaction-status", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json", merchantId, password },
          body: JSON.stringify({ merchantId, password, invoice_number: invoiceNumber }),
          cache: "no-store",
        }),
      ]
    : [
        fetch("https://api.paystation.com.bd/transaction-status", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json", merchantId, password },
          body: JSON.stringify({ merchantId, password, invoice_number: invoiceNumber }),
          cache: "no-store",
        }),
      ]

  let verificationResponse: Response | undefined
  let verification: any = null
  for (const candidate of verificationRequests) {
    const response = await candidate
    const payload = await response.json().catch(() => null)
    const payloadData = payload?.data || payload?.result || payload
    const candidateStatus = String(payloadData?.trx_status || payloadData?.transaction_status || payloadData?.payment_status || payloadData?.status || (payloadData?.success === true ? "success" : "")).trim().toLowerCase()
    if (response.ok && ["1", "true", "success", "successful", "completed", "complete", "paid", "approved"].includes(candidateStatus)) {
      verificationResponse = response
      verification = payloadData
      break
    }
    verificationResponse = response
    verification = payloadData
  }

  const verifiedStatus = String(verification?.trx_status || verification?.transaction_status || verification?.payment_status || verification?.status || (verification?.success === true ? "success" : "")).toLowerCase()
  if (!verificationResponse?.ok || !["1", "true", "success", "successful", "completed", "complete", "paid", "approved"].includes(verifiedStatus)) {
    console.error("[v0] PayStation verification failed", { invoiceNumber, transactionId, verifiedStatus, verification })
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

  const successUrl = new URL(`/add-money?payment=success&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin)
  successUrl.searchParams.set("amount", String(verifiedAmount))
  return NextResponse.redirect(successUrl)
}

export async function GET(request: Request) {
  return handleCallback(request)
}

export async function POST(request: Request) {
  const body = await request.text()
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    try {
      return handleCallback(request, JSON.parse(body))
    } catch {
      return NextResponse.json({ success: false, message: "Invalid callback payload" }, { status: 400 })
    }
  }

  const params = new URLSearchParams(body)
  const callbackData: Record<string, string> = {}
  for (const [key, value] of params.entries()) callbackData[key] = value
  return handleCallback(request, callbackData)
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

