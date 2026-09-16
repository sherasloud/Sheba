"use server"

export async function testRechargeAPI(phoneNumber: string, operator: string, amount: string) {
  try {
    console.log("[v0] ========== SERVER-SIDE API TEST START ==========")
    console.log("[v0] Testing recharge API with:")
    console.log("[v0] Phone:", phoneNumber)
    console.log("[v0] Operator:", operator)
    console.log("[v0] Amount:", amount)

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_RECHARGE_API_URL || process.env.RECHARGE_API_URL || "https://irechargebd.com/api/request"
    const API_KEY = process.env.RECHARGE_API_KEY || ""

    console.log("[v0] API URL:", API_BASE_URL)
    console.log("[v0] API Key exists:", !!API_KEY)
    console.log("[v0] API Key length:", API_KEY.length)
    console.log("[v0] API Key (first 10 chars):", API_KEY.substring(0, 10) + "...")

    const operatorCodeMap: Record<string, string> = {
      Grameenphone: "gp",
      Robi: "robi",
      Banglalink: "bl",
      Airtel: "airtel",
      Teletalk: "teletalk",
    }

    const operatorCode = operatorCodeMap[operator] || operator.toLowerCase()

    // iRechargeBD API requires these specific parameters
    const requestBody = {
      service: "bdrecharge", // Required: service type for mobile recharge
      number: phoneNumber, // Phone number to recharge
      amount: Number(amount), // Amount in Taka
      operator: operatorCode, // Operator code (gp, robi, bl, airtel, teletalk)
      type: "prepaid", // Type: prepaid or postpaid
      user: phoneNumber, // User identifier
      api_key: API_KEY, // API key as parameter (not in header)
    }

    console.log("[v0] Request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response statusText:", response.statusText)
    console.log("[v0] Response ok:", response.ok)

    const responseText = await response.text()
    console.log("[v0] Response text (first 500 chars):", responseText.substring(0, 500))

    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log("[v0] Parsed response data:", JSON.stringify(responseData, null, 2))
    } catch (parseError) {
      console.error("[v0] Failed to parse response as JSON")
      console.error("[v0] Parse error:", parseError)
      responseData = {
        error: "Invalid JSON response",
        rawResponse: responseText.substring(0, 1000),
        parseError: parseError instanceof Error ? parseError.message : String(parseError),
      }
    }

    console.log("[v0] ========== SERVER-SIDE API TEST END ==========")

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      requestBody: requestBody,
      apiUrl: API_BASE_URL,
      apiKeyLength: API_KEY.length,
      apiKeyPreview: API_KEY.substring(0, 10) + "...",
    }
  } catch (err: any) {
    console.error("[v0] Server-side API test error:", err)
    return {
      success: false,
      error: err.message || "An error occurred",
      stack: err.stack,
    }
  }
}
