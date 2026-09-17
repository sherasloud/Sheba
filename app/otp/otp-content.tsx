"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function OTPContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [generatedOTP, setGeneratedOTP] = useState("")
  const [showOTPHint, setShowOTPHint] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const phoneNumber = searchParams.get("phone") || ""
  const isNewUser = searchParams.get("new") === "true"

  useEffect(() => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOTP(newOTP)

    const hintTimer = setTimeout(() => {
      setShowOTPHint(true)
    }, 3000)

    return () => clearTimeout(hintTimer)
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      verifyOTP(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split("").forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit
    })
    setOtp(newOtp)

    if (newOtp.every((digit) => digit !== "")) {
      verifyOTP(newOtp.join(""))
    }
  }

  const verifyOTP = async (enteredOTP: string) => {
    setIsLoading(true)
    setError("")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (enteredOTP === generatedOTP) {
      localStorage.setItem("phoneNumber", phoneNumber)
      sessionStorage.setItem("phoneNumber", phoneNumber)
      sessionStorage.setItem("otpVerified", "true")
      sessionStorage.setItem("otpVerifiedTime", Date.now().toString())

      // New user goes to onboarding, existing user goes to PIN
      if (isNewUser) {
        router.push("/onboarding")
      } else {
        router.push("/pin")
      }
    } else {
      setError("ভুল OTP। আবার চেষ্টা করুন।")
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }

    setIsLoading(false)
  }

  const resendOTP = () => {
    if (timeLeft > 0) return

    const newOTP = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOTP(newOTP)
    setTimeLeft(120)
    setOtp(["", "", "", "", "", ""])
    setError("")
    setShowOTPHint(false)

    setTimeout(() => setShowOTPHint(true), 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen w-full bg-[#1FBFFF] flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={() => router.push("/enter-phone")} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Logo */}
        <div className="mb-8">
          <h1
            className="text-white text-7xl font-bold tracking-wider"
            style={{ fontFamily: "system-ui, -apple-system" }}
          >
            সেবা
          </h1>
        </div>

        {/* OTP Instructions */}
        <div className="text-center mb-8">
          <p className="text-white text-xl mb-2">OTP যাচাই করুন</p>
          <p className="text-white/80 text-base">{phoneNumber} নম্বরে পাঠানো ৬ সংখ্যার কোড লিখুন</p>
        </div>

        {/* OTP Input Fields */}
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

        {/* Error Message */}
        {error && <p className="text-red-200 text-base mb-4 text-center">{error}</p>}

        {/* Demo OTP Hint */}
        {showOTPHint && (
          <div className="bg-white/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-white text-sm text-center">
              ডেমো OTP: <span className="font-bold text-lg">{generatedOTP}</span>
            </p>
            <p className="text-white/70 text-xs text-center mt-1">(বাস্তবে SMS এ পাঠানো হবে)</p>
          </div>
        )}

        {/* Timer and Resend */}
        <div className="text-center mb-8">
          {timeLeft > 0 ? (
            <p className="text-white/80 text-base">পুনরায় পাঠান {formatTime(timeLeft)} পরে</p>
          ) : (
            <button onClick={resendOTP} className="text-white text-base font-semibold underline">
              OTP পুনরায় পাঠান
            </button>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => verifyOTP(otp.join(""))}
          disabled={otp.some((digit) => digit === "") || isLoading}
          className="w-full max-w-md bg-white text-[#1FBFFF] text-xl font-semibold py-4 px-8 rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 text-lg">OTP যাচাই হচ্ছে...</p>
          </div>
        </div>
      )}
    </div>
  )
}
