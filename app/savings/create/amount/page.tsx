"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SavingsAmountPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [savingsName, setSavingsName] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("savingsName")
    if (!name) {
      router.push("/savings/create/name")
      return
    }
    setSavingsName(name)
  }, [router])

  const handleNext = () => {
    if (amount && Number.parseFloat(amount) >= 100) {
      localStorage.setItem("savingsAmount", amount)
      router.push("/savings/create/duration")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#29a9eb] to-[#1e8bc3]">
      {/* Coin Stack Icon */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-12">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Blue%20Black%20Formal%20Minimalist%20Company%20Letterhead%20%2813%29-dKfdzBXHBluBx6iJ8ERpyNaRQHlHGt.png"
            alt="Coin Stack"
            width={160}
            height={160}
          />
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
          className="w-full px-6 py-4 text-center text-2xl font-bold bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-2xl border-2 border-white/30 focus:outline-none focus:border-white"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
          min="100"
        />
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleNext}
          disabled={!amount || Number.parseFloat(amount) < 100}
          className="w-full bg-white text-gray-900 py-5 rounded-full text-center text-2xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          {amount && Number.parseFloat(amount) >= 100 ? "সেভিংস করুন" : "ঠিক আছে"}
        </button>
      </div>
    </div>
  )
}
