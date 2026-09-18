export default function Loading() {
  return (
    <main className="cat-loading relative min-h-screen overflow-hidden bg-[#7fb0d6]" aria-label="Loading Sheba">
      <img
        src="/images/cat-loading-scene.jpeg"
        alt="A sleeping cat resting in a green field beneath a blue sky"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="wind wind-one absolute left-[-12%] top-[43%] h-px w-[58%] bg-white/80" />
      <div className="wind wind-two absolute right-[-10%] top-[28%] h-px w-[45%] bg-white/80" />
      <div className="wind wind-three absolute left-[10%] bottom-[24%] h-1 w-[34%] rounded-full bg-[#6da936]/60" />
      <div className="wind wind-four absolute right-[8%] bottom-[27%] h-1 w-[27%] rounded-full bg-[#6da936]/50" />

      <div className="cat-rest absolute bottom-[15%] left-1/2 h-12 w-20 -translate-x-1/2 rounded-[50%] bg-white/10 blur-[2px]" />
      <div className="cat-awake absolute bottom-[15%] left-1/2 -translate-x-1/2 text-3xl opacity-0" aria-hidden="true">
        ^•ﻌ•^
      </div>

      <div className="absolute inset-x-0 bottom-[7%] text-center text-sm font-medium tracking-wide text-white/90 drop-shadow">
        Loading...
      </div>

      <style>{`
        .wind-one { animation: breezeOne 3.2s ease-in-out infinite; }
        .wind-two { animation: breezeTwo 4s ease-in-out infinite; }
        .wind-three { animation: grass 2.4s ease-in-out infinite alternate; }
        .wind-four { animation: grass 3s ease-in-out .5s infinite alternate; }
        .cat-rest { animation: catSleep 3.8s ease-in-out forwards; }
        .cat-awake { animation: catWake 4s ease-in-out 3.2s forwards; }
        @keyframes breezeOne { 0%, 100% { transform: translateX(0) rotate(-16deg); opacity: .25; } 50% { transform: translateX(35px) rotate(-10deg); opacity: .9; } }
        @keyframes breezeTwo { 0%, 100% { transform: translateX(0) rotate(-14deg); opacity: .25; } 50% { transform: translateX(-45px) rotate(-8deg); opacity: .85; } }
        @keyframes grass { from { transform: skewX(0); } to { transform: skewX(-8deg) translateX(8px); } }
        @keyframes catSleep { 0%, 78% { transform: translateX(-50%) scaleY(.82); opacity: .25; } 100% { transform: translateX(-50%) scaleY(1); opacity: 0; } }
        @keyframes catWake { 0%, 18% { transform: translateX(-50%) translateY(5px); opacity: 0; } 35% { opacity: 1; } 55% { transform: translateX(-50%) translateY(-9px); } 100% { transform: translateX(90vw) translateY(-4px); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .wind, .cat-rest, .cat-awake { animation: none; }
          .cat-rest { opacity: .25; }
        }
      `}</style>
    </main>
  )
}
