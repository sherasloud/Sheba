"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function SavingsPaymentPage() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-white px-6 py-6 text-[#3aaef0]">
      <button type="button" onClick={() => router.back()} aria-label="পেছনে যান" className="text-slate-700"><ArrowLeft className="h-6 w-6" /></button>
      <section className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-light">Savings</h1>
        <p className="mt-12 text-2xl font-medium">Full payment / 1 time payment</p>
        <p className="mt-4 text-base text-[#3aaef0]/70">একবারে সম্পূর্ণ Savings payment করুন</p>
        <button type="button" onClick={() => router.push("/savings/create/checkout")} className="mt-16 w-full max-w-xs rounded-full bg-[#3aaef0] px-4 py-3 text-lg font-semibold text-white">Checkout</button>
      </section>
    </main>
  )
}
