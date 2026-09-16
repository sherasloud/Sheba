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
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/welcome" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Reset PIN</div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {step === 1 && (
          <>
            <div className="text-2xl font-bold mb-2">Forgot Your PIN?</div>
            <div className="text-gray-600 mb-6">Enter your phone number to reset your PIN</div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border rounded-md p-4"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-800 text-sm">
                We'll verify your identity using your NID number and send an OTP to reset your PIN.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button onClick={handlePhoneSubmit} className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto">
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-2xl font-bold mb-2">Verify Identity</div>
            <div className="text-gray-600 mb-6">Enter your NID number for verification</div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">National ID Number</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-4"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  placeholder="Enter your NID number"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-yellow-800 text-sm">
                <strong>Security:</strong> Your NID number must match the one used during account creation.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button onClick={handleNidSubmit} className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto">
              Verify & Send OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-2xl font-bold mb-2">Enter OTP</div>
            <div className="text-gray-600 mb-6">Enter the OTP sent to {phoneNumber}</div>

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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-800 text-sm">
                Didn't receive the OTP? <button className="underline">Resend OTP</button>
              </p>
            </div>

            <button onClick={handleOtpVerify} className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto">
              Verify OTP
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="text-2xl font-bold mb-2">Create New PIN</div>
            <div className="text-gray-600 mb-6">Choose a new 6-digit PIN for your account</div>

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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-yellow-800 text-sm">
                <strong>Security Tips:</strong>
                <br />• Use a unique PIN that you haven't used elsewhere
                <br />• Don't share your PIN with anyone
                <br />• Avoid using obvious numbers like 123456
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button onClick={handlePinReset} className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto">
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

              <h2 className="text-2xl font-bold mb-2">PIN Reset Successful!</h2>
              <p className="text-gray-600 mb-6 text-center">Your PIN has been updated successfully</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full">
                <p className="text-green-800 text-sm text-center">
                  You can now login with your new PIN. Keep it safe and secure!
                </p>
              </div>

              <Link href="/login" className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full text-center">
                Login Now
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
