"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SavingsPage() {
  return (
    <main className="min-h-[100dvh] bg-[#f7f8fc] px-5 pb-8 pt-5 text-slate-900">
      <header className="flex items-center">
        <Link href="/" aria-label="শেবায় ফিরে যান" className="text-slate-700">
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
      </header>

      <section className="mt-7 rounded-2xl bg-white p-5 shadow-sm" aria-label="মোট সেভিংস">
        <p className="text-lg font-medium">মোট সেভিংস</p>
        <p className="mt-5 text-3xl font-semibold text-[#48b9ed]">0 ৳</p>
      </section>

      <Link
        href="/savings/create/name"
        className="mx-auto mt-8 flex min-h-10 w-[72%] items-center justify-center rounded-full bg-[#48b9ed] px-4 py-2 text-base font-semibold text-white shadow-sm transition-transform active:scale-[.98]"
      >
        সেভিংস চালু করুন
      </Link>
    </main>
  )
}
