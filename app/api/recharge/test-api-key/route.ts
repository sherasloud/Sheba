import { NextResponse } from "next/server"

export async function GET() {
  try {
    const API_KEY = process.env.RECHARGE_API_KEY
    const API_URL = process.env.NEXT_PUBLIC_RECHARGE_API_URL || "https://irechargebd.com/api"

    console.log("[v0] Testing API key...")
    console.log("[v0] API Key present:", !!API_KEY)
    console.log("[v0] API Key length:", API_KEY?.length)
    console.log("[v0] API URL:", API_URL)

    if (!API_KEY) {
      return NextResponse.json({
        success: false,
        message: "API key not configured",
        details: "RECHARGE_API_KEY environment variable is missing",
      })
    }

    // Test API key with a simple balance check or status endpoint
    const testEndpoint = "https://irechargebd.com/api/balance"

    console.log("[v0] Testing endpoint:", testEndpoint)

    const response = await fetch(testEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        api_key: API_KEY,
      }),
    })

    console.log("[v0] Test response status:", response.status)

    const responseText = await response.text()
    console.log("[v0] Test response:", responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      result = { raw: responseText }
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      message: response.ok ? "API key is valid" : "API key test failed",
      apiKeyMasked: API_KEY ? `${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 5)}` : "MISSING",
      response: result,
    })
  } catch (error) {
    console.error("[v0] API key test error:", error)
    return NextResponse.json({
      success: false,
      message: "Error testing API key",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
