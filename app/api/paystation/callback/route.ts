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
  const status = getValue("status", "payment_status", "transaction_status", "trx_status", "paymentStatus").toLowerCase()
  const invoiceNumber = getValue("invoice_number", "invoiceNumber", "invoice")
  const transactionId = getValue("trx_id", "trxId", "transaction_id", "transactionId")

  if (!["success", "successful", "completed", "paid", "complete"].includes(status)) {
    return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_APP_URL || "https://shebabd.vercel.app"}/add-money?payment=failed&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
  }

  const merchantId = process.env.PAYSTATION_MERCHANT_ID
  if (!merchantId || !invoiceNumber) {
    return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_APP_URL || "https://shebabd.vercel.app"}/add-money?payment=failed`, url.origin))
  }

  const verificationResponse = await fetch("https://api.paystation.com.bd/transaction-status", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", merchantId },
    body: JSON.stringify({ merchantId, invoice_number: invoiceNumber, trx_id: transactionId }),
    cache: "no-store",
  })
  const verification = await verificationResponse.json().catch(() => null)
  const verifiedStatus = String(
    verification?.trx_status || verification?.transaction_status || verification?.payment_status || verification?.status || verification?.data?.status || "",
  ).toLowerCase()
  if (!verificationResponse.ok || !["success", "successful", "completed", "paid", "complete"].includes(verifiedStatus)) {
    console.error("[v0] PayStation verification failed", { invoiceNumber, verifiedStatus })
    return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_APP_URL || "https://shebabd.vercel.app"}/add-money?payment=failed&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
  }

  const verifiedData = verification?.data || verification
  const phoneNumber = verifiedData?.cust_phone || verifiedData?.customer_phone || getValue("cust_phone", "phoneNumber") || invoiceNumber.match(/^SHEBA-(\d{10,15})-/)?.[1]
  const verifiedAmount = Number(verifiedData?.payment_amount || verifiedData?.amount || verifiedData?.transaction_amount || getValue("payment_amount", "amount"))
  if (!phoneNumber || !Number.isFinite(verifiedAmount) || verifiedAmount <= 0) {
    return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_APP_URL || "https://shebabd.vercel.app"}/add-money?payment=failed`, url.origin))
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
      return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_APP_URL || "https://shebabd.vercel.app"}/add-money?payment=pending&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
    }
  }

  return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_APP_URL || "https://shebabd.vercel.app"}/add-money?payment=success&invoice=${encodeURIComponent(invoiceNumber)}`, url.origin))
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

