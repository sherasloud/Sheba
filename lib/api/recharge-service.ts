// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_RECHARGE_API_URL || process.env.RECHARGE_API_URL || "https://irechargebd.com/api/request"
const API_KEY = process.env.RECHARGE_API_KEY || ""

// Operator code mapping
const OPERATOR_CODE_MAP: Record<string, string> = {
  Grameenphone: "GP",
  Robi: "RB",
  Banglalink: "BL",
  Airtel: "AT",
  Teletalk: "TT",
  Skitto: "GP", // Skitto uses GP network
}

// Operator prefix mapping for Bangladesh
const OPERATOR_PREFIX_MAP: Record<string, string> = {
  // Grameenphone & Skitto
  "017": "GP",
  "013": "GP",
  // Robi
  "018": "RB",
  // Banglalink
  "019": "BL",
  "014": "BL",
  // Airtel
  "016": "AT",
  // Teletalk
  "015": "TT",
}

/**
 * Detect operator from phone number prefix
 */
function detectOperatorFromPhone(phoneNumber: string): string | null {
  const prefix = phoneNumber.substring(0, 3)
  return OPERATOR_PREFIX_MAP[prefix] || null
}

// Types
export type RechargeRequest = {
  operator: string
  phoneNumber: string
  amount: number
  type: string // 'prepaid', 'postpaid', 'internet', 'offer'
  packageId?: string // For internet packages or offers
  reference?: string // Your internal reference ID
}

export type RechargeResponse = {
  success: boolean
  transactionId?: string
  message: string
  status: string
  timestamp: string
  operatorReference?: string
}

/**
 * Process mobile recharge using irechargebd.com API
 */
