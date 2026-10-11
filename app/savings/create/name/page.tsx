"use client"

import Link from "next/link"
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
        className="absolute left-4 top-2 z-10 flex min-h-11 min-w-11 items-center justify-center text-slate-700"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <img
        src="/images/savings-coupon.png"
        alt="Savings coupon"
        className="-translate-y-12 block min-h-screen w-full object-cover object-center"
      />
      <Link
        href="/savings/create/amount"
        className="absolute bottom-16 left-1/2 z-10 flex min-h-10 w-[62%] -translate-x-1/2 items-center justify-center rounded-full bg-[#3aaef0] px-4 py-2 text-lg font-semibold text-white shadow-lg transition-transform active:scale-95 touch-manipulation"
      >
        সামনে যাই
      </Link>
    </main>
  )
}
