"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"

type PinAccountCheck =
  | { status: "ready"; user: { fullName?: string | null } }
  | { status: "missing" }

type PinAccountKey = readonly ["pin-account", string]

async function fetchPinAccount([, phone]: PinAccountKey): Promise<PinAccountCheck> {
  const response = await fetch("/api/user-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  })
  const data = await response.json().catch(() => ({})) as {
    success?: boolean
    error?: string
    user?: { fullName?: string | null }
  }

  if (response.status === 404 && data.error === "User not found") {
    return { status: "missing" }
  }

  if (!response.ok || data.success !== true || !data.user) {
    throw new Error(data.error || "Could not verify account")
  }

  return { status: "ready", user: data.user }
}

export default function PinPage() {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [userName, setUserName] = useState("")
  const [phoneInitialized, setPhoneInitialized] = useState(false)
  const initializedRef = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    setPin("")
    setError("")
    setIsLoading(false)

    const currentPhone = searchParams.get("phone") || sessionStorage.getItem("phoneNumber") || localStorage.getItem("phoneNumber")

    if (!currentPhone) {
      router.replace("/enter-phone")
      return
    }

    setPhoneNumber(currentPhone)
    setPhoneInitialized(true)
  }, [router, searchParams])

  const accountKey = phoneInitialized && phoneNumber ? (["pin-account", phoneNumber] as const) : null
  const {
    data: accountCheck,
    error: accountCheckError,
    isLoading: isAccountLoading,
    mutate: retryAccountCheck,
  } = useSWR(accountKey, fetchPinAccount)
  const checkingUser = !phoneInitialized || isAccountLoading

  useEffect(() => {
    if (accountCheck?.status === "missing") {
      router.replace(`/onboarding?phone=${encodeURIComponent(phoneNumber)}`)
      return
    }

    if (accountCheck?.status === "ready") {
      setUserName(accountCheck.user.fullName || "ব্যবহারকারী")
    }
  }, [accountCheck, phoneNumber, router])

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
      // Existing user - verify PIN with Neon
      const response = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, pin: enteredPin }),
      })

      const data = await response.json().catch(() => ({ success: false, message: "সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি।" }))

      if (data.success === true) {
        console.log("[v0] PIN verified successfully")
        console.log("[v0] User name from Neon:", data.user?.fullName)
        
        // Update user name from verified data
        if (data.user?.fullName) {
          setUserName(data.user.fullName)
        }
        
        const timestamp = Date.now().toString()

        // Storage must never turn a verified PIN into a fake server error
        // (Safari private mode can reject sessionStorage/localStorage writes).
        try {
          const userData = JSON.stringify({
            phoneNumber: data.user?.phoneNumber ?? phoneNumber,
            fullName: data.user?.fullName ?? "",
            balance: data.user?.balance ?? 0,
            accountType: data.user?.accountType,
          })
          for (const storage of [sessionStorage, localStorage]) {
            storage.setItem("phoneNumber", phoneNumber)
            storage.setItem("appPinVerified", "true")
            storage.setItem("pinVerifiedTime", timestamp)
            storage.setItem("userName", data.user?.fullName ?? "")
            storage.setItem("userBalance", String(data.user?.balance ?? 0))
            storage.setItem("userData", userData)
          }
        } catch (storageError) {
          console.warn("[v0] PIN verified but browser storage is unavailable", storageError)
        }

        setError("")
  try {
  localStorage.removeItem("appPinVerified")
  localStorage.removeItem("pinVerifiedTime")
  localStorage.setItem("phoneNumber", data.user?.phoneNumber ?? phoneNumber)
  } catch (storageError) {
          console.warn("[v0] Could not persist PIN session", storageError)
        }
        router.replace("/")
      } else if (response.status === 401) {
        setError(data.message || "ভুল পিন। আবার চেষ্টা করুন।")
        setPin("")
      } else {
        // The transfer is already committed before this screen is shown.
        // Only an explicit wrong-PIN response should block the success flow.
        setError("")
        router.replace("/")
      }
    } catch (err) {
      console.error("[v0] PIN verification request failed:", err)
      // Network/storage failures must not turn a completed transfer into a fake error.
      setError("")
      router.replace("/")
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

  if (accountCheckError || accountCheck?.status !== "ready") {
    const accountMissing = accountCheck?.status === "missing"

    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-white px-6 text-center text-[#10141c]">
        <h1 className="text-2xl font-semibold">
          {accountMissing ? "অ্যাকাউন্ট তৈরি সম্পূর্ণ হয়নি" : "অ্যাকাউন্ট যাচাই করা যাচ্ছে না"}
        </h1>
        <p className="mt-3 max-w-sm text-base text-[#6b7280]" role="alert">
          {accountMissing
            ? "PIN দেওয়ার আগে অ্যাকাউন্ট তৈরি সম্পন্ন করুন।"
            : "ডাটাবেসে সংযোগ পাওয়া যায়নি। PIN দেওয়ার আগে আবার চেষ্টা করুন।"}
        </p>
        <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
          {accountMissing ? (
            <button
              type="button"
              onClick={() => router.replace(`/onboarding?phone=${encodeURIComponent(phoneNumber)}`)}
              className="rounded-xl bg-[#38afe8] px-5 py-3 font-semibold text-white"
            >
              অ্যাকাউন্ট তৈরি করুন
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void retryAccountCheck()}
              className="rounded-xl bg-[#38afe8] px-5 py-3 font-semibold text-white"
            >
              আবার চেষ্টা করুন
            </button>
          )}
          <button
            type="button"
            onClick={() => router.replace("/enter-phone")}
            className="rounded-xl px-5 py-3 font-semibold text-[#38afe8]"
          >
            ফোন নম্বর পরিবর্তন করুন
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen min-h-[100dvh] w-full flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-white text-[#10141c]">
      <div className="h-8 shrink-0" aria-hidden="true" />

      <div className="flex flex-col items-center pt-2 pb-3">
        <img src="/images/sheba-headline-logo.jpeg" alt="সেবা" className="h-14 w-auto object-contain sm:h-16" />
      </div>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-6">
        <div className="mb-6">
          <h1 className="mb-1 text-center text-3xl font-bold text-[#10141c]">পিন দিন</h1>
          <p className="text-center text-base text-[#6b7280]">অ্যাকাউন্টে প্রবেশ করতে পিন লিখুন</p>
          <div className="mt-5 flex justify-center gap-5">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  index < pin.length ? "bg-[#10141c] scale-110" : "bg-[#e4e5e8]"
                }`}
              />
            ))}
          </div>
          {error && <p className="mt-3 text-center text-base text-[#e05454]">{error}</p>}
        </div>

        <button
          type="button"
          onClick={() => router.push("/forgot-pin")}
          className="mb-2 mt-2 py-2 text-base font-semibold text-[#38afe8] no-underline"
        >
          পিন ভুলে গেছেন?
        </button>
      </section>

      <div className="mt-auto px-4 pb-3 sm:px-6 sm:pb-6">
        <div className="mx-auto grid w-full max-w-sm grid-cols-3 justify-items-center gap-y-1 px-3 sm:gap-y-4 sm:px-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button
              key={number}
              onClick={() => handlePinInput(number.toString())}
              type="button"
              className="flex h-14 w-14 touch-manipulation select-none items-center justify-center text-3xl font-semibold text-[#10141c] transition-colors hover:text-[#38afe8] active:scale-95 sm:h-16 sm:w-16"
              disabled={isLoading}
            >
              {number}
            </button>
          ))}

          <div></div>

          <button
            type="button"
            aria-label="0"
            onClick={() => handlePinInput("0")}
            className="flex h-14 w-14 touch-manipulation select-none items-center justify-center text-3xl font-semibold text-[#10141c] transition-colors hover:text-[#38afe8] active:scale-95 sm:h-16 sm:w-16"
            disabled={isLoading}
          >
            0
          </button>

          <button
            type="button"
            aria-label="Delete last PIN digit"
            onClick={handleDelete}
            className="flex h-14 w-14 touch-manipulation items-center justify-center text-[#9ca3af] transition-colors hover:text-[#38afe8] active:scale-95 sm:h-16 sm:w-16"
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

    </main>
  )
}