export async function processRecharge(data: RechargeRequest): Promise<RechargeResponse> {
  try {
    console.log("[v0] [Recharge Service] ========== RECHARGE REQUEST START ==========")
    console.log("[v0] [Recharge Service] Processing recharge request")
    console.log("[v0] [Recharge Service] Operator:", data.operator)
    console.log("[v0] [Recharge Service] Phone:", data.phoneNumber)
    console.log("[v0] [Recharge Service] Amount:", data.amount)
    console.log("[v0] [Recharge Service] Type:", data.type)

    let operatorCode = OPERATOR_CODE_MAP[data.operator]

    if (!operatorCode) {
      // Try trimmed version
      operatorCode = OPERATOR_CODE_MAP[data.operator.trim()]
    }

    if (!operatorCode) {
      // Try detecting from phone number
      operatorCode = detectOperatorFromPhone(data.phoneNumber) || null
    }

    if (!operatorCode) {
      // Last resort: use first 2 letters uppercase
      operatorCode = data.operator.substring(0, 2).toUpperCase()
    }

    console.log("[v0] [Recharge Service] Detected operator code:", operatorCode)

    const validOperators = ["GP", "RB", "BL", "AT", "TT"]
    if (!validOperators.includes(operatorCode)) {
      console.error("[v0] [Recharge Service] Invalid operator code:", operatorCode)
      return {
        success: false,
        message: `Invalid operator: ${data.operator}. Supported operators: Grameenphone, Robi, Banglalink, Airtel, Teletalk.`,
        status: "invalid_operator",
        timestamp: new Date().toISOString(),
      }
    }

    const operatorNames = {
      GP: "Grameenphone",
      RB: "Robi",
      BL: "Banglalink",
      AT: "Airtel",
      TT: "Teletalk",
    }
    console.log(
      "[v0] [Recharge Service] ✅ Operator confirmed:",
      operatorNames[operatorCode as keyof typeof operatorNames],
    )

    const transactionId = `REAL-TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    console.log("[v0] [Recharge Service] API Base URL:", API_BASE_URL)
    console.log("[v0] [Recharge Service] API Key (first 10 chars):", API_KEY?.substring(0, 10) + "...")
    console.log("[v0] [Recharge Service] Final operator code:", operatorCode)
    console.log("[v0] [Recharge Service] Transaction ID:", transactionId)

    // Prepare API request
    const apiRequest = {
      service: "bdrecharge", // Required: service type for mobile recharge
      number: data.phoneNumber, // Phone number to recharge
      amount: data.amount, // Amount in Taka
      operator: operatorCode, // Operator code (GP, RB, BL, AT, TT)
      type: data.type.toLowerCase(), // Type: prepaid or postpaid
      user: data.reference || data.phoneNumber, // User identifier
      api_key: API_KEY, // API key as parameter (not in header)
    }

    console.log("[v0] [Recharge Service] Full API request body:", JSON.stringify(apiRequest, null, 2))
    console.log("[v0] [Recharge Service] Making API call to:", API_BASE_URL)

    // Make API call with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequest),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] [Recharge Service] API response status:", response.status)
      console.log(
        "[v0] [Recharge Service] API response headers:",
        JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2),
      )

      const responseText = await response.text()
      console.log("[v0] [Recharge Service] API response text:", responseText)

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("[v0] [Recharge Service] Failed to parse response as JSON")
        responseData = { error: "Invalid JSON response", rawResponse: responseText.substring(0, 500) }
      }

      console.log("[v0] [Recharge Service] API response body:", JSON.stringify(responseData, null, 2))

      if (!response.ok) {
        console.error("[v0] [Recharge Service] ❌ API ERROR - Status:", response.status)
        console.error("[v0] [Recharge Service] ❌ API ERROR - Response:", responseData)

        // Handle specific error cases
        if (response.status === 429) {
          return {
            success: false,
            message: "API rate limit reached. Please wait 5-10 minutes or try a different operator/amount.",
            status: "rate_limited",
            timestamp: new Date().toISOString(),
          }
        }

        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            message: "API authentication failed. Please contact support.",
            status: "auth_error",
            timestamp: new Date().toISOString(),
          }
        }

        return {
          success: false,
          message: responseData.message || "Recharge failed. Please try again.",
          status: "failed",
          timestamp: new Date().toISOString(),
        }
      }

      // Success response
      console.log("[v0] [Recharge Service] ✅ RECHARGE SUCCESSFUL!")
      console.log("[v0] [Recharge Service] Transaction ID:", responseData.transactionId || transactionId)
      console.log("[v0] [Recharge Service] Operator Reference:", responseData.operatorReference)
      console.log("[v0] [Recharge Service] ========== RECHARGE REQUEST END ==========")

      return {
        success: true,
        transactionId: responseData.transactionId || transactionId,
        message: responseData.message || "Recharge successful! Your mobile will be recharged within 1-2 minutes.",
        status: "completed",
        timestamp: new Date().toISOString(),
        operatorReference: responseData.operatorReference,
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.error("[v0] [Recharge Service] API request timeout")
        return {
          success: false,
          message: "Request timeout. Please try again.",
          status: "timeout",
          timestamp: new Date().toISOString(),
        }
      }

      throw fetchError
    }
  } catch (error) {
    console.error("[v0] [Recharge Service] Recharge error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      status: "error",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Get available packages for an operator
 */
export async function getOperatorPackages(operator: string, type = "internet"): Promise<any[]> {
  try {
    // For development/testing without API key
    if (process.env.NODE_ENV === "development" && !API_KEY) {
      // Return mock data from our existing implementation
      const mockPackages = {
        Grameenphone: {
          internetPacks: [
            { id: "gp1", name: "1GB - 7 Days", price: 99, code: "*121*1*2#" },
            { id: "gp2", name: "2GB - 15 Days", price: 149, code: "*121*1*3#" },
            { id: "gp3", name: "5GB - 30 Days", price: 299, code: "*121*1*4#" },
          ],
          offers: [
            { id: "gpo1", name: "GP Happy Hour - 1GB", price: 19, description: "Valid 12AM-6AM", code: "*121*3020#" },
            { id: "gpo2", name: "GP Weekend - 3GB", price: 99, description: "Valid Fri-Sun", code: "*121*3021#" },
          ],
        },
        // Other operators...
      }

      const operatorData = mockPackages[operator as keyof typeof mockPackages]
      return type === "internet" ? operatorData?.internetPacks || [] : operatorData?.offers || []
    }

    // Real API implementation
    const response = await fetch(`${API_BASE_URL}/v1/packages?operator=${encodeURIComponent(operator)}&type=${type}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "X-App-Version": "1.0.0",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch packages")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching packages:", error)
    return []
  }
}

/**
 * Check recharge status
 */
export async function checkRechargeStatus(transactionId: string): Promise<RechargeResponse> {
  try {
    // For development/testing
    if (process.env.NODE_ENV === "development" && !API_KEY) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return {
        success: true,
        transactionId,
        message: "Recharge completed successfully (MOCK)",
        status: "completed",
        timestamp: new Date().toISOString(),
      }
    }

    // Real API implementation
    const response = await fetch(`${API_BASE_URL}/v1/recharge/status/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "X-App-Version": "1.0.0",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to check recharge status")
    }

    return await response.json()
  } catch (error) {
    console.error("Error checking recharge status:", error)
    throw error
  }
}

export const rechargeService = {
  processRecharge,
  getOperatorPackages,
  checkRechargeStatus,
}
