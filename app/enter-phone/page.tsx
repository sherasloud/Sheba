"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EnterPhonePage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  const handleKey = (digit: string) => {
    setError("")
    setPhoneNumber((prev) => {
      if (prev.length >= 11) return prev
      return prev + digit
    })
  }

  const handleBackspace = () => {
    setError("")
    setPhoneNumber((prev) => prev.slice(0, -1))
  }

  const handleNext = async () => {
    if (!phoneNumber) {
      setError("Please enter your phone number")
      return
    }

    if (phoneNumber.length !== 11 || !/^01\d{9}$/.test(phoneNumber)) {
      setError("Please enter a valid 11-digit phone number")
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
      setError("Something went wrong. Please try again")
      setIsChecking(false)
    }
  }

  const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

  return (
    <div className="min-h-screen w-full bg-white flex flex-col px-6 pt-10 pb-8">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        {/* Sheba headline logo */}
        <img
          src="/images/sheba-headline-logo.jpeg"
          alt="সেবা"
          className="h-24 w-auto object-contain mt-2 mb-10 mx-auto"
        />

        {/* Label */}
        <label className="text-[#9a9aa5] text-sm mb-2">Phone Number</label>

        {/* Phone Input Field */}
        <div className="flex items-center bg-[#f4f4f6] rounded-2xl px-4 py-2.5">
          {/* BD flag */}
          <span className="flex items-center justify-center w-7 h-5 rounded-sm bg-[#006a4e] mr-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f42a41]" />
          </span>
          <svg className="mr-3 text-[#9a9aa5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span className="text-[#141414] font-semibold text-base mr-3">+880</span>
          <input
            type="tel"
            inputMode="none"
            readOnly
            className="flex-1 min-w-0 bg-transparent text-[#141414] text-base placeholder-[#b6b6bf] focus:outline-none"
            value={phoneNumber}
            placeholder="017 123 4567"
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={isChecking}
          className="w-full bg-[#38afe8] text-white text-base font-semibold py-4 rounded-2xl mt-8 hover:bg-[#2fa0d8] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
        >
          {isChecking ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            "Next"
          )}
        </button>

        {/* Numeric Keypad */}
        <div className="mt-auto pt-8">
          <div className="grid grid-cols-3 gap-3">
            {keypadKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKey(key)}
                className="h-14 rounded-2xl bg-[#f4f4f6] text-[#141414] text-2xl font-semibold active:bg-[#e6e6ec] transition-colors"
              >
                {key}
              </button>
            ))}
            {/* empty cell */}
            <div />
            <button
              type="button"
              onClick={() => handleKey("0")}
              className="h-14 rounded-2xl bg-[#f4f4f6] text-[#141414] text-2xl font-semibold active:bg-[#e6e6ec] transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Backspace"
              className="h-14 rounded-2xl bg-[#f4f4f6] text-[#141414] flex items-center justify-center active:bg-[#e6e6ec] transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
