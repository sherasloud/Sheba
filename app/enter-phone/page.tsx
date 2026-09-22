"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EnterPhonePage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [showSplash, setShowSplash] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

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
      
      // Store phone in both storage
      sessionStorage.setItem("phoneNumber", phoneNumber)
      localStorage.setItem("phoneNumber", phoneNumber)

      // Simulate 1.5 second delay for dial detection
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log("[v0] Dial verification complete, moving to OTP")
      
      // Navigate to OTP page
      router.push(`/otp?phone=${encodeURIComponent(phoneNumber)}`)
    } catch (err) {
      console.error("[v0] Error in handleNext:", err)
      setError("একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন")
      setIsChecking(false)
    }
  }

  if (showSplash) {
    return (
      <div className="h-screen w-full relative overflow-hidden fixed inset-0 bg-[#F7ECF5]">
        {/* Loading indicator */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 border-4 border-[#4B1039]/20 border-t-[#4B1039] rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Main Phone Entry Screen
  return (
    <div className="min-h-screen w-full bg-[#F7ECF5] flex flex-col px-6 pt-6 pb-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        aria-label="ফিরে যান"
        className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm text-[#4B1039]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Sheba headline */}
      <div className="mt-10 text-center">
        <h1 className="text-[#4B1039] text-5xl font-bold tracking-wide">সেবা</h1>
        <p className="text-[#4B1039]/60 text-base mt-3">আপনার ফোন নাম্বার দিয়ে লগইন করুন</p>
      </div>

      {/* Phone Input Field */}
      <div className="w-full max-w-md mx-auto mt-12">
        <div className="flex items-center bg-white rounded-full border border-[#4B1039]/15 px-5 py-4 focus-within:ring-2 focus-within:ring-[#4B1039]/30">
          <span className="text-[#4B1039] font-semibold text-lg mr-3">+৮৮০</span>
          <span className="w-px h-6 bg-[#4B1039]/15 mr-3" />
          <input
            type="tel"
            className="flex-1 bg-transparent text-[#4B1039] text-lg placeholder-[#4B1039]/40 focus:outline-none"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value)
              setError("")
            }}
            placeholder="আপনার ফোন নাম্বার"
            maxLength={11}
            autoFocus
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}
      </div>

      {/* Login Button */}
      <div className="mt-auto w-full max-w-md mx-auto">
        <button
          onClick={handleNext}
          disabled={isChecking}
          className="w-full bg-[#4B1039] text-white text-xl font-semibold py-4 px-8 rounded-full hover:bg-[#3a0c2c] transition-all duration-200 shadow-lg disabled:opacity-70 flex items-center justify-center"
        >
          {isChecking ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
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
