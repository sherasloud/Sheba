"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { testRechargeAPI } from "@/app/actions/test-recharge"

export default function APITestPage() {
  const [phoneNumber, setPhoneNumber] = useState("01709783145")
  const [operator, setOperator] = useState("Grameenphone")
  const [amount, setAmount] = useState("25")
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [error, setError] = useState("")

  const handleTestAPI = async () => {
    setIsLoading(true)
    setError("")
    setApiResponse(null)

    try {
      console.log("[v0] Calling server action to test API...")
      const result = await testRechargeAPI(phoneNumber, operator, amount)
      console.log("[v0] Server action result:", result)

      if (result.error) {
        setError(result.error)
      }

      setApiResponse(result)
    } catch (err: any) {
      console.error("[v0] Error calling server action:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">API Test</div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="text-2xl font-bold mb-6">Test Recharge API (Server-Side)</div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block mb-2 font-medium">Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded-xl p-3 bg-gray-50"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={11}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Operator</label>
            <select
              className="w-full border rounded-xl p-3 bg-gray-50"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              <option>Grameenphone</option>
              <option>Robi</option>
              <option>Banglalink</option>
              <option>Airtel</option>
              <option>Teletalk</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Amount (Tk)</label>
            <input
              type="number"
              className="w-full border rounded-xl p-3 bg-gray-50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleTestAPI}
          disabled={isLoading}
          className="bg-[#29a9eb] text-white p-4 rounded-xl font-medium disabled:opacity-50 mb-6"
        >
          {isLoading ? "Testing API..." : "Test Recharge API"}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="font-bold text-red-700 mb-2">Error</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {apiResponse && (
          <div className="bg-gray-50 rounded-xl p-4 overflow-auto">
            <div className="font-bold mb-4 text-lg">API Response</div>

            <div className="space-y-4">
              <div>
                <div className="font-semibold text-sm text-gray-600 mb-1">Request URL</div>
                <div className="bg-white p-2 rounded text-xs break-all">{apiResponse.apiUrl}</div>
              </div>

              <div>
                <div className="font-semibold text-sm text-gray-600 mb-1">API Key Info</div>
                <div className="bg-white p-2 rounded text-xs">
                  Length: {apiResponse.apiKeyLength} | Preview: {apiResponse.apiKeyPreview}
                </div>
              </div>

              <div>
                <div className="font-semibold text-sm text-gray-600 mb-1">Request Body</div>
                <pre className="bg-white p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(apiResponse.requestBody, null, 2)}
                </pre>
              </div>

              <div>
                <div className="font-semibold text-sm text-gray-600 mb-1">Response Status</div>
                <div className="bg-white p-2 rounded text-xs">
                  {apiResponse.status} {apiResponse.statusText} {apiResponse.success ? "✅" : "❌"}
                </div>
              </div>

              <div>
                <div className="font-semibold text-sm text-gray-600 mb-1">Response Data</div>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(apiResponse.data, null, 2)}
                </pre>
              </div>

              {apiResponse.error && (
                <div>
                  <div className="font-semibold text-sm text-gray-600 mb-1">Error Details</div>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
