"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EnterPhonePage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [method, setMethod] = useState<"phone" | "email">("phone")
  const router = useRouter()

  const handleNext = async () => {
    if (!phoneNumber) {
      setError("আপনার ফোন নাম্বার লিখুন")
      return
    }

    if (phoneNumber.length !== 11 || !/^01\d{9}$/.test(phoneNumber)) {
      setError("সঠিক ১১ ডিজিটের ফোন নাম্বার লিখুন")
      return
    }

    setIsChecking(true)
    setError("")

    try {
      console.log("[v0] Phone verification for:", phoneNumber)

      sessionStorage.setItem("phoneNumber", phoneNumber)
      localStorage.setItem("phoneNumber", phoneNumber)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("[v0] Dial verification complete, moving to OTP")

      router.push(`/otp?phone=${encodeURIComponent(phoneNumber)}`)
    } catch (err) {
      console.error("[v0] Error in handleNext:", err)
      setError("একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন")
      setIsChecking(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col px-6 pt-24 pb-10">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        {/* Heading */}
        <h1 className="text-[#141414] text-4xl font-extrabold tracking-tight">লগইন করুন</h1>

        {/* Method toggle */}
        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => setMethod("phone")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              method === "phone" ? "bg-[#f1f1f4] text-[#141414]" : "text-[#9a9aa5]"
            }`}
          >
            ফোন নাম্বার
          </button>
          <button
            onClick={() => setMethod("email")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              method === "email" ? "bg-[#f1f1f4] text-[#141414]" : "text-[#9a9aa5]"
            }`}
          >
            ইমেইল
          </button>
        </div>

        {/* Label */}
        <label className="text-[#9a9aa5] text-sm mt-6 mb-2">ফোন নাম্বার</label>

        {/* Phone Input Field */}
        <div className="flex items-center bg-[#f6f6f8] rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-[#635bff]/40">
          {/* BD flag */}
          <span className="flex items-center justify-center w-7 h-5 rounded-sm bg-[#006a4e] mr-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f42a41]" />
          </span>
          <svg className="mr-3 text-[#9a9aa5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span className="text-[#141414] font-semibold text-base mr-3">+৮৮০</span>
          <input
            type="tel"
            className="flex-1 min-w-0 bg-transparent text-[#141414] text-base placeholder-[#b6b6bf] focus:outline-none"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value)
              setError("")
            }}
            placeholder="০১৭ ১২৩ ৪৫৬৭"
            maxLength={11}
            autoFocus
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        {/* Login Button */}
        <button
          onClick={handleNext}
          disabled={isChecking}
          className="w-full bg-[#635bff] text-white text-base font-semibold py-4 rounded-2xl mt-5 hover:bg-[#524bdb] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
        >
          {isChecking ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              যাচাই করা হচ্ছে...
            </>
          ) : (
            "লগইন"
          )}
        </button>

        {/* OR divider */}
        <div className="flex items-center gap-4 my-8">
          <span className="flex-1 h-px bg-[#ececf0]" />
          <span className="text-[#9a9aa5] text-xs font-medium">অথবা</span>
          <span className="flex-1 h-px bg-[#ececf0]" />
        </div>

        {/* Google button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#ececf0] text-[#141414] text-base font-semibold py-4 rounded-2xl hover:bg-[#fafafa] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Google দিয়ে চালিয়ে যান
        </button>

        {/* Apple button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-black text-white text-base font-semibold py-4 rounded-2xl mt-3 hover:bg-[#1a1a1a] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.36 12.9c.02 2.5 2.2 3.33 2.22 3.34-.02.06-.35 1.2-1.15 2.37-.69 1.02-1.4 2.03-2.53 2.05-1.1.02-1.46-.65-2.72-.65-1.26 0-1.66.63-2.7.67-1.09.04-1.92-1.1-2.62-2.11-1.42-2.06-2.5-5.82-1.05-8.36.72-1.26 2.01-2.06 3.41-2.08 1.07-.02 2.08.72 2.73.72.65 0 1.88-.89 3.17-.76.54.02 2.05.22 3.02 1.64-.08.05-1.8 1.05-1.79 3.14M14.28 4.6c.58-.7.97-1.67.86-2.64-.83.03-1.84.55-2.44 1.25-.54.62-1.01 1.61-.88 2.56.93.07 1.88-.47 2.46-1.17" />
          </svg>
          Apple দিয়ে চালিয়ে যান
        </button>
      </div>
    </div>
  )
}
