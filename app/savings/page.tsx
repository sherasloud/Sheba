"use client"

import Link from "next/link"
import { ArrowLeft, Coins, Target, Users } from "lucide-react"

const savingOptions = [
  { title: "একক সেভিংস", description: "আপনার নিজের সেভিংস যাত্রা শুরু করুন।", icon: Coins, color: "text-[#5146e5]", href: "/savings/create/name" },
  { title: "লক্ষ্য সেভিংস", description: "লক্ষ্য ঠিক করে ধীরে ধীরে সঞ্চয় করুন।", icon: Target, color: "text-[#c43d3d]", href: "/savings/create/name" },
  { title: "গ্রুপ সেভিংস", description: "একসাথে সঞ্চয় করে আপনার লক্ষ্য পূরণ করুন।", icon: Users, color: "text-[#48b9ed]", href: "/savings/create/name" },
]

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

      <section className="mt-5 grid grid-cols-2 gap-4" aria-label="Savings options">
        {savingOptions.map(({ title, description, icon: Icon, color, href }) => (
          <Link key={title} href={href} className="rounded-2xl bg-white p-4 shadow-sm transition-transform active:scale-[.98] last:col-span-2">
            <Icon className={`h-7 w-7 ${color}`} aria-hidden="true" />
            <h2 className={`mt-3 text-base font-medium ${color}`}>{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
          </Link>
        ))}
      </section>

      <Link
        href="/savings/create/name"
        className="mx-auto mt-5 flex min-h-10 w-[72%] items-center justify-center rounded-full bg-[#48b9ed] px-4 py-2 text-base font-semibold text-white shadow-sm transition-transform active:scale-[.98]"
      >
        সেভিংস চালু করুন
      </Link>
    </main>
  )
}
