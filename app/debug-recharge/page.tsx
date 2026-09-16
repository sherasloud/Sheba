"use client"

import { useState } from "react"

export default function DebugRechargePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testRecharge = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      console.log("[v0] Starting test recharge...")

      const testData = {
        phoneNumber: "01709783145",
        operator: "Grameenphone",
        type: "Prepaid",
        amount: 25,
        pin: "123456",
      }

      console.log("[v0] Test data:", testData)

      const response = await fetch("/api/recharge/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      console.log("[v0] Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Recharge failed")
      }

      setResult(data)
    } catch (err: any) {
      console.error("[v0] Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Recharge API Debug</h1>

        <button
          onClick={testRecharge}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Recharge API"}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
            <h2 className="font-bold text-red-800">Error:</h2>
            <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
            <h2 className="font-bold text-green-800">Success:</h2>
            <pre className="mt-2 text-sm text-green-700 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-bold text-blue-800 mb-2">Test Details:</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Phone: 01709783145</li>
            <li>• Operator: Grameenphone</li>
            <li>• Type: Prepaid</li>
            <li>• Amount: Tk 25</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-bold text-yellow-800 mb-2">Instructions:</h2>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Click "Test Recharge API" button</li>
            <li>Check the result on screen</li>
            <li>Open browser console (F12) for detailed logs</li>
            <li>Share the result with me</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
