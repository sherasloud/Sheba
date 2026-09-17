"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Phone, Lock, CheckCircle } from "lucide-react"
import { createAccount, setCurrentUser, getAccountByPhone, isAdminPhone } from "@/lib/account-manager"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form data
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [accountType, setAccountType] = useState("personal")
  const [isAdmin, setIsAdmin] = useState(false)

  // Helper function to save account data to storage
  const saveAccountData = (phoneNumber: string, fullName: string) => {
    localStorage.setItem("phoneNumber", phoneNumber)
    localStorage.setItem("userName", fullName.trim())
    localStorage.setItem("isVerified", "true")
    localStorage.setItem("userBalance", "0")
    localStorage.setItem("userData", JSON.stringify({
      phoneNumber: phoneNumber,
      fullName: fullName.trim(),
      balance: 0,
      isVerified: true,
    }))
    
    sessionStorage.setItem("phoneNumber", phoneNumber)
    sessionStorage.setItem("otpVerified", "true")
    sessionStorage.setItem("appPinVerified", "true")
    sessionStorage.setItem("pinVerifiedTime", Date.now().toString())
    localStorage.setItem("appPinVerified", "true")
    localStorage.setItem("pinVerifiedTime", Date.now().toString())
  }

  // Fallback function to create account locally if Supabase fails
  const createLocalAccount = (phone: string, name: string, pin: string): boolean => {
    try {
      console.log("[v0] Creating account in local storage for phone:", phone)
      
      // Validate inputs
      if (!phone || !name || !pin) {
        console.error("[v0] Missing required fields for account creation")
        return false
      }
      
      // Create account using account manager
      const newAccount = createAccount(phone.trim(), name.trim(), pin)
      
      console.log("[v0] Account created successfully via account manager:", newAccount)
      
      // Set as current user
      setCurrentUser(phone.trim())
      
      return true
    } catch (err) {
      console.error("[v0] Error creating account:", err)
      return false
    }
  }

  useEffect(() => {
    // Get phone number from session if available
    const storedPhone = sessionStorage.getItem("phoneNumber") || localStorage.getItem("phoneNumber")
    if (storedPhone) {
      setPhoneNumber(storedPhone)
    }
  }, [])

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length !== 11 || !/^01\d{9}$/.test(phoneNumber)) {
      setError("সঠিক ১১ সংখ্যার ফোন নম্বর দিন (01XXXXXXXXX)")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Check if user is admin
      const isAdminUser = isAdminPhone(phoneNumber)
      setIsAdmin(isAdminUser)

      // Check if user already exists
      const existingUser = getAccountByPhone(phoneNumber)
      if (existingUser) {
        // User exists, save to localStorage and redirect to PIN
        localStorage.setItem("phoneNumber", phoneNumber)
        sessionStorage.setItem("phoneNumber", phoneNumber)
        sessionStorage.setItem("otpVerified", "true")
        router.push("/pin")
        return
      }

      // New user - continue to name step
      setStep(2)
    } catch (err) {
      console.error("[v0] Phone check error:", err)
      // If Supabase fails, still allow to continue for new user
      setStep(2)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameSubmit = () => {
    if (fullName.trim().length < 2) {
      setError("আপনার নাম লিখুন (কমপক্ষে ২ অক্ষর)")
      return
    }
    setError("")
    // For regular users, skip account type selection and go directly to PIN
    // For admin, show account type selection
    if (isAdmin) {
      setStep(3) // Show account type selection for admin
    } else {
      setAccountType("personal") // Auto-set personal for regular users
      setStep(4) // Skip to PIN
    }
  }

  const handlePinSubmit = () => {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError("৬ সংখ্যার পিন দিন")
      return
    }
    setError("")
    setStep(4)
  }

  const handleConfirmPinSubmit = async () => {
    if (confirmPin !== pin) {
      setError("পিন মিলছে না। আবার চেষ্টা করুন।")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Create account using local account manager
      console.log("[v0] Creating account with phone:", phoneNumber, "name:", fullName)
      
      // Check if account already exists
      const existingAccount = getAccountByPhone(phoneNumber)
      if (existingAccount) {
        console.error("[v0] Account already exists for phone:", phoneNumber)
        setError("এই নম্বরে আগে থেকে অ্যাকাউন্ট আছে। লগইন করুন।")
        setIsLoading(false)
        return
      }
      
      // Create new account
      const newAccount = createAccount(phoneNumber, fullName.trim(), pin)

      console.log("[v0] Account created:", newAccount)

      if (newAccount) {
        // Account created successfully
        console.log("[v0] Account created successfully with phone:", phoneNumber)
        
        // Save account data to localStorage
        saveAccountData(phoneNumber, fullName)
        
        // Set current user
        setCurrentUser(phoneNumber)
        
        // Show success and redirect
        setStep(5)
        setTimeout(() => {
          router.replace("/")
        }, 2000)
      } else {
        console.error("[v0] Account creation returned null")
        setError("অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।")
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error("[v0] Error details:", errorMsg)
      setError("অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setError("")
    } else {
      router.push("/enter-phone")
    }
  }

  const handleAccountTypeSubmit = () => {
    if (accountType) {
      setError("")
      setStep(4)
    } else {
      setError("অ্যাকাউন্টের ধরন নির্বাচন করুন")
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#1FBFFF" }}>
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={handleBack} className="text-white p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-xl font-bold ml-4">
          {step === (isAdmin ? 6 : 5) ? "সম্পন্ন" : "অ্যাকাউন্ট তৈরি করুন"}
        </h1>
      </div>

      {/* Progress Indicator */}
      {step < (isAdmin ? 6 : 5) && (
        <div className="px-6 mb-6">
          <div className="flex justify-between">
            {(isAdmin ? [1, 2, 3, 4, 5] : [1, 2, 4, 5]).map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full mx-1 ${
                  s <= step ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 bg-white rounded-t-3xl p-6">
        {/* Step 1: Phone Number */}
        {step === 1 && (
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Phone className="w-6 h-6 text-[#1FBFFF]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">ফোন নম্বর</h2>
                <p className="text-gray-500 text-sm">আপনার মোবাইল নম্বর দিন</p>
              </div>
            </div>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))
                setError("")
              }}
              placeholder="01XXXXXXXXX"
              className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl mb-4 focus:border-[#1FBFFF] focus:outline-none"
              maxLength={11}
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handlePhoneSubmit}
              disabled={isLoading || phoneNumber.length !== 11}
              className="mt-auto w-full py-4 bg-[#1FBFFF] text-white rounded-full text-lg font-medium disabled:opacity-50"
            >
              {isLoading ? "যাচাই করা হচ্ছে..." : "পরবর্তী"}
            </button>
          </div>
        )}

        {/* Step 2: Full Name */}
        {step === 2 && (
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-[#1FBFFF]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">আপনার নাম</h2>
                <p className="text-gray-500 text-sm">আপনার পুরো নাম লিখুন</p>
              </div>
            </div>

            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                setError("")
              }}
              placeholder="আপনার নাম"
              className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl mb-4 focus:border-[#1FBFFF] focus:outline-none"
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleNameSubmit}
              disabled={fullName.trim().length < 2}
              className="mt-auto w-full py-4 bg-[#1FBFFF] text-white rounded-full text-lg font-medium disabled:opacity-50"
            >
              পরবর্তী
            </button>
          </div>
        )}

        {/* Step 3: Create PIN */}
        {step === 3 && (
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Lock className="w-6 h-6 text-[#1FBFFF]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">পিন তৈরি করুন</h2>
                <p className="text-gray-500 text-sm">৬ সংখ্যার একটি পিন দিন</p>
              </div>
            </div>

            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                setError("")
              }}
              placeholder="••••••"
              className="w-full p-4 text-2xl text-center border-2 border-gray-200 rounded-xl mb-4 focus:border-[#1FBFFF] focus:outline-none tracking-widest"
              maxLength={6}
            />

            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < pin.length ? "bg-[#1FBFFF]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button
              onClick={handlePinSubmit}
              disabled={pin.length !== 6}
              className="mt-auto w-full py-4 bg-[#1FBFFF] text-white rounded-full text-lg font-medium disabled:opacity-50"
            >
              পরবর্তী
            </button>
          </div>
        )}

        {/* Step 4: Confirm PIN */}
        {step === 4 && (
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Lock className="w-6 h-6 text-[#1FBFFF]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">পিন নিশ্চিত করুন</h2>
                <p className="text-gray-500 text-sm">আবার পিন দিন</p>
              </div>
            </div>

            <input
              type="password"
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                setError("")
              }}
              placeholder="••••••"
              className="w-full p-4 text-2xl text-center border-2 border-gray-200 rounded-xl mb-4 focus:border-[#1FBFFF] focus:outline-none tracking-widest"
              maxLength={6}
            />

            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < confirmPin.length ? "bg-[#1FBFFF]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button
              onClick={handleConfirmPinSubmit}
              disabled={isLoading || confirmPin.length !== 6}
              className="mt-auto w-full py-4 bg-[#1FBFFF] text-white rounded-full text-lg font-medium disabled:opacity-50"
            >
              {isLoading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
            </button>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">স্বাগতম!</h2>
            <p className="text-gray-500 text-center mb-2">
              {fullName}, আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।
            </p>
            <p className="text-gray-400 text-sm">হোম পেজে নিয়ে যাওয়া হচ্ছে...</p>
            <div className="mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FBFFF]"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
