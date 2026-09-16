"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SavingsDurationPage() {
  const router = useRouter()
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null)
  const [savingsName, setSavingsName] = useState("")
  const [savingsAmount, setSavingsAmount] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("savingsName")
    const amount = localStorage.getItem("savingsAmount")
    if (!name || !amount) {
      router.push("/savings/create/name")
      return
    }
    setSavingsName(name)
    setSavingsAmount(amount)
  }, [router])

  const handleNext = () => {
    if (selectedMonths) {
      localStorage.setItem("savingsMonths", selectedMonths.toString())
      router.push("/savings/create/pin")
    }
  }

  const durations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  const monthlyAmount =
    selectedMonths && savingsAmount ? Math.ceil(Number.parseFloat(savingsAmount) / selectedMonths) : 0

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#29a9eb] to-[#1e8bc3]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Main Text */}
        <h1
          className="text-white text-5xl font-bold text-center mb-12 leading-tight"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          মাস নির্বাচন করুন
        </h1>

        {/* Month Selection Grid */}
        <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-8">
          {durations.map((months) => (
            <button
              key={months}
              onClick={() => setSelectedMonths(months)}
              className={`py-4 rounded-2xl text-xl font-bold transition-all ${
                selectedMonths === months
                  ? "bg-white text-[#29a9eb] shadow-lg scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
            >
              {months}
            </button>
          ))}
        </div>

        {/* Selected Info */}
        {selectedMonths && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
            <p className="text-white/80 text-sm mb-1" style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}>
              মাসিক সেভিংস
            </p>
            <p className="text-white text-2xl font-bold">৳{monthlyAmount.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleNext}
          disabled={!selectedMonths}
          className="w-full bg-white text-gray-900 py-5 rounded-full text-center text-2xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Done
        </button>
      </div>
    </div>
  )
}
