"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SavingsPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-white">
      <img
        src="/images/savings-welcome.png"
        alt="Sheba savings welcome screen"
        className="pointer-events-none absolute inset-0 h-full w-full object-contain object-top"
      />
      <Link
        href="/"
        aria-label="Back to Sheba"
        className="absolute left-4 top-4 z-20 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </Link>
      <Link
        href="/savings/create/name"
        aria-label="Start savings"
        className="absolute bottom-[18%] left-1/2 z-20 flex min-h-12 w-[72%] -translate-x-1/2 items-center justify-center rounded-full bg-[#3aaef0] px-6 py-3 text-xl font-semibold text-white shadow-lg transition-transform active:scale-95 touch-manipulation"
      >
        সামনে যাই
      </Link>
    </main>
  )
}
