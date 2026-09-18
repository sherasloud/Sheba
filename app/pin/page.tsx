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
      // Always start a fresh PIN attempt when the app is reopened.
      setPin("")
      setError("")
      setIsLoading(false)

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
<div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38afe8] mb-4"></div>
        <p className="text-[#10141c] text-lg">যাচাই করা হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-white text-[#10141c]">
  {/* Header */}
  <div className="h-16" />

      {/* Sheba Logo at Top */}
      <div className="flex flex-col items-center pt-20 pb-10">
        <img src="/images/sheba-headline-logo.jpeg" alt="সেবা" className="h-20 w-auto object-contain" />
      </div>

      {/* PIN Input Section */}
      <div className="flex flex-col items-center px-6">
        <div className="mb-8">
          <p className="mb-4 text-center text-4xl font-bold text-[#10141c]">পিন দিন</p>
          <p className="text-center text-xl text-[#a1a1a1]">অ্যাকাউন্টে প্রবেশ করতে পিন লিখুন</p>
          <div className="mt-8 flex justify-center gap-7">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`h-5 w-5 rounded-full transition-all duration-200 ${
                  index < pin.length ? "bg-[#10141c] scale-110" : "bg-[#e4e5e8]"
                }`}
              />
            ))}
          </div>
          {error && <p className="mt-5 text-center text-xl text-[#e05454]">{error}</p>}
        </div>

        <button
          onClick={() => router.push("/forgot-pin")}
          className="mb-8 text-lg font-semibold text-[#38afe8] no-underline"
        >
          পিন ভুলে গেছেন?
        </button>
      </div>

      {/* Number Pad */}
      <div className="px-6 pb-8">
        <div className="mx-auto grid w-full max-w-sm grid-cols-3 justify-items-center gap-y-6 px-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button
              key={number}
              onClick={() => handlePinInput(number.toString())}
              className="flex h-16 w-16 items-center justify-center text-3xl font-medium text-[#10141c] transition-colors hover:text-[#38afe8] active:scale-95"
              disabled={isLoading}
            >
              {number}
            </button>
          ))}

          <div></div>

          <button
            onClick={() => handlePinInput("0")}
            className="flex h-16 w-16 items-center justify-center text-3xl font-medium text-[#10141c] transition-colors hover:text-[#38afe8] active:scale-95"
            disabled={isLoading}
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="flex h-16 w-16 items-center justify-center text-[#cfd1d5] transition-colors hover:text-[#38afe8] active:scale-95"
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
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
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
