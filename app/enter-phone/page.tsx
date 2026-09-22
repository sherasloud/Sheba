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
        {/* Sheba headline logo */}
        <img
          src="/images/sheba-headline-logo.jpeg"
          alt="সেবা"
          className="h-10 w-auto object-contain mb-8"
        />

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
      </div>
    </div>
  )
}
