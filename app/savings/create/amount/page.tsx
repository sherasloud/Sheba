"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function SavingsAmountPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [savingsName, setSavingsName] = useState("")
  const [balance, setBalance] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const phone = localStorage.getItem("phoneNumber")
    const storedUser = localStorage.getItem("userData")
    const storedBalance = storedUser ? Number(JSON.parse(storedUser).balance) : 0
    setBalance(Number.isFinite(storedBalance) ? storedBalance : 0)
    setSavingsName(localStorage.getItem("savingsName") || "Savings")

    if (phone) {
      fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
        cache: "no-store",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.user) setBalance(Number(data.user.balance) || 0)
        })
        .catch(() => undefined)
    }
  }, [])

  const handleNext = () => {
    if (amount && Number.parseFloat(amount) >= 100 && Number.parseFloat(amount) <= balance) {
      localStorage.setItem("savingsAmount", amount)
      localStorage.setItem("savingsName", savingsName || "Savings")
      localStorage.setItem("savingsMonths", "1")
      router.push("/savings/create/pin")
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="পেছনে যান"
        className="absolute left-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Coin Stack Icon */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-12">
            <div className="text-center text-[#3aaef0]">
            <div className="text-5xl font-light tracking-tight">Savings</div>
            <label className="mt-6 block w-full text-7xl font-light" htmlFor="savings-amount">
              <span className="sr-only">কত টাকা সেভিংস করবেন?</span>
              <input
                id="savings-amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="০"
                className="amount-display block h-52 w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-center font-light leading-none text-[#3aaef0] placeholder-[#3aaef0]/50 outline-none focus:ring-0"
                style={{ fontFamily: "Noto Sans Bengali, sans-serif", fontSize: "120px", lineHeight: 1.05, transform: "scale(1.15)" }}
                min="100"
                max={mounted ? balance : undefined}
                aria-label="সেভিংসের পরিমাণ"
              />
            </label>
            <div className="mt-4 text-base font-medium text-[#3aaef0]/70">বর্তমান ব্যালেন্স: {mounted ? balance.toLocaleString("bn-BD") : "০"} ৳</div>
          </div>
        </div>

        {amount && Number.parseFloat(amount) > balance ? (
          <p className="mt-2 text-center text-sm font-medium text-red-500">আপনার ব্যালেন্সের বেশি টাকা রাখা যাবে না</p>
        ) : null}
      </div>

      {/* Bottom Button */}
      <div className="-mt-8 px-6 pb-6">
        <button
          onClick={handleNext}
          disabled={!amount || Number.parseFloat(amount) < 100 || Number.parseFloat(amount) > balance}
          className="w-full py-2 text-center text-lg font-semibold text-[#3aaef0] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          {amount && Number.parseFloat(amount) >= 100 ? "সেভিংস করুন" : "ঠিক আছে"}
        </button>
      </div>
    </div>
  )
}
