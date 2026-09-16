"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getProfileByPhone } from "@/lib/supabase/data-service"

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
      
      // Store phone temporarily
      sessionStorage.setItem("pendingPhone", phoneNumber)
      sessionStorage.setItem("phoneNumber", phoneNumber)

      // Simulate 1.5 second delay for dial detection
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log("[v0] Dial verification complete, moving to OTP")
      
      // Check if user exists
      const profile = await getProfileByPhone(phoneNumber)
      
      // Navigate to OTP page
      if (profile) {
        router.push(`/otp?phone=${phoneNumber}`)
      } else {
        router.push(`/otp?phone=${phoneNumber}&new=true`)
      }
    } catch (err) {
      console.error("[v0] Error in handleNext:", err)
      setError("একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন")
      setIsChecking(false)
    }
  }

  if (showSplash) {
    return (
      <div className="h-screen w-full relative overflow-hidden fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
        {/* Loading indicator */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Main Phone Entry Screen
  return (
    <div className="min-h-screen w-full bg-[#1FBFFF] flex flex-col items-center justify-center p-6">
      {/* Sheba Logo */}
      <div className="mb-16">
        <h1 className="text-white text-8xl font-bold tracking-wider" style={{ fontFamily: "system-ui, -apple-system" }}>
          সেবা
        </h1>
      </div>

      {/* Phone Input Field */}
      <div className="w-full max-w-md mb-6">
        <input
          type="tel"
          className="w-full bg-white text-gray-800 text-lg rounded-full py-5 px-8 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-center"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            setError("")
          }}
          placeholder="আপনার ফোন নাম্বার লিখুন"
          maxLength={11}
          autoFocus
        />
        {error && <p className="text-white text-sm mt-2 text-center drop-shadow-lg">{error}</p>}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={isChecking}
        className="w-full max-w-md bg-white text-[#1FBFFF] text-xl font-semibold py-4 px-8 rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg disabled:opacity-70 flex items-center justify-center"
      >
        {isChecking ? (
          <>
            <div className="w-5 h-5 border-2 border-[#1FBFFF]/30 border-t-[#1FBFFF] rounded-full animate-spin mr-2"></div>
            যাচাই করা হচ্ছে...
          </>
        ) : (
          "সামনে যান"
        )}
      </button>
    </div>
  )
}
