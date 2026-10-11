"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function SavingsNamePage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen bg-white">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="absolute left-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <img
        src="/images/savings-coupon.png"
        alt="Savings coupon"
        className="block min-h-screen w-full object-cover object-center"
      />
    </main>
  )
}
