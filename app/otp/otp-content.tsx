"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function OTPContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneNumber = searchParams.get("phone") || ""



  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    setError("")
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text")
    const digits = text.replace(/\D/g, "").slice(0, 6)
    if (digits.length === 6) {
      setOtp(digits.split(""))
    }
  }

  const resendOTP = () => {
    setTimeLeft(120)
    setError("")
  }

  const verifyOTP = async (otpValue: string) => {
    if (otpValue.length !== 6) {
      setError("সম্পূর্ণ OTP লিখুন")
      return
    }

    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, otp: otpValue }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        setOtp(["", "", "", "", "", ""])

        if (typeof window !== "undefined") {
          sessionStorage.setItem("phoneNumber", phoneNumber)
          localStorage.setItem("phoneNumber", phoneNumber)
        }

        if (result.exists) {
          router.push(`/pin?phone=${encodeURIComponent(phoneNumber)}`)
        } else {
          sessionStorage.setItem("isNewUser", "true")
          localStorage.setItem("isNewUser", "true")
          router.push(`/onboarding?phone=${encodeURIComponent(phoneNumber)}`)
        }
      } else {
        setError(result.message || "OTP যাচাইকরণ ব্যর্থ হয়েছে")
        setIsLoading(false)
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি: " + (err instanceof Error ? err.message : "অজানা ত্রুটি"))
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }



  return (
    <div className="min-h-screen w-full bg-[#1FBFFF] flex flex-col">
      <div className="flex items-center p-4">
        <button onClick={() => router.push("/enter-phone")} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="mb-8">
          <h1 className="text-white text-7xl font-bold tracking-wider" style={{ fontFamily: "system-ui" }}>
            সেবা
          </h1>
        </div>

        <div className="text-center mb-8">
          <p className="text-white text-xl mb-2">OTP যাচাই করুন</p>
          <p className="text-white/80 text-base">{phoneNumber} এ পাঠানো ৬ সংখ্যার কোড লিখুন</p>
        </div>

        <div className="flex gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-2xl font-bold bg-white rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              disabled={isLoading}
            />
          ))}
        </div>

        {error && <p className="text-red-200 text-base mb-4 text-center">{error}</p>}



        <div className="text-center mb-8">
          {timeLeft > 0 ? (
            <p className="text-white/80 text-base">পুনরায় পাঠান {formatTime(timeLeft)} পরে</p>
          ) : (
            <button onClick={resendOTP} className="text-white text-base font-semibold underline">
              OTP পুনরায় পাঠান
            </button>
          )}
        </div>

        <button
          onClick={() => verifyOTP(otp.join(""))}
          disabled={otp.some((digit) => digit === "") || isLoading}
          className="w-full max-w-md bg-white text-[#1FBFFF] text-xl font-semibold py-4 px-8 rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-800 font-semibold">OTP যাচাই হচ্ছে...</p>
          </div>
        </div>
      )}
    </div>
  )
}
