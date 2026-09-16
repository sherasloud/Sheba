"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"

export default function SimpleRechargePage() {
  const router = useRouter()
  const [phone, setPhone] = useState("01709783145")
  const [amount, setAmount] = useState("25")
  const [operator, setOperator] = useState("Grameenphone")
  const [type, setType] = useState("Prepaid")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleRecharge = async () => {
    if (!pin || pin.length !== 6) {
      setError("Please enter 6-digit PIN")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Starting recharge:", { phone, amount, operator, type })

      const response = await fetch("/api/recharge/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phone, // Changed from 'phone' to 'phoneNumber'
          amount: Number.parseInt(amount),
          operator,
          accountType: type.toLowerCase(), // Changed from 'type' to 'accountType' and lowercase
          pin,
        }),
      })

      console.log("[v0] Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (response.ok && data.success) {
        setSuccess(`Recharge successful! Transaction ID: ${data.transactionId || "N/A"}`)
        setTimeout(() => {
          router.push("/payment-success")
        }, 2000)
      } else {
        setError(data.error || "Recharge failed. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Recharge error:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Simple Recharge</h1>
      </div>

      {/* Content */}
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Mobile Recharge</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option>Grameenphone</option>
                <option>Robi</option>
                <option>Banglalink</option>
                <option>Airtel</option>
                <option>Teletalk</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded-md">
                <option>Prepaid</option>
                <option>Postpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Tk)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit PIN</label>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 6))}
                placeholder="Enter PIN"
                maxLength={6}
                className="w-full"
              />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">{error}</div>}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">{success}</div>
            )}

            <Button
              onClick={handleRecharge}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg"
            >
              {loading ? "Processing..." : "Confirm Recharge"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
