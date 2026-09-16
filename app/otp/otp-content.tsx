"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function OTPContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [otpSent, setOtpSent] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const phoneNumber = searchParams.get("phone") || ""
  const isNewUser = searchParams.get("new") === "true"

  // Auto-send OTP on page load
  useEffect(() => {
    if (phoneNumber && !otpSent) {
      sendOTP()
    }
  }, [phoneNumber, otpSent])

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || !otpSent) return
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, otpSent])

  // Send OTP
  const sendOTP = async () => {
    if (!phoneNumber) {
      setError("ফোন নম্বর পাওয়া যায়নি")
      return
    }

    setIsLoading(true)
    setMessage("OTP পাঠানো হচ্ছে...")
    setError("")

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage("OTP আপনার ফোনে পাঠানো হয়েছে")
        setOtpSent(true)
        setTimeLeft(120)
        setError("")
      } else {
        setError(result.message || "OTP পাঠাতে ব্যর্থ হয়েছে")
        setMessage("")
      }
    } catch (err: any) {
      setError("নেটওয়ার্ক ত্রুটি: " + err.message)
      setMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP
  const verifyOTP = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("সম্পূর্ণ OTP লিখুন (6 সংখ্যা প্রয়োজন)")
      return
    }

    if (!/^\d{6}$/.test(otpValue)) {
      setError("শুধুমাত্র সংখ্যা ব্যবহার করুন")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          otp: otpValue,
          isNewUser,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        router.push(`/pin?phone=${encodeURIComponent(phoneNumber)}`)
      } else {
        setError(result.message || "ভুল OTP। দয়া করে সঠিক কোড লিখুন।")
      }
    } catch (err: any) {
      setError("যাচাইকরণে ত্রুটি: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP input
  const handleOTPChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all fields filled
    if (newOtp.every((digit) => digit !== "")) {
      setTimeout(() => verifyOTP(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-cyan-350 to-cyan-500 flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">সেবা</h1>
          <h2 className="text-white text-xl font-semibold mb-2">OTP যাচাই করুন</h2>
          <p className="text-white text-sm">
            {phoneNumber} নম্বরে ৬ সংখ্যার কোড পাঠানো হয়েছে
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* OTP Input Box */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex justify-between gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="0"
                disabled={!otpSent || isLoading}
                className="w-12 h-12 text-center text-2xl font-bold border-2 border-cyan-300 rounded-lg focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-cyan-600 font-semibold">
              {timeLeft > 0 ? `পুনরায় পাঠান: ${formatTime(timeLeft)}` : "সময় শেষ"}
            </p>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={verifyOTP}
          disabled={isLoading || otp.some((d) => !d) || !otpSent}
          className="w-full bg-white text-cyan-500 font-bold py-3 px-4 rounded-full hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition mb-4"
        >
          {isLoading ? "যাচাই করছি..." : "যাচাই করুন"}
        </button>

        {/* Resend Button */}
        <button
          onClick={sendOTP}
          disabled={timeLeft > 0 || isLoading}
          className="w-full text-white font-semibold py-3 px-4 rounded-full border-2 border-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {timeLeft > 0 ? `পুনরায় পাঠান (${formatTime(timeLeft)})` : "OTP পাঠান"}
        </button>

        {/* Footer */}
        <p className="text-center text-white text-xs mt-4">
          গোপনীয়তা নীতি এবং শর্তাবলী মেনে চলি
        </p>
      </div>
    </div>
  )
}
