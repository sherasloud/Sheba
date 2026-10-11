"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function SavingsPaymentPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("0")

  useEffect(() => {
    setAmount(localStorage.getItem("lastCreatedGoalAmount") || localStorage.getItem("savingsAmount") || "0")
  }, [])

  return (
    <main className="min-h-screen bg-white px-6 py-6 text-black">
      <button type="button" onClick={() => router.back()} aria-label="পেছনে যান" className="text-slate-700">
        <ArrowLeft className="h-6 w-6" />
      </button>
      <section className="flex min-h-[82vh] flex-col justify-center gap-12">
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("savingsPaymentType", "full")
            router.push("/savings/create/checkout")
          }}
          className="flex items-center justify-between text-left"
        >
          <span className="text-6xl font-light leading-none">Pay<br />Full</span>
          <span className="text-8xl font-light leading-none text-[#3aaef0]">{amount}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("savingsPaymentType", "monthly")
            router.push("/savings/create/checkout")
          }}
          className="flex items-center justify-between text-left"
        >
          <span className="text-6xl font-light leading-none">Pay<br />Monthly</span>
          <span className="text-8xl font-light leading-none text-[#3aaef0]">{amount}</span>
        </button>
      </section>
    </main>
  )
}
