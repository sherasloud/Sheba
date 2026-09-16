import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, phoneNumber, cardType, userEmail, userName } = body

    const STORE_ID = process.env.NEXT_PUBLIC_SSLCOMMERZ_STORE_ID || "shusto0live"
    const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || "6A0D6039B299110857"
    
    console.log("[v0] SSLCommerz Payment Init - Store ID:", STORE_ID)

    if (!amount || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Amount and phone number are required" },
        { status: 400 }
      )
    }

    // Generate unique transaction ID
    const transactionId = `SHB${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create SSLCommerz request data
    const paymentData = {
      store_id: STORE_ID,
      store_passwd: STORE_PASSWORD,
      total_amount: Number(amount),
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/sslcommerz/success`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/sslcommerz/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/add-money`,
      emi_option: 0,
      cus_name: userName || "Customer",
      cus_email: userEmail || "customer@example.com",
      cus_phone: phoneNumber,
      cus_add1: "Not Provided",
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_name: "Add Money - Sheba",
      product_category: "Mobile Money",
      product_profile: "service",
      value_a: cardType || "Card",
      value_b: "AddMoney",
      value_c: phoneNumber,
      value_d: transactionId,
    }

    console.log("[v0] SSLCommerz Payment Data:", {
      tran_id: paymentData.tran_id,
      amount: paymentData.total_amount,
      currency: paymentData.currency,
      customer: paymentData.cus_phone,
    })

    // Return payment initialization data
    // Client will redirect to SSLCommerz with this data
    return NextResponse.json({
      success: true,
      paymentData: paymentData,
      redirectUrl: "https://sandbox.sslcommerz.com/EasyCheckOut",
      transactionId: transactionId,
    })
  } catch (error) {
    console.error("[v0] SSLCommerz Init Payment Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to initialize payment" },
      { status: 500 }
    )
  }
}
