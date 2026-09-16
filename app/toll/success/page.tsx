"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function TollSuccessPage() {
  const searchParams = useSearchParams()
  const [route, setRoute] = useState("")
  const [amount, setAmount] = useState("")

  useEffect(() => {
    const r = searchParams.get("route") || ""
    const a = searchParams.get("amount") || "0"
    setRoute(decodeURIComponent(r))
    setAmount(a)
  }, [searchParams])

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 text-center">
        <h1 className="text-xl font-bold">Payment Successful</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle size={80} className="text-green-500" />
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Toll Paid Successfully!</h2>
        <p className="text-gray-600 text-center mb-8">Your toll payment has been processed.</p>

        {/* Receipt */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 w-full mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Payment Receipt</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Toll Route:</span>
              <span className="font-semibold">{route}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="font-semibold">৳ {Number(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span className="font-semibold">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-semibold text-xs">TL{Date.now()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Link href="/inbox">
            <button className="w-full py-3 px-4 bg-[#29a9eb] text-white rounded-full font-medium hover:bg-blue-600 active:scale-95 transition-all">
              View Transactions
            </button>
          </Link>
          <Link href="/home">
            <button className="w-full py-3 px-4 bg-gray-300 text-gray-800 rounded-full font-medium hover:bg-gray-400 active:scale-95 transition-all">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
