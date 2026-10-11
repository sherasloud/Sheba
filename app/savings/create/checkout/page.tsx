"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"

export default function SavingsCheckoutPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState(0)
  const [months, setMonths] = useState(12)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const savedAmount = Number(localStorage.getItem("savingsAmount") || 0)
    const savedMonths = Number(localStorage.getItem("savingsMonths") || 12)
    const user = JSON.parse(localStorage.getItem("userData") || "{}")
    setAmount(savedAmount)
    setMonths(savedMonths)
    setBalance(Number(user.balance ?? localStorage.getItem("userBalance") ?? 0))
  }, [])

  const monthlyAmount = useMemo(() => Math.ceil(amount / months), [amount, months])
  const canPayFirstMonth = balance >= monthlyAmount

  const handleCheckout = async () => {
    if (!checked || !canPayFirstMonth || isSubmitting) return

    const user = JSON.parse(localStorage.getItem("userData") || "{}")
    const phoneNumber = user.phoneNumber || user.phone || localStorage.getItem("phoneNumber")

    setIsSubmitting(true)
    setError("")
    const nextBalance = balance - monthlyAmount
    const nextSavingsBalance = Number(localStorage.getItem("savingsBalance") || 0) + monthlyAmount

    try {
      if (phoneNumber) {
        const response = await fetch("/api/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, balance: nextBalance }),
        })
        if (!response.ok) throw new Error("balance update failed")
      }

      const now = new Date()
    const goal = {
      id: `GOAL_${Date.now()}`,
      name: localStorage.getItem("savingsName") || "Savings",
      targetAmount: amount,
      currentAmount: monthlyAmount,
      duration: months,
      monthlyAmount,
      createdAt: now.toISOString(),
      maturityDate: new Date(now.setMonth(now.getMonth() + months)).toISOString(),
      status: "active",
      paymentType: "monthly",
    }
    const goals = JSON.parse(localStorage.getItem("savingsGoals") || "[]")
    localStorage.setItem("savingsGoals", JSON.stringify([goal, ...goals]))
    localStorage.setItem("userBalance", String(nextBalance))
    localStorage.setItem("savingsBalance", String(nextSavingsBalance))
    localStorage.setItem("userData", JSON.stringify({ ...user, balance: nextBalance, savingsBalance: nextSavingsBalance }))
    localStorage.setItem("lastCreatedGoal", JSON.stringify(goal))
    localStorage.removeItem("savingsName")
    localStorage.removeItem("savingsAmount")
    localStorage.removeItem("savingsMonths")
    localStorage.removeItem("savingsPinVerified")
    router.push("/savings/create/success")
    } catch {
      setError("টাকা কাটা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-6 text-[#3aaef0]">
      <button type="button" onClick={() => router.back()} aria-label="পেছনে যান" className="mb-8 bg-transparent p-0">
        <ArrowLeft className="h-6 w-6" />
      </button>
      <section className="mx-auto max-w-sm">
        <h1 className="text-4xl font-light">Savings</h1>
        <p className="mt-10 text-xl">Checkout</p>
        <div className="mt-8 space-y-4 text-lg">
          <div className="flex justify-between"><span>মোট সেভিংস</span><strong>{amount.toLocaleString("bn-BD")} ৳</strong></div>
          <div className="flex justify-between"><span>সময়</span><strong>{months} মাস</strong></div>
          <div className="flex justify-between"><span>এই মাসে জমা</span><strong>{monthlyAmount.toLocaleString("bn-BD")} ৳</strong></div>
          <div className="flex justify-between"><span>বর্তমান ব্যালেন্স</span><strong>{balance.toLocaleString("bn-BD")} ৳</strong></div>
        </div>
        {!canPayFirstMonth && <p className="mt-5 text-sm text-red-500">প্রথম মাসের {monthlyAmount.toLocaleString("bn-BD")} টাকা জমা দেওয়ার মতো ব্যালেন্স নেই।</p>}
        {error && <p className="mt-5 text-sm text-red-500">{error}</p>}
        <label className="mt-8 flex cursor-pointer items-center gap-3 text-lg">
          <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="sr-only" />
          <span className={`flex h-7 w-7 items-center justify-center border-2 ${checked ? "border-[#3aaef0] bg-[#3aaef0] text-white" : "border-[#3aaef0]"}`} aria-hidden="true">{checked && <Check className="h-5 w-5" />}</span>
          <span>আমি এই Savings চালু করতে চাই</span>
        </label>
        <button type="button" onClick={handleCheckout} disabled={!checked || !canPayFirstMonth || isSubmitting} className="mt-10 w-full rounded-full bg-[#3aaef0] px-4 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Processing..." : "Confirm Savings"}</button>
      </section>
    </main>
  )
}
