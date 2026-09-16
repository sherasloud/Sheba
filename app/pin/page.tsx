"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PinPage() {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [userName, setUserName] = useState("")
  const [checkingUser, setCheckingUser] = useState(true)
  const [isNewUser, setIsNewUser] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const initPage = async () => {
      const currentPhone = searchParams.get("phone") || sessionStorage.getItem("phoneNumber") || localStorage.getItem("phoneNumber")

      if (!currentPhone) {
        console.log("[v0] No phone number found, redirecting to enter-phone")
        router.replace("/enter-phone")
        return
      }

      setPhoneNumber(currentPhone)
      
      // Fetch user name from Neon database
      try {
        const response = await fetch('/api/user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: currentPhone }),
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.user?.fullName) {
            setUserName(data.user.fullName)
            console.log('[v0] User name loaded from Neon:', data.user.fullName)
          } else {
            setUserName("ব্যবহারকারী")
          }
        } else {
          setUserName("ব্যবহারকারী")
        }
      } catch (err) {
        console.error('[v0] Error fetching user name:', err)
        setUserName("ব্যবহারকারী")
      }
      
      setCheckingUser(false) // No need to check, OTP already verified
    }

    initPage()
  }, [router, searchParams])

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit
      setPin(newPin)

      if (newPin.length === 6) {
        verifyPinWithMongoDB(newPin)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError("")
  }

  const verifyPinWithMongoDB = async (enteredPin: string) => {
    setIsLoading(true)
    setError("")

    console.log("[v0] PIN verification started for:", phoneNumber)

    try {
      if (isNewUser) {
        // New user - should not be here, go to onboarding instead
        console.log("[v0] New user should not be on PIN page, redirecting to onboarding")
        router.replace(`/onboarding?phone=${encodeURIComponent(phoneNumber)}`)
        return
      }

      // Existing user - verify PIN with MongoDB
      const response = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, pin: enteredPin }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("[v0] PIN verified successfully")
        console.log("[v0] User name from Neon:", data.user?.fullName)
        
        // Update user name from verified data
        if (data.user?.fullName) {
          setUserName(data.user.fullName)
        }
        
        const timestamp = Date.now().toString()

        // Store session data
        sessionStorage.setItem("phoneNumber", phoneNumber)
        sessionStorage.setItem("appPinVerified", "true")
        sessionStorage.setItem("pinVerifiedTime", timestamp)

        // Store persistent data
        localStorage.setItem("phoneNumber", phoneNumber)
        localStorage.setItem("appPinVerified", "true")
        localStorage.setItem("pinVerifiedTime", timestamp)
        localStorage.setItem("userName", data.user?.fullName || "")
        localStorage.setItem("userBalance", data.user?.balance.toString() || "0")
        localStorage.setItem("userData", JSON.stringify({
          phoneNumber: data.user?.phoneNumber,
          fullName: data.user?.fullName,
          balance: data.user?.balance,
          accountType: data.user?.accountType,
        }))

        console.log("[v0] User data stored, redirecting to home")
        // Existing user - redirect to home immediately
        setTimeout(() => router.push("/"), 500)
      } else {
        setError(data.message || "ভুল পিন। আবার চেষ্টা করুন।")
        setPin("")
      }
    } catch (err) {
      console.error("[v0] PIN verification error:", err)
      setError("সার্ভারে সমস্যা। আবার চেষ্টা করুন।")
      setPin("")
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#1FBFFF" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">যাচাই করা হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: "#1FBFFF" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <button onClick={() => router.push("/enter-phone")} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-6"></div>
        <div className="w-6"></div>
      </div>

      {/* Sheba Logo at Top */}
      <div className="flex flex-col items-center pt-8 pb-8">
        <h1 className="text-white text-8xl font-bold tracking-wider mb-4" style={{ fontFamily: "system-ui, -apple-system" }}>
          সেবা
        </h1>
        {userName && (
          <p className="text-white/80 text-lg">স্বাগতম, {userName}</p>
        )}
      </div>

      {/* PIN Input Section */}
      <div className="flex-1 flex flex-col items-center px-6 relative z-10">
        {/* PIN Dots */}
        <div className="mb-8">
          <p className="text-white text-xl mb-6 text-center">আপনার পিন দিন</p>
          <div className="flex justify-center space-x-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  index < pin.length ? "bg-white scale-110" : "bg-white/40"
                }`}
              />
            ))}
          </div>
          {error && <p className="text-red-200 text-base mt-4 text-center">{error}</p>}
        </div>

        {/* Forgot PIN Link */}
        <button
          onClick={() => router.push("/forgot-pin")}
          className="text-white/80 text-sm mb-6 underline"
        >
          পিন ভুলে গেছেন?
        </button>
      </div>

      {/* Number Pad */}
      <div className="pb-12 px-6 relative z-10">
        <div className="grid grid-cols-3 gap-8 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button
              key={number}
              onClick={() => handlePinInput(number.toString())}
              className="w-16 h-16 flex items-center justify-center text-4xl font-medium text-white hover:text-yellow-200 transition-colors active:scale-95"
              disabled={isLoading}
            >
              {number}
            </button>
          ))}

          <div></div>

          <button
            onClick={() => handlePinInput("0")}
            className="w-16 h-16 flex items-center justify-center text-4xl font-medium text-white hover:text-yellow-200 transition-colors active:scale-95"
            disabled={isLoading}
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-16 h-16 flex items-center justify-center text-white hover:text-yellow-200 transition-colors active:scale-95"
            disabled={isLoading}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 text-lg">যাচাই করা হচ্ছে...</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        html, body {
          overflow-x: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        body::-webkit-scrollbar {
          display: none !important;
        }
        
        html {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
    </div>
  )
}
