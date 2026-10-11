"use client"

import Link from "next/link"
import { ArrowLeft, Coins, Landmark, Target, Users } from "lucide-react"

const savingOptions = [
  { title: "Single Saving", description: "Your personal savings journey starts here.", icon: Coins, color: "text-[#5146e5]", href: "/savings/create/name" },
  { title: "Target Savings", description: "Save with purpose, reach your target.", icon: Target, color: "text-[#c43d3d]", href: "/savings/create/name" },
  { title: "Group Savings", description: "Save together and reach your goals.", icon: Users, color: "text-[#d4a51c]", href: "/savings/create/name" },
]

export default function SavingsPage() {
  return (
    <main className="min-h-[100dvh] bg-[#f7f8fc] px-5 pb-8 pt-5 text-slate-900">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="Back to Sheba" className="text-slate-700">
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-[#5146e5]" /> Welcome</div>
      </header>

      <nav className="mt-7 flex gap-3" aria-label="Account sections">
        <div className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm text-slate-500"><Landmark className="h-4 w-4" /> Wallet</div>
        <div className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm text-slate-500"><Landmark className="h-4 w-4" /> Loan</div>
        <div className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5146e5] py-3 text-sm font-medium text-white"><Coins className="h-4 w-4" /> Savings</div>
      </nav>

      <div className="mx-auto mt-6 flex w-fit rounded-full bg-white p-1 shadow-sm">
        <span className="rounded-full bg-[#5146e5] px-5 py-2 text-sm font-medium text-white">Savings</span>
        <span className="px-5 py-2 text-sm text-slate-500">Active Savings</span>
      </div>

      <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm" aria-label="Total savings">
        <p className="text-lg font-medium">Total Savings</p>
        <p className="mt-5 text-3xl font-semibold text-[#168a4a]">৳0</p>
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
    </main>
  )
}
