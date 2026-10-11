"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SavingsAmountPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [savingsName, setSavingsName] = useState("")
  const [balance, setBalance] = useState(0)

  useEffect(() => {
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Coin Stack Icon */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-12">
          <div className="text-center text-[#3aaef0]">
            <div className="text-7xl font-light tracking-tight">Savings</div>
            <div className="mt-6 text-2xl font-medium">কত টাকা সেভিংস করবেন?</div>
            <label className="mt-6 block text-7xl font-light" htmlFor="savings-amount">
              <span className="sr-only">কত টাকা সেভিংস করবেন?</span>
              <input
                id="savings-amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="০"
                className="w-full border-0 bg-transparent p-0 text-center text-7xl font-light text-[#3aaef0] placeholder-[#3aaef0]/50 outline-none focus:ring-0"
                style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
                min="100"
                max={balance}
                aria-label="সেভিংসের পরিমাণ"
              />
            </label>
            <div className="mt-4 text-base font-medium text-[#3aaef0]/70">বর্তমান ব্যালেন্স: {balance.toLocaleString("bn-BD")} ৳</div>
          </div>
        </div>

        <p className="mb-6 text-center text-2xl font-medium text-[#3aaef0]" style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}>
          টাকার পরিমাণ লিখুন
        </p>
        {amount && Number.parseFloat(amount) > balance ? (
          <p className="mt-2 text-center text-sm font-medium text-red-500">আপনার ব্যালেন্সের বেশি টাকা রাখা যাবে না</p>
        ) : null}
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleNext}
          disabled={!amount || Number.parseFloat(amount) < 100 || Number.parseFloat(amount) > balance}
          className="w-full rounded-full bg-[#3aaef0] py-5 text-center text-2xl font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          {amount && Number.parseFloat(amount) >= 100 ? "সেভিংস করুন" : "ঠিক আছে"}
        </button>
      </div>
    </div>
  )
}
