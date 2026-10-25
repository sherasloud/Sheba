"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { DiditSdk } from "@didit-protocol/sdk-web"
import Link from "next/link"

export default function ForgotPinPage() {
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [enteredPhone, setEnteredPhone] = useState("")
  const [maskedPhone, setMaskedPhone] = useState("")
  const [kycLoading, setKycLoading] = useState(false)
  const [accountId, setAccountId] = useState("")
  const [nidNumber, setNidNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleNidSubmit = async () => {
  if (!nidNumber) {
      setError("Please enter your NID number")
      return
    }
    if (nidNumber.length < 10) {
      setError("Please enter a valid NID number")
      return
    }

  setError("")
  try {
    const response = await fetch("/api/identity/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nidNumber }),
    })
    const result = await response.json()
    if (!response.ok || !result.matched) {
      setError("এই NID-এর সঙ্গে কোনো Sheba account পাওয়া যায়নি")
      return
    }
    setMaskedPhone(result.maskedPhone)
    setAccountId(result.userId)
    setPhoneNumber(result.phoneNumber || "")
  } catch {
    setError("পরিচয় যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।")
    return
  }

    setStep(2)
  }

  const handlePhoneSubmit = async () => {
    const normalizedPhone = enteredPhone.replace(/\D/g, "")
    if (!/^01\d{9}$/.test(normalizedPhone)) {
      setError("সঠিক ফোন নম্বর দিন")
      return
    }
    const normalizedLinkedPhone = phoneNumber.replace(/\D/g, "")
    if (normalizedPhone !== normalizedLinkedPhone) {
      setError("এই NID-এর সঙ্গে যুক্ত ফোন নম্বরটি সঠিক নয়")
      return
    }
    setError("")
    setStep(3)
  }

  const startDiditRecovery = async () => {
    setKycLoading(true)
    setError("")
    try {
      const response = await fetch("/api/kyc/didit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, nidNumber }),
      })
      const result = await response.json()
      if (!response.ok || !result.url) throw new Error()
      await DiditSdk.shared.startVerification({
        url: result.url,
        configuration: { embedded: false, showCloseButton: true, defaultDocumentCamera: "back", defaultLivenessCamera: "front" },
      })
    } catch {
      setKycLoading(false)
      setError("Didit verification শুরু করা যায়নি")
    }
  }

  useEffect(() => {
    DiditSdk.shared.onComplete = (result) => {
      setKycLoading(false)
      const status = String(result.session?.status || "").toLowerCase()
      if (result.type === "completed" && ["approved", "completed", "success"].includes(status)) setStep(4)
      else if (result.type !== "cancelled") setError("পরিচয় যাচাই সম্পন্ন হয়নি")
    }
    return () => { DiditSdk.shared.onComplete = undefined }
  }, [])

  const handlePinReset = async () => {
    if (!newPin) {
      setError("Please enter a new PIN")
      return
    }
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setError("PIN must be exactly 6 digits")
      return
    }
    if (!confirmPin) {
      setError("Please confirm your new PIN")
      return
    }
    if (newPin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    const response = await fetch("/api/reset-pin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId, phone: phoneNumber, nidNumber, pin: newPin }) })
    if (!response.ok) {
      setError("PIN update করা যায়নি")
      return
    }
    setStep(5)
  }

  return (
    <main className="min-h-[100dvh] overflow-y-auto bg-white text-[#10141c]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[390px] flex-col px-6 pb-8 pt-6">
        <div className="flex items-center">
          <Link href="/" className="text-[#38afe8]" aria-label="Back to PIN">
            <ArrowLeft size={28} />
          </Link>
        </div>
        <div className="flex flex-col items-center pt-10 pb-12">
          <img src="/images/sheba-headline-logo.jpeg" alt="সেবা" className="h-20 w-auto object-contain" />
          <h1 className="mt-10 text-center text-3xl font-normal text-[#38afe8]">পিন ভুলে গেছেন?</h1>
        </div>

      <div className="flex flex-1 flex-col">
        {step === 1 && (
          <>
            <div className="mb-2 text-2xl font-normal text-[#10141c]">পরিচয় যাচাই করুন</div>
            <div className="mb-6 text-[#8c96a3]">আপনার NID দিন এবং facial verification সম্পন্ন করুন</div>
            <input type="text" inputMode="numeric" className="w-full rounded-2xl border border-[#b9e6fb] bg-white p-4 text-lg outline-none focus:border-[#38afe8] focus:ring-2 focus:ring-[#b9e6fb]" value={nidNumber} onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, '').slice(0, 17))} placeholder="NID Number" maxLength={17} />
            {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
            <button onClick={handleNidSubmit} className="mt-auto rounded-full bg-[#38afe8] p-4 text-xl text-white shadow-sm transition-transform active:scale-[0.98]">Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-2 text-2xl font-normal text-[#10141c]">ফোন নম্বর দিন</div>
            <div className="mb-6 text-[#8c96a3]">NID-এর সঙ্গে নিবন্ধিত ফোন নম্বর দিন</div>
            <input type="tel" inputMode="numeric" value={enteredPhone} onChange={(event) => setEnteredPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="01XXXXXXXXX" className="w-full rounded-2xl border border-[#b9e6fb] bg-white p-4 text-lg outline-none focus:border-[#38afe8]" />
            {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
            <button onClick={handlePhoneSubmit} className="mt-auto rounded-full bg-[#38afe8] p-4 text-xl text-white">Next</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-2 text-2xl font-normal text-[#10141c]">পরিচয় যাচাই করুন</div>
            <div className="mb-6 text-[#8c96a3]">NID ও facial verification সম্পন্ন করুন</div>
            {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
            <button disabled={kycLoading} onClick={startDiditRecovery} className="mt-auto rounded-full bg-[#38afe8] p-4 text-xl text-white disabled:opacity-60">
              {kycLoading ? "Verification চলছে…" : "Start Didit Verification"}
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="mb-2 text-2xl font-normal text-[#10141c]">নতুন PIN তৈরি করুন</div>
            <div className="mb-6 text-[#8c96a3]">আপনার নতুন ৬ সংখ্যার PIN দিন</div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New 6-Digit PIN</label>
                <input
                  type="password"
                  className="w-full border rounded-md p-4 text-center text-2xl"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New PIN</label>
                <input
                  type="password"
                  className="w-full border rounded-md p-4 text-center text-2xl"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button onClick={handlePinReset} className="mt-auto rounded-full bg-[#38afe8] p-4 text-xl text-white shadow-sm transition-transform active:scale-[0.98]">
              Reset PIN
            </button>
          </>
        )}

        {step === 5 && (
          <>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} className="text-white" />
              </div>

              <h2 className="mb-2 text-2xl font-normal text-[#10141c]">PIN Reset Successful!</h2>
              <p className="text-gray-600 mb-6 text-center">Your PIN has been updated successfully</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full">
                <p className="text-green-800 text-sm text-center">
                  You can now login with your new PIN. Keep it safe and secure!
                </p>
              </div>

              <Link href="/login" className="w-full rounded-full bg-[#38afe8] px-6 py-3 text-center text-white">
                Login Now
              </Link>
            </div>
          </>
        )}
      </div>
      </div>
    </main>
  )
}
