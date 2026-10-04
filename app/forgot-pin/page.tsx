"use client"

import { useState } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPinPage() {
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [nidNumber, setNidNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [sentOtp, setSentOtp] = useState("")

  const handlePhoneSubmit = () => {
    if (!phoneNumber) {
      setError("Please enter your phone number")
      return
    }
    if (phoneNumber.length !== 11 || !/^01\d{9}$/.test(phoneNumber)) {
      setError("Please enter a valid 11-digit phone number")
      return
    }
    setStep(2)
  }

  const handleNidSubmit = () => {
    if (!nidNumber) {
      setError("Please enter your NID number")
      return
    }
    if (nidNumber.length < 10) {
      setError("Please enter a valid NID number")
      return
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setSentOtp(otp)
    setSuccess(`OTP sent to ${phoneNumber}: ${otp}`)
    setStep(3)
  }

  const handleOtpVerify = () => {
    if (!otpCode) {
      setError("Please enter the OTP")
      return
    }
    if (otpCode !== sentOtp) {
      setError("Invalid OTP. Please try again.")
      return
    }
    setStep(4)
  }

  const handlePinReset = () => {
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

    // Update PIN in localStorage
    localStorage.setItem("userPIN", newPin)
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
            <div className="mb-2 text-2xl font-normal text-[#10141c]">পিন রিসেট করুন</div>
            <div className="mb-6 text-[#8c96a3]">আপনার ফোন নম্বর দিন</div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  className="w-full rounded-2xl border border-[#b9e6fb] bg-white p-4 text-lg outline-none focus:border-[#38afe8] focus:ring-2 focus:ring-[#b9e6fb]"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button onClick={handlePhoneSubmit} className="mt-auto rounded-full bg-[#38afe8] p-4 text-xl text-white shadow-sm transition-transform active:scale-[0.98]">
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-2 text-2xl font-normal text-[#10141c]">পরিচয় যাচাই করুন</div>
            <div className="mb-6 text-[#8c96a3]">আপনার NID নম্বর দিন</div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">National ID Number</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-[#b9e6fb] bg-white p-4 text-lg outline-none focus:border-[#38afe8] focus:ring-2 focus:ring-[#b9e6fb]"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  placeholder="Enter your NID number"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button onClick={handleNidSubmit} className="mt-auto rounded-full bg-[#38afe8] p-4 text-xl text-white shadow-sm transition-transform active:scale-[0.98]">
              Verify & Send OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-2 text-2xl font-normal text-[#10141c]">OTP দিন</div>
            <div className="mb-6 text-[#8c96a3]">{phoneNumber}-এ পাঠানো OTP দিন</div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">6-Digit OTP</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-4 text-center text-2xl"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                />
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button onClick={handleOtpVerify} className="mt-auto rounded-full bg-[#38afe8] p-4 text-xl text-white shadow-sm transition-transform active:scale-[0.98]">
              Verify OTP
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
