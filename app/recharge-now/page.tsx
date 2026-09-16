"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RechargeNowPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRecharge(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const phone = formData.get("phone") as string
    const amount = formData.get("amount") as string
    const operator = formData.get("operator") as string
    const pin = formData.get("pin") as string

    console.log("[v0] Recharge attempt:", { phone, amount, operator })

    try {
      const response = await fetch("/api/recharge-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount, operator, pin }),
      })

      const data = await response.json()
      console.log("[v0] Recharge response:", data)

      if (data.success) {
        console.log("[v0] Recharge successful!")
        router.push("/payment-success")
      } else {
        setError(data.error || "Recharge failed")
      }
    } catch (err) {
      console.error("[v0] Recharge error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Mobile Recharge</h1>

        <form onSubmit={handleRecharge} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="01XXXXXXXXX"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Operator</label>
            <select
              name="operator"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Grameenphone">Grameenphone</option>
              <option value="Robi">Robi</option>
              <option value="Banglalink">Banglalink</option>
              <option value="Airtel">Airtel</option>
              <option value="Teletalk">Teletalk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount (Tk)</label>
            <input
              type="number"
              name="amount"
              required
              min="10"
              max="1000"
              placeholder="25"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">PIN</label>
            <input
              type="password"
              name="pin"
              required
              maxLength={6}
              placeholder="Enter 6-digit PIN"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Recharge Now"}
          </button>
        </form>
      </div>
    </div>
  )
}
