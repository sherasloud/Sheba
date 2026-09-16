"use server"

export async function diagnoseAPI() {
  const apiUrl =
    process.env.NEXT_PUBLIC_RECHARGE_API_URL || process.env.RECHARGE_API_URL || "https://irechargebd.com/api/request"
  const apiKey = process.env.RECHARGE_API_KEY

  console.log("[v0] Diagnosing API configuration...")
  console.log("[v0] API URL:", apiUrl)
  console.log("[v0] API Key exists:", !!apiKey)
  console.log("[v0] API Key (first 10 chars):", apiKey?.substring(0, 10))

  const diagnostics = {
    apiUrl: apiUrl,
    apiKeyExists: !!apiKey,
    apiKeyPreview: apiKey ? apiKey.substring(0, 10) + "..." : "NOT SET",
    testResults: [] as Array<{ test: string; result: string; details?: string }>,
  }

  diagnostics.testResults.push({
    test: "API URL Configuration",
    result: "PASSED",
    details: `API URL is set to: ${apiUrl}`,
  })

  // Test 2: Check if API Key is set
  if (!apiKey) {
    diagnostics.testResults.push({
      test: "API Key Configuration",
      result: "FAILED",
      details: "RECHARGE_API_KEY environment variable is not set",
    })
    return diagnostics
  }

  diagnostics.testResults.push({
    test: "API Key Configuration",
    result: "PASSED",
    details: `API Key is set (${apiKey.length} characters)`,
  })

  // Test 3: Try to reach the API endpoint
  try {
    console.log("[v0] Testing API endpoint accessibility...")
    const testUrl = `${apiUrl}`

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    console.log("[v0] API response status:", response.status)
    console.log("[v0] API response headers:", Object.fromEntries(response.headers.entries()))

    const contentType = response.headers.get("content-type")
    let responseText = ""

    try {
      responseText = await response.text()
      console.log("[v0] API response body (first 500 chars):", responseText.substring(0, 500))
    } catch (e) {
      console.error("[v0] Error reading response body:", e)
    }

    if (contentType?.includes("application/json")) {
      diagnostics.testResults.push({
        test: "API Endpoint Accessibility",
        result: "PASSED",
        details: `API returned JSON response with status ${response.status}`,
      })
    } else if (contentType?.includes("text/html")) {
      diagnostics.testResults.push({
        test: "API Endpoint Accessibility",
        result: "FAILED",
        details: `API returned HTML instead of JSON (status ${response.status}). This usually means the URL is wrong or the endpoint doesn't exist. Response preview: ${responseText.substring(0, 200)}`,
      })
    } else {
      diagnostics.testResults.push({
        test: "API Endpoint Accessibility",
        result: "WARNING",
        details: `API returned unexpected content type: ${contentType} (status ${response.status})`,
      })
    }
  } catch (error: any) {
    console.error("[v0] Error testing API endpoint:", error)
    diagnostics.testResults.push({
      test: "API Endpoint Accessibility",
      result: "FAILED",
      details: `Failed to reach API: ${error.message}`,
    })
  }

  // Test 4: Try a test recharge request
  try {
    console.log("[v0] Testing recharge API call...")
    const testRechargeUrl = `${apiUrl}`

    const requestBody = {
      service: "bdrecharge",
      number: "01700000000",
      amount: "10",
      operator: "GP", // Updated to use correct operator code
      type: "prepaid",
      user: "test_user",
      api_key: apiKey,
    }

    console.log("[v0] Test recharge request body:", requestBody)

    const response = await fetch(testRechargeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Test recharge response status:", response.status)

    const responseText = await response.text()
    console.log("[v0] Test recharge response body:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
      diagnostics.testResults.push({
        test: "Test Recharge Request",
        result: response.ok ? "PASSED" : "FAILED",
        details: `API responded with: ${JSON.stringify(responseData, null, 2)}`,
      })
    } catch (e) {
      diagnostics.testResults.push({
        test: "Test Recharge Request",
        result: "FAILED",
        details: `API returned non-JSON response: ${responseText.substring(0, 300)}`,
      })
    }
  } catch (error: any) {
    console.error("[v0] Error testing recharge request:", error)
    diagnostics.testResults.push({
      test: "Test Recharge Request",
      result: "FAILED",
      details: `Failed to make test recharge: ${error.message}`,
    })
  }

  return diagnostics
}
