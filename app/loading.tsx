export default function Loading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#8fd8f3] text-white" aria-label="Loading Sheba">
      <div className="absolute inset-0 bg-gradient-to-b from-[#66c6ed] via-[#b9e8f6] to-[#f7d99d]" />

      <div className="sun absolute left-1/2 top-[22%] h-24 w-24 -translate-x-1/2 rounded-full bg-[#ffd66b] shadow-[0_0_45px_12px_rgba(255,214,107,0.45)]" />

      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#2eafc0]">
        <div className="river-highlight absolute inset-x-0 top-8 h-8 bg-[#8be0df]/60" />
        <div className="river-line absolute inset-x-0 top-24 h-5 bg-[#b4ece5]/50" />
        <div className="river-line river-line-delay absolute inset-x-0 top-44 h-4 bg-[#b4ece5]/40" />
        <div className="absolute -top-7 left-0 h-12 w-[58%] rounded-tr-[100%] bg-[#4a9e68]" />
        <div className="absolute -top-8 right-0 h-14 w-[52%] rounded-tl-[100%] bg-[#3f9865]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center pb-10">
        <div className="mb-8 text-5xl font-semibold tracking-tight text-white drop-shadow-md">সেবা</div>
        <div className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium backdrop-blur-sm">Loading...</div>
      </div>

      <style>{`
        .sun { animation: sunset 5s ease-in-out infinite alternate; }
        .river-highlight { animation: river 3.5s ease-in-out infinite alternate; }
        .river-line { animation: riverLine 4s ease-in-out infinite alternate; }
        .river-line-delay { animation-delay: 1.2s; }
        @keyframes sunset {
          from { transform: translate(-50%, -8px); opacity: .92; }
          to { transform: translate(-50%, 105px); opacity: 1; }
        }
        @keyframes river {
          from { transform: translateX(-3%); opacity: .35; }
          to { transform: translateX(8%); opacity: .7; }
        }
        @keyframes riverLine {
          from { transform: translateX(8%); }
          to { transform: translateX(-8%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sun, .river-highlight, .river-line { animation: none; }
        }
      `}</style>
    </main>
  )
}
