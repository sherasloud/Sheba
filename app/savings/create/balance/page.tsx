"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SavingsBalancePage() {
  const router = useRouter()
  const [amount, setAmount] = useState(0)
  const [nextPaymentDate, setNextPaymentDate] = useState("")

  useEffect(() => {
    const goal = JSON.parse(localStorage.getItem("lastCreatedGoal") || "null")
    setAmount(Number(goal?.targetAmount || goal?.amount || localStorage.getItem("savingsAmount") || localStorage.getItem("lastCreatedGoalAmount") || 0))
    setNextPaymentDate(goal?.maturityDate ? new Date(goal.maturityDate).toLocaleDateString("bn-BD") : "")
  }, [])

  return (
    <main className="min-h-screen bg-white px-6 py-6 text-[#3aaef0]">
      <button type="button" onClick={() => router.back()} aria-label="পেছনে যান" className="text-slate-700">
        <ArrowLeft className="h-6 w-6" />
      </button>
      <section className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <p className="text-2xl font-light">Savings Balance</p>
        <p className="mt-8 text-8xl font-light">{amount.toLocaleString("en-US")} <span className="text-5xl">৳</span></p>
        <div className="mt-16 space-y-3 text-center">
          <p className="text-4xl font-light">Next Deal</p>
          <p className="text-xl">পরবর্তী পেমেন্টের তারিখ: {nextPaymentDate || "নির্ধারিত হবে"}</p>
          <p className="mx-auto max-w-xs text-base leading-7">নির্দিষ্ট সময়সীমা শেষ হলে আপনার পুরো টাকা আপনার অ্যাকাউন্টে চলে যাবে।</p>
        </div>
        <button type="button" onClick={() => router.push("/savings/create/payment")} className="mt-12 w-full max-w-xs rounded-full bg-[#3aaef0] px-4 py-3 text-lg font-semibold text-white">Continue</button>
      </section>
    </main>
  )
}
