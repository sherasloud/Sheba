"use client"

import Link from "next/link"

export default function SavingsPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-white">
      <img
        src="/images/savings-welcome.png"
        alt="Sheba savings welcome screen"
        className="absolute inset-0 h-full w-full object-contain object-top"
      />
      <Link
        href="/savings/create/name"
        aria-label="Start savings"
        className="absolute bottom-[8%] left-1/2 z-10 h-[7%] w-[52%] -translate-x-1/2 cursor-pointer rounded-full"
      />
    </main>
  )
}
