"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EnterPhonePage() {
  const [phoneNumber, setPhoneNumber] = useState("01")
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
    setPhoneNumber((prev) => (prev.length > 2 ? prev.slice(0, -1) : "01"))
  }

  const handleNext = async () => {
    if (!/^01[3-9]\d{8}$/.test(phoneNumber)) {
      setError("Enter a valid 11-digit number in 01XXXXXXXXX format.")
      return
    }

    const localPhone = phoneNumber
    setIsChecking(true)
    setError("")

    try {
      sessionStorage.setItem("phoneNumber", localPhone)
      localStorage.setItem("phoneNumber", localPhone)

      // Request an OTP by SMS
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: localPhone }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        setError(result.message || "Failed to send OTP. Please try again")
        setIsChecking(false)
        return
      }

      router.push(`/otp?phone=${encodeURIComponent(localPhone)}`)
    } catch (err) {
      console.error("[v0] Error in handleNext:", err)
      setError("Something went wrong. Please try again")
      setIsChecking(false)
    }
  }

  const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

  return (
    <div className="min-h-[100dvh] w-full bg-white flex flex-col px-6 pt-4 pb-4 sm:pt-6 sm:pb-6">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        {/* Sheba headline logo */}
        <img
          src="/images/sheba-headline-logo.jpeg"
          alt="সেবা"
          className="h-16 sm:h-20 md:h-24 w-auto object-contain mt-1 mb-6 sm:mt-2 sm:mb-8 md:mb-10 mx-auto"
        />

        {/* Label */}
        <label htmlFor="phone-number" className="text-[#9a9aa5] text-sm mb-1 mt-4 sm:mt-8 md:mt-10">Phone Number</label>
        <p id="phone-number-hint" className="text-xs text-[#777780]">
          Use the full 11-digit format: 01XXXXXXXXX
        </p>

        {/* Phone Input Field */}
        <div className="mt-2 flex items-center rounded-2xl bg-[#f4f4f6] px-3 py-3">
          <div className="mr-3 flex shrink-0 items-center gap-2" aria-label="Bangladesh country code +880">
            <span aria-hidden="true" className="relative h-4 w-6 overflow-hidden rounded-[2px] bg-[#006a4e]">
              <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f42a41]" />
            </span>
            <span className="text-sm font-medium text-[#141414]">+880</span>
          </div>
          <input
            id="phone-number"
            type="tel"
            inputMode="none"
            readOnly
            maxLength={11}
            aria-describedby="phone-number-hint"
            aria-invalid={Boolean(error)}
            className="w-full min-w-0 bg-transparent text-base font-semibold tracking-normal text-[#141414] focus:outline-none"
            value={phoneNumber}
            placeholder="01XXXXXXXXX"
          />
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={isChecking}
          className="w-full bg-[#38afe8] text-white text-base font-semibold py-4 rounded-2xl mt-6 sm:mt-10 md:mt-14 hover:bg-[#2fa0d8] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
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
        <div className="mt-auto pt-4 mb-2 sm:pt-6 sm:mb-6 md:pt-8 md:mb-10">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {keypadKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKey(key)}
                className="h-11 sm:h-14 rounded-2xl text-[#141414] text-xl sm:text-2xl font-normal active:bg-[#f4f4f6] transition-colors"
              >
                {key}
              </button>
            ))}
            {/* empty cell */}
            <div />
            <button
              type="button"
              onClick={() => handleKey("0")}
              className="h-11 sm:h-14 rounded-2xl text-[#141414] text-xl sm:text-2xl font-semibold active:bg-[#f4f4f6] transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Backspace"
              className="h-11 sm:h-14 rounded-2xl text-[#141414] flex items-center justify-center active:bg-[#f4f4f6] transition-colors"
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
