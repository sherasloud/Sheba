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
            className="absolute inset-0 h-full w-full object-cover image-quality"
          />
          <div className="cat-sleep-overlay absolute bottom-[15%] left-1/2 z-10 h-7 w-11 -translate-x-1/2 rounded-[55%] bg-white shadow-sm" aria-hidden="true">
            <span className="cat-ear cat-ear-left" />
            <span className="cat-ear cat-ear-right" />
            <span className="cat-face">⌒ᴗ⌒</span>
          </div>
          <div className="car car-one absolute bottom-[22%] left-[-15%] z-10 h-24 w-36 rounded-md bg-[#ef6a5b] shadow-sm" aria-hidden="true">
            <span className="car-window" />
            <span className="car-wheel car-wheel-left" />
            <span className="car-wheel car-wheel-right" />
          </div>
          <div className="car car-two absolute bottom-[22%] left-[-15%] z-10 h-24 w-36 rounded-md bg-[#f3c45b] shadow-sm" aria-hidden="true">
            <span className="car-window car-window-small" />
            <span className="car-wheel car-wheel-left" />
            <span className="car-wheel car-wheel-right" />
          </div>
          <div className="cycle absolute bottom-[22%] left-[-28%] z-10 h-24 w-36" aria-hidden="true">
            <img
              src="/images/cyclist-rider.jpeg"
              alt=""
              className="h-full w-full object-contain mix-blend-multiply cyclist-image"
            />
          </div>
          <div className="wind wind-one absolute left-[-12%] top-[43%] h-px w-[58%] bg-white/80" />
          <div className="wind wind-two absolute right-[-10%] top-[28%] h-px w-[45%] bg-white/80" />
          <div className="wind wind-three absolute left-[10%] bottom-[24%] h-1 w-[34%] rounded-full bg-[#6da936]/60" />
          <div className="wind wind-four absolute right-[8%] bottom-[27%] h-1 w-[27%] rounded-full bg-[#6da936]/50" />
        </main>
      </div>
      {children}
      <style jsx global>{`
        .image-quality { image-rendering: auto; }
        .cat-sleep-overlay { animation: catSleep 7s ease-in forwards; }
        .cat-face { position: absolute; inset: 8px 0 auto; text-align: center; color: #607d8b; font-size: 10px; font-weight: 600; letter-spacing: -1px; opacity: .65; transform: rotate(8deg); }
        .cat-ear { position: absolute; top: -5px; width: 13px; height: 13px; background: white; transform: rotate(45deg); }
        .cat-ear-left { left: 5px; }
        .cat-ear-right { right: 5px; }
        .car-one { animation: drive 9s linear infinite; transform: scale(1.65); }
        .car-two { animation: drive 9s linear 2.2s infinite; transform: scale(1.5); }
        .cycle { animation: cycleDrive 9s linear 1.1s infinite; }
        .cyclist-image { filter: saturate(1.08) contrast(1.08); }
        .cycle-frame { position: absolute; left: 23px; top: 17px; width: 29px; height: 17px; border: 2px solid #245b8a; border-top: 0; transform: skewX(-18deg); }
        .cycle-rider { position: absolute; left: 28px; top: -28px; width: 34px; height: 58px; }
        .rider-head { position: absolute; left: 10px; top: 0; width: 17px; height: 17px; border-radius: 999px; background: #d98968; box-shadow: 3px -3px 0 #3f2d26; }
        .rider-body { position: absolute; left: 9px; top: 14px; width: 21px; height: 27px; border-radius: 10px 10px 5px 5px; background: #245b8a; transform: rotate(16deg); }
        .rider-arm { position: absolute; left: 24px; top: 19px; width: 22px; height: 5px; border-radius: 99px; background: #d98968; transform: rotate(28deg); transform-origin: left; }
        .rider-leg { position: absolute; left: 14px; top: 37px; width: 5px; height: 24px; border-radius: 99px; background: #334155; transform-origin: top; }
        .rider-leg-one { transform: rotate(35deg); }
        .rider-leg-two { transform: rotate(-35deg); }
        .cycle-wheel { position: absolute; bottom: 0; width: 18px; height: 18px; border: 2px solid #245b8a; border-radius: 999px; }
        .cycle-wheel-left { left: 8px; }
        .cycle-wheel-right { right: 8px; }
        .driver { animation: drive 9s linear 2.2s infinite; }
        .car-window { position: absolute; left: 15px; top: 3px; width: 14px; height: 7px; border-radius: 2px; background: #b9e2f5; }
        .car-wheel { position: absolute; bottom: -4px; width: 8px; height: 8px; border-radius: 999px; background: #334155; }
        .car-wheel-left { left: 7px; }
        .car-wheel-right { right: 7px; }
        .wind-one { animation: breezeOne 1.8s ease-in-out infinite; }
        .wind-two { animation: breezeTwo 2.2s ease-in-out infinite; }
        .wind-three { animation: grass 1.4s ease-in-out infinite alternate; }
        .wind-four { animation: grass 1.7s ease-in-out .3s infinite alternate; }
        @keyframes catSleep { 0%, 76% { transform: translateX(-50%) scale(.9); opacity: 1; } 88%, 100% { transform: translateX(-50%) translateY(-35px) scale(1.12); opacity: 0; } }
        @keyframes drive { from { transform: translateX(0); } to { transform: translateX(135vw); } }
        @keyframes cycleDrive { from { transform: translateX(0); } to { transform: translateX(145vw); } }
        @keyframes breezeOne { 0%, 100% { transform: translateX(0) rotate(-16deg); opacity: .2; } 50% { transform: translateX(42px) rotate(-10deg); opacity: .9; } }
        @keyframes breezeTwo { 0%, 100% { transform: translateX(0) rotate(-14deg); opacity: .2; } 50% { transform: translateX(-52px) rotate(-8deg); opacity: .85; } }
        @keyframes grass { from { transform: skewX(0); } to { transform: skewX(-8deg) translateX(8px); } }
        @media (prefers-reduced-motion: reduce) {
          .wind, .car-one, .car-two, .driver, .cycle, .cat-sleep-overlay { animation: none; }
        }
      `}</style>
    </>
  )
}
