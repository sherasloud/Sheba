"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SavingsBalancePage() {
  const router = useRouter()
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    setAmount(Number(localStorage.getItem("savingsAmount") || localStorage.getItem("lastCreatedGoalAmount") || 0))
  }, [])

  return (
    <main className="min-h-screen bg-white px-6 py-6 text-[#3aaef0]">
      <button type="button" onClick={() => router.back()} aria-label="পেছনে যান" className="text-slate-700">
        <ArrowLeft className="h-6 w-6" />
      </button>
      <section className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <p className="text-2xl font-light">Savings Balance</p>
        <p className="mt-8 text-8xl font-light">{amount.toLocaleString("en-US")} <span className="text-5xl">৳</span></p>
        <button type="button" onClick={() => router.push("/savings/create/payment")} className="mt-20 w-full max-w-xs rounded-full bg-[#3aaef0] px-4 py-3 text-lg font-semibold text-white">Continue</button>
      </section>
    </main>
  )
}
