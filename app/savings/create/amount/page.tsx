"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SavingsAmountPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [savingsName, setSavingsName] = useState("")

  useEffect(() => {
    setSavingsName(localStorage.getItem("savingsName") || "Savings")
  }, [])

  const handleNext = () => {
    if (amount && Number.parseFloat(amount) >= 100) {
      localStorage.setItem("savingsAmount", amount)
      localStorage.setItem("savingsName", savingsName || "Savings")
      localStorage.setItem("savingsMonths", "1")
      router.push("/savings/create/pin")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Coin Stack Icon */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-12">
          <div className="text-center text-[#3aaef0]">
            <div className="text-7xl font-light tracking-tight">Savings</div>
            <div className="mt-12 text-7xl font-light">{amount || "৬০০"} <span className="text-5xl">৳</span></div>
          </div>
        </div>

        {/* Main Text */}
        <h1
          className="text-white text-5xl font-bold text-center mb-12 leading-tight"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          টাকার পরিমাণ
          <br />
          লিখুন
        </h1>

        {/* Amount Input (hidden but functional) */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="১০০"
          className="w-full rounded-2xl border-2 border-[#3aaef0]/30 bg-white px-6 py-4 text-center text-2xl font-bold text-[#3aaef0] placeholder-[#3aaef0]/50 focus:border-[#3aaef0] focus:outline-none"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
          min="100"
        />
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleNext}
          disabled={!amount || Number.parseFloat(amount) < 100}
          className="w-full rounded-full bg-[#3aaef0] py-5 text-center text-2xl font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          {amount && Number.parseFloat(amount) >= 100 ? "সেভিংস করুন" : "ঠিক আছে"}
        </button>
      </div>
    </div>
  )
}
