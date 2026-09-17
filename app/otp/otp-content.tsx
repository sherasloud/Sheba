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
    <div className="h-[100dvh] w-full overflow-hidden bg-white px-5 py-4 text-[#142033]">
      <div className="relative flex h-full min-h-0 w-full flex-col">
        <div className="flex items-center pt-2">
          <button onClick={() => router.push("/enter-phone")} className="flex h-10 w-10 items-center justify-center text-[#142033]" aria-label="Back">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center px-2 pb-5 pt-3">
          <img src="/images/sheba-headline-logo.jpeg" alt="সেবা" className="mb-4 h-12 w-auto object-contain mix-blend-screen" />
          <div className="mb-4 w-full text-left">
            <h1 className="text-3xl font-bold tracking-tight text-[#142033]">Verification Code</h1>
            <p className="mt-3 text-sm text-[#8d929d]">Enter the 6 digit code sent to your phone number</p>
          </div>

          <div className="mb-4 flex w-full items-center justify-between rounded-2xl bg-[#f4f5f7] px-4 py-3">
            <div>
              <p className="text-xs text-[#9a9da5]">Verification code sent to</p>
              <p className="mt-1 text-base font-medium">{phoneNumber || "Phone number"}</p>
            </div>
            <button type="button" onClick={() => router.push("/enter-phone")} className="text-xl text-[#142033]" aria-label="Edit phone number">✎</button>
          </div>

          <div className="flex w-full justify-between gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-16 w-full rounded-xl border border-[#e3e5ea] bg-[#f4f5f7] text-center text-2xl font-bold text-[#142033] outline-none focus:border-[#5c5be5] focus:bg-white"
                disabled={isLoading}
              />
            ))}
          </div>

          {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

          <div className="mt-5 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#38afe8] text-xs text-[#8d929d]">
              {timeLeft > 0 ? formatTime(timeLeft) : "00:00"}
            </div>
            {timeLeft > 0 ? (
              <p className="text-sm text-[#8d929d]">Resend code</p>
            ) : (
              <button onClick={resendOTP} className="text-sm font-medium text-[#38afe8] underline">Resend code</button>
            )}
          </div>

          <button
            onClick={() => verifyOTP(otp.join(""))}
            disabled={otp.some((digit) => digit === "") || isLoading}
            className="mt-auto w-full rounded-xl bg-[#38afe8] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#249bd4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify code"}
          </button>
        </div>
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
