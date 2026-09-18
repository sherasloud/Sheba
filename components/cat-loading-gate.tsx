'use client'

import { useEffect, useState } from "react"

export function CatLoadingGate({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 9000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <div className={showIntro ? "fixed inset-0 z-[9999]" : "pointer-events-none fixed inset-0 z-[-1] opacity-0"}>
        <main className="cat-loading relative min-h-screen overflow-hidden bg-[#7fb0d6]" aria-label="Sheba intro">
          <img
            src="/images/cat-loading-scene.jpeg"
            alt="A sleeping cat resting in a green field beneath a blue sky"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="wind wind-one absolute left-[-12%] top-[43%] h-px w-[58%] bg-white/80" />
          <div className="wind wind-two absolute right-[-10%] top-[28%] h-px w-[45%] bg-white/80" />
          <div className="wind wind-three absolute left-[10%] bottom-[24%] h-1 w-[34%] rounded-full bg-[#6da936]/60" />
          <div className="wind wind-four absolute right-[8%] bottom-[27%] h-1 w-[27%] rounded-full bg-[#6da936]/50" />
        </main>
      </div>
      {children}
      <style jsx global>{`
        .wind-one { animation: breezeOne 3.6s ease-in-out infinite; }
        .wind-two { animation: breezeTwo 4.2s ease-in-out infinite; }
        .wind-three { animation: grass 2.8s ease-in-out infinite alternate; }
        .wind-four { animation: grass 3.4s ease-in-out .5s infinite alternate; }
        @keyframes breezeOne { 0%, 100% { transform: translateX(0) rotate(-16deg); opacity: .2; } 50% { transform: translateX(42px) rotate(-10deg); opacity: .9; } }
        @keyframes breezeTwo { 0%, 100% { transform: translateX(0) rotate(-14deg); opacity: .2; } 50% { transform: translateX(-52px) rotate(-8deg); opacity: .85; } }
        @keyframes grass { from { transform: skewX(0); } to { transform: skewX(-8deg) translateX(8px); } }
        @media (prefers-reduced-motion: reduce) { .wind { animation: none; } }
      `}</style>
    </>
  )
}
