"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Phone, Lock, CheckCircle } from "lucide-react"
import { setCurrentUser, isAdminPhone, getAccountByPhone } from "@/lib/account-manager"
import { DiditSdk } from "@didit-protocol/sdk-web"

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
  const [nidType, setNidType] = useState("nid")
  const [documentNumber, setDocumentNumber] = useState("")
  const [kycLoading, setKycLoading] = useState(false)

  useEffect(() => {
    let finishing = false
    const finishVerification = async (sessionId?: string) => {
      if (finishing) return
      finishing = true
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const response = await fetch(`/api/verification-status?phone=${encodeURIComponent(phoneNumber)}&nid=${encodeURIComponent(documentNumber)}`, { cache: "no-store" })
        const result = await response.json()
        if (result.success === true && result.data?.nidVerified === true && result.data?.nidNumber === documentNumber) {
          setKycLoading(false)
          sessionStorage.setItem("diditKycApproved", "true")
          if (sessionId) sessionStorage.setItem("diditSessionId", sessionId)
          DiditSdk.shared.close()
          router.replace("/?verified=success")
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      finishing = false
      setKycLoading(false)
      setError("Didit সফল হয়েছে, কিন্তু Sheba server এখনো approval পায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।")
    }

    const handleDiditMessage = (event: MessageEvent) => {
      if (event.data?.type !== "didit:completed" && event.data?.type !== "didit-kyc-result") return
      const status = String(event.data?.status || "").toLowerCase()
      if (["approved", "completed", "success"].includes(status)) void finishVerification(event.data?.sessionId)
    }
    window.addEventListener("message", handleDiditMessage)

    DiditSdk.shared.onComplete = (result) => {
      const status = String(result.session?.status || "").toLowerCase()
      if (result.type === "completed" && ["approved", "completed", "success"].includes(status)) {
        finishVerification(result.session?.sessionId)
      } else if (result.type !== "cancelled") {
        setKycLoading(false)
        setError("পরিচয় যাচাই সম্পন্ন হয়নি। আবার চেষ্টা করুন।")
      }
    }
    DiditSdk.shared.onEvent = (event) => {
      const status = String(event.data?.status || "").toLowerCase()
      if (["didit:completed", "didit:status_updated"].includes(event.type) && ["approved", "completed", "success"].includes(status)) {
        void finishVerification(event.data?.sessionId)
      }
    }

    return () => {
      window.removeEventListener("message", handleDiditMessage)
      DiditSdk.shared.onComplete = undefined
      DiditSdk.shared.onEvent = undefined
      DiditSdk.shared.destroy()
    }
  }, [documentNumber, phoneNumber, router])

  useEffect(() => {
    if (sessionStorage.getItem("diditKycApproved") === "true") setStep(4)
  }, [])

  const startKyc = async () => {
    if (!/^[A-Za-z0-9-]{5,25}$/.test(documentNumber)) {
      setError("সঠিক document number দিন")
      return
    }
    setKycLoading(true)
    setError("")
    try {
      const response = await fetch("/api/kyc/didit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, nidType, documentNumber }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || "KYC session failed")
      const verificationUrl = new URL(data.url)
      const isDiditHost = verificationUrl.hostname === "verification.didit.me" || verificationUrl.hostname === "verify.didit.me"
      if (!isDiditHost) throw new Error("Invalid Didit verification URL")
      sessionStorage.setItem("pendingKyc", JSON.stringify({ nidType, documentNumber }))
      if (data.sessionId) sessionStorage.setItem("diditSessionId", data.sessionId)

      await DiditSdk.shared.startVerification({
        url: verificationUrl.toString(),
        configuration: {
          loggingEnabled: false,
          embedded: false,
          showCloseButton: true,
          closeModalOnComplete: true,
          defaultDocumentCamera: "back",
          defaultLivenessCamera: "front",
          showDocumentCameraSwitchButton: true,
          showLivenessCameraSwitchButton: true,
        },
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "যাচাই শুরু করা যায়নি")
    } finally {
      setKycLoading(false)
    }
  }

  // Skip phone step if coming from OTP
  useEffect(() => {
    const storedPhone = sessionStorage.getItem("phoneNumber") || localStorage.getItem("phoneNumber")
    if (storedPhone) {
      setPhoneNumber(storedPhone)
      // Skip phone step and go directly to name step (OTP already verified this is a new user)
      setStep(2)
    }
  }, [])

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
  sessionStorage.removeItem("appPinVerified")
  sessionStorage.removeItem("pinVerifiedTime")
  localStorage.removeItem("appPinVerified")
  localStorage.removeItem("pinVerifiedTime")
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
    // For regular users, go to PIN setup (step 3)
    // For admin, show account type selection first
    if (isAdmin) {
      setStep(3) // Show account type selection for admin
    } else {
      setAccountType("personal") // Auto-set personal for regular users
      setStep(3) // Go to PIN setup
    }
  }

  const handlePinSubmit = () => {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError("৬ সংখ্যার পিন দিন")
      return
    }
    setError("")
    setStep(4) // Go to confirm PIN page
  }

  const handleConfirmPinSubmit = async () => {
    if (confirmPin !== pin) {
      setError("পিন মিলছে না। আবার চেষ্টা করুন।")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Creating account with phone:", phoneNumber, "name:", fullName)
      
      // Create account directly in Neon database
      const response = await fetch('/api/create-neon-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phoneNumber,
            name: fullName.trim(),
            pin,
            accountType: accountType, // State, Personal, Business, Institution
            nidType,
            documentNumber,
            nidNumber: nidType === "nid" ? documentNumber : undefined,
            nidVerified: sessionStorage.getItem("diditKycApproved") === "true",
            kycSessionId: sessionStorage.getItem("diditSessionId") || "",
          }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log("[v0] Account created successfully in Neon:", phoneNumber)
        
        // Save to localStorage as backup
        saveAccountData(phoneNumber, fullName)
        setCurrentUser(phoneNumber)
        
        // Show success and redirect
        setStep(6)
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        console.error("[v0] Account creation failed:", result.error)
        setError(result.error || "অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে।")
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error("[v0] Error details:", errorMsg)
      console.error("[v0] Full error object:", err)
      
      // Show more specific error message
      if (errorMsg.includes("already exists")) {
        setError("এই নম্বরে আগে থেকে অ্যাকাউন্ট আছে। লগইন করুন।")
      } else {
        setError("অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।")
      }
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
      setStep(4) // Go to PIN setup after account type
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
          {step === (isAdmin ? 6 : 5) ? "স��্পন্ন" : "অ্যাকাউন্ট তৈরি করুন"}
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

        {/* Step 3: Identity verification */}
        {step === 3 && (
          <div className="flex h-full flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800">পরিচয় যাচাই করুন</h2>
            <p className="text-sm text-gray-500">NID, document upload এবং facial liveness Didit secure verification-এ সম্পন্ন হবে।</p>
            <select value={nidType} onChange={(e) => setNidType(e.target.value)} className="w-full rounded-xl border-2 border-gray-200 p-4">
<option value="nid">জাতীয় পরিচয়পত্র (NID)</option>
  <option value="driving_license">Driving License</option>
  <option value="passport">Passport</option>
  <option value="student_id">Student ID</option>
            </select>
            <input type="text" inputMode="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value.replace(/[^A-Za-z0-9-]/g, '').slice(0, 25))} placeholder={nidType === "nid" ? "NID Number" : nidType === "driving_license" ? "Driving License Number" : nidType === "passport" ? "Passport Number" : "Student ID Number"} className="w-full rounded-xl border-2 border-gray-200 p-4" maxLength={25} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button onClick={startKyc} disabled={kycLoading || documentNumber.length < 5} className="mt-auto w-full rounded-full bg-[#1FBFFF] py-4 text-lg font-medium text-white disabled:opacity-50">
              {kycLoading ? "যাচাই শুরু হচ্ছে..." : "Document ও Facial Verification"}
            </button>
          </div>
        )}



        {/* Step 4: Create PIN */}
        {step === 4 && (
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

        {/* Step 5: Confirm PIN */}
        {step === 5 && (
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

        {/* Step 6: Success */}
        {step === 6 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">অ্যাকাউন্ট তৈরি সফল!</h2>
            <p className="text-gray-600 text-center mb-8">এখন লগইন করুন</p>
            <button
              onClick={() => {
                router.push("/pin")
              }}
              className="w-32 py-3 bg-[#1FBFFF] text-white rounded-full font-medium"
            >
              লগইন করুন
            </button>
          </div>
        )}

        {/* Step 6: Auto redirect to home */}
        {step === 6 && null}
      </div>
    </div>
  )
}
