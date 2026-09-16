"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function TollAmountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [routeName, setRouteName] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const name = searchParams.get("name") || "Toll Route"
    setRouteName(decodeURIComponent(name))
  }, [searchParams])

  const handleContinue = () => {
    setError("")
    if (!amount || Number(amount) === 0) {
      setError("Please enter toll amount")
      return
    }
    if (Number(amount) < 20) {
      setError("Minimum toll amount is 20 Tk")
      return
    }
    router.push(`/toll/review?route=${routeName}&amount=${amount}`)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center gap-3">
        <Link href="/toll">
          <ArrowLeft size={24} className="cursor-pointer" />
        </Link>
        <h1 className="text-xl font-bold">Toll Amount</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{routeName}</h2>
          <p className="text-gray-600">Enter toll amount</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {amount && (
          <div className="text-center mb-6 py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm mb-1">Toll Amount</p>
            <p className="text-4xl font-bold text-[#29a9eb]">৳ {Number(amount).toLocaleString()}</p>
          </div>
        )}

        {/* Number Keypad */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setAmount(amount + num.toString())}
                className="w-20 h-16 rounded-xl text-2xl font-bold text-[#29a9eb] bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAmount(amount + '0')}
            className="w-40 h-14 rounded-full text-2xl font-bold text-[#29a9eb] bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          >
            0
          </button>

          <button
            onClick={() => setAmount(amount.slice(0, -1))}
            className="w-40 h-12 rounded-lg text-sm font-medium text-white bg-[#FF6B6B] hover:bg-red-600 active:scale-95 transition-all"
          >
            Delete
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-8">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 active:scale-95 transition-all"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className={`flex-1 py-3 px-4 rounded-full font-medium text-white active:scale-95 transition-all ${
              amount && Number(amount) > 0
                ? 'bg-[#29a9eb] hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!amount || Number(amount) === 0}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
