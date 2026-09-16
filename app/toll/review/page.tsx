"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function TollReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [route, setRoute] = useState("")
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const r = searchParams.get("route") || ""
    const a = searchParams.get("amount") || "0"
    setRoute(decodeURIComponent(r))
    setAmount(a)
  }, [searchParams])

  const handlePay = async () => {
    setError("")
    if (pin.length !== 6) {
      setError("PIN must be 6 digits")
      return
    }

    setIsProcessing(true)
    try {
      // Simulate payment processing
      setTimeout(() => {
        // Record transaction
        const newTransaction = {
          type: "Toll",
          description: `${route} - Toll Payment`,
          amount: -Math.abs(Number(amount)),
          date: new Date().toLocaleString(),
        }

        // Add to localStorage
        const existing = localStorage.getItem("transactions")
        const transactions = existing ? JSON.parse(existing) : []
        transactions.unshift(newTransaction)
        localStorage.setItem("transactions", JSON.stringify(transactions))

        // Dispatch event for real-time update
        window.dispatchEvent(
          new CustomEvent("newTransaction", {
            detail: {
              type: "toll",
              amount: Number(amount),
              to: route,
            },
          })
        )

        setIsProcessing(false)
        router.push(`/toll/pin?route=${encodeURIComponent(route)}&amount=${amount}`)
      }, 1500)
    } catch (err) {
      setError("Payment failed. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center gap-3">
        <Link href="/toll/amount">
          <ArrowLeft size={24} className="cursor-pointer" />
        </Link>
        <h1 className="text-xl font-bold">Confirm Payment</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        {/* Review Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-3">Payment Details</h3>
          <div className="space-y-2 text-blue-700">
            <div className="flex justify-between">
              <span>Toll Route:</span>
              <span className="font-bold">{route}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-bold">৳ {Number(amount).toLocaleString()}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span>৳ {Number(amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* PIN Input */}
        <div className="mb-6 py-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 text-sm mb-3">Enter 6-digit PIN</p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-lg bg-[#29a9eb] flex items-center justify-center text-white font-bold"
              >
                {pin[i] ? "•" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Number Keypad */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => pin.length < 6 && setPin(pin + num.toString())}
                className="w-16 h-14 rounded-xl text-2xl font-bold text-[#29a9eb] bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
                disabled={pin.length >= 6}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => pin.length < 6 && setPin(pin + '0')}
            className="w-32 h-12 rounded-full text-xl font-bold text-[#29a9eb] bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
            disabled={pin.length >= 6}
          >
            0
          </button>

          <button
            onClick={() => setPin(pin.slice(0, -1))}
            className="w-32 h-10 rounded-lg text-sm font-medium text-white bg-[#FF6B6B] hover:bg-red-600 active:scale-95 transition-all"
          >
            Delete
          </button>
        </div>

        {/* Pay Button */}
        <div className="flex gap-2 mt-8">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 active:scale-95 transition-all disabled:opacity-50"
            disabled={isProcessing}
          >
            Back
          </button>
          <button
            onClick={handlePay}
            disabled={pin.length !== 6 || isProcessing}
            className="flex-1 py-3 px-4 bg-[#29a9eb] text-white rounded-full font-medium hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  )
}
