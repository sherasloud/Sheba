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
      localStorage.setItem("savingsMonths", "12")
      router.push("/savings/create/pin")
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="পেছনে যান"
        className="absolute left-4 top-2 z-10 flex min-h-11 min-w-11 items-center justify-center text-slate-700"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Coin Stack Icon */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-12">
            <div className="text-center text-[#3aaef0]">
            <div className="text-5xl font-light tracking-tight">Savings</div>
            <label className="relative mt-24 block h-48 w-[290px] max-w-full text-7xl font-light" htmlFor="savings-amount">
              <span className="sr-only">কত টাকা সেভিংস করবেন?</span>
              <div
                aria-hidden="true"
                className="pointer-events-none h-48 w-[290px] max-w-full whitespace-nowrap text-center font-light leading-none text-[#3aaef0]"
                style={{ fontFamily: "Noto Sans Bengali, sans-serif", fontSize: "72px", lineHeight: 0.95 }}
              >
                {amount || "০"} ৳
              </div>
              <input
                id="savings-amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="০"
                className="absolute inset-0 h-48 w-[290px] max-w-full opacity-0 outline-none"
                style={{ fontSize: "48px" }}
                min="100"
                max={mounted ? Math.min(balance, 200000) : 200000}
                aria-label="সেভিংসের পরিমাণ"
              />
            </label>
            <div className="mt-4 text-base font-medium text-[#3aaef0]/70">বর্তমান ব্যালেন্স: {mounted ? balance.toLocaleString("bn-BD") : "০"} ৳</div>
            {mounted && amount && Number.isFinite(Number(amount)) && Number(amount) > 200000 ? (
              <p className="mt-2 text-center text-sm font-medium text-red-500">সর্বোচ্চ ২০০,০০০ টাকা সেভিংস করা যাবে</p>
            ) : mounted && amount && Number.isFinite(Number(amount)) && Number(amount) > balance ? (
              <p className="mt-2 text-center text-sm font-medium text-red-500">আপনার ব্যালেন্সের বেশি টাকা সেভিংস করা যাবে না</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="relative -top-16 px-6 pb-6">
        <button
          onClick={handleNext}
          disabled={!mounted || !amount || !Number.isFinite(Number(amount)) || Number(amount) < 100 || Number(amount) > 200000 || Number(amount) > balance}
          className="w-full rounded-full bg-[#3aaef0] px-4 py-2 text-center text-lg font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          {amount && Number.parseFloat(amount) >= 100 ? "সেভিংস করুন" : "ঠিক আছে"}
        </button>
      </div>
    </div>
  )
}
