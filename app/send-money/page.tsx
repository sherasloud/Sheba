"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import VerificationRequired from "@/components/verification-required"
import { VerifiedBadge } from "@/components/verified-badge"
import {
  getProfileByPhone,
  updateBalance,
  subscribeToBalanceUpdates,
  recordTransaction,
  verifyPin,
  supabaseSendMoney
} from "@/lib/supabase/data-service"
import { ErrorBoundary } from "@/components/error-boundary"

function SendMoneyContent() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const [recipientName, setRecipientName] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [senderPhone, setSenderPhone] = useState("")
  const [recipientVerified, setRecipientVerified] = useState(false)

  const searchParams = useSearchParams()
  const recipient = searchParams.get("recipient")
  const name = searchParams.get("name")
  const fromQR = searchParams.get("from") === "qr_scan"
  const initialStep = searchParams.get("step")

  const loadBalance = async () => {
    const currentPhone = localStorage.getItem("phoneNumber")
    if (!currentPhone) return

    try {
      // ALWAYS fetch balance from Supabase - single source of truth
      const profile = await getProfileByPhone(currentPhone)
      
      if (profile) {
        const bal = Number(profile.balance) || 0
        setBalance(bal)
        // Update cache
        localStorage.setItem(`userBalance_${currentPhone}`, bal.toString())
        localStorage.setItem("userBalance", bal.toString())
      } else {
        // No profile in Supabase = 0 balance (DO NOT use localStorage)
        setBalance(0)
        localStorage.setItem(`userBalance_${currentPhone}`, "0")
        localStorage.setItem("userBalance", "0")
      }
    } catch {
      // On error, set to 0 (DO NOT use corrupted localStorage)
      setBalance(0)
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")
    const currentPhone = localStorage.getItem("phoneNumber")

    if (currentPhone) {
      setSenderPhone(currentPhone)
    }

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }

    loadBalance()

    // Subscribe to realtime balance updates from Supabase
    let unsubscribe: (() => void) | null = null
    if (currentPhone) {
      unsubscribe = subscribeToBalanceUpdates(currentPhone, (newBalance) => {
        setBalance(newBalance)
      })
    }

    if (fromQR && recipient && name) {
      setPhoneNumber(recipient)
      setRecipientName(name)
      setStep(2)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [recipient, name, fromQR, initialStep])

  useEffect(() => {
    setError("")
  }, [phoneNumber, amount, pin])

  const handleNextStep = async () => {
    if (step === 1) {
      if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
        setError("সঠিক ১১ সংখ্যার ফোন নম্বর দিন")
        return
      }

      // Check if recipient exists, if so get their name and verification status
      try {
        const recipientProfile = await getProfileByPhone(phoneNumber)
        if (recipientProfile) {
          setRecipientName(recipientProfile.name)
        } else {
          setRecipientName(`User ${phoneNumber.slice(-4)}`)
        }
        
        // Fetch verification status from API for accurate data
        const response = await fetch(`/api/verification-status?phone=${encodeURIComponent(phoneNumber)}`)
        const result = await response.json()
        
        if (response.ok && result.success && result.data) {
          setRecipientVerified(result.data.isVerified === true)
        } else {
          setRecipientVerified(false)
        }
      } catch (error) {
        console.error("[v0] Error fetching recipient verification:", error)
        setRecipientName(`User ${phoneNumber.slice(-4)}`)
        setRecipientVerified(false)
      }

      setStep(2)
    } else if (step === 2) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError("সঠিক পরিমাণ দিন")
        return
      }

      // Refresh balance from Supabase before checking
      await loadBalance()

      // Calculate commission if State account (5 BDT per 1000 BDT)
      const senderProfile = await getProfileByPhone(senderPhone)
      let totalDebit = Number(amount)
      
      if (senderProfile?.account_type === "state") {
        const commission = Math.ceil(Number(amount) / 1000) * 5
        totalDebit = Number(amount) + commission
      }

      if (totalDebit > balance) {
        setError(`অপর্যাপ্ত ব্যালেন্স! প্রয়োজন: ৳ ${totalDebit.toLocaleString()}, আপনার ব্যালেন্স: ৳ ${balance.toLocaleString()}`)
        return
      }

      setStep(3)
    }
  }

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSendMoney = async () => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError("৬ সংখ্যার পিন দিন")
      return
    }

    setIsTransferring(true)
    setError("")

    try {
      // Verify PIN first
      const isPinValid = await verifyPin(senderPhone, pin)
      if (!isPinValid) {
        setError("ভুল পিন। আবার চেষ্টা করুন।")
        setIsTransferring(false)
        return
      }

      // Send money via Supabase
      const result = await supabaseSendMoney(
        senderPhone,
        phoneNumber,
        Number(amount),
        `TXN${Date.now()}`
      )

      if (result.success) {
        const txnId = result.transaction?.reference || `TXN${Date.now()}`
        setTransactionId(txnId)
        
        // Record transaction in database
        await recordTransaction(
          senderPhone,
          phoneNumber,
          Number(amount),
          "send_money",
          txnId
        )
        
        // Refresh balance
        await loadBalance()
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent("newTransaction", {
          detail: {
            type: "send_money",
            amount: Number(amount),
            to: phoneNumber,
          }
        }))

        setSuccess(true)
      } else {
        setError(result.error || "লেনদেন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
      }
    } catch {
      setError("সার্ভারে সমস্যা। আবার চেষ্টা করুন।")
    } finally {
      setIsTransferring(false)
    }
  }

  if (success) {
    return (
      <div className="mobile-page">
        <div className="mobile-header">
          <Link href="/" className="mr-4 touch-manipulation">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-lg font-medium">Send Money</div>
        </div>

        <div className="mobile-content flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#29a9eb] rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2">সফল!</h2>
          <p className="text-gray-600 mb-4 text-center">টাকা সফলভাবে পাঠানো হয়েছে</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">পরিমাণ:</span>
              <span className="font-bold">৳ {Number(amount).toLocaleString()}</span>
            </div>
  <div className="flex justify-between mb-2 text-sm items-center">
    <span className="text-gray-600">প্রাপক:</span>
    <div className="flex items-center gap-2">
      <span className="font-bold">{recipientName || phoneNumber}</span>
      <VerifiedBadge isVerified={recipientVerified} size="sm" />
    </div>
  </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">ফোন:</span>
              <span className="font-bold">{phoneNumber}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">আপনার নতুন ব্যালেন্স:</span>
              <span className="font-bold text-green-600">৳ {balance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-bold text-xs">{transactionId}</span>
            </div>
          </div>

          <Link href="/" className="mobile-button">
            হোম এ ফিরে যান
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-page">
      <div className="mobile-header">
        <Link href="/" className="mr-4 touch-manipulation">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-medium">Send Money</div>
      </div>

      {step === 1 && (
        <div className="mobile-content bg-white flex flex-col items-center justify-start px-0 pt-2">
          {/* Header */}
          <div className="text-center mb-3 pt-2">
            <p className="text-base font-bold text-sky-500">Number দিন</p>
          </div>

          {/* Phone Display Dots */}
          <div className="text-center mb-6">
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded bg-sky-500 flex items-center justify-center text-white font-bold text-xs transition-all"
                >
                  {phoneNumber[i] ? phoneNumber[i] : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Number Keypad Grid */}
          <div className="flex flex-col items-center justify-center gap-3">
            {/* Rows 1-3 (1-9) */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => phoneNumber.length < 11 && setPhoneNumber(phoneNumber + num.toString())}
                  className="w-16 h-16 rounded-2xl text-3xl font-bold text-sky-500 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-50"
                  disabled={phoneNumber.length >= 11}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Row with 0 (centered) and Delete */}
            <div className="flex gap-3 justify-center items-center w-fit">
              <div className="w-16"></div>
              <button
                onClick={() => phoneNumber.length < 11 && setPhoneNumber(phoneNumber + '0')}
                className="w-16 h-16 rounded-2xl text-3xl font-bold text-sky-500 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-50 mb-3"
                disabled={phoneNumber.length >= 11}
              >
                0
              </button>
              <button 
                className="w-16 h-16 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center"
                onClick={() => setPhoneNumber(phoneNumber.slice(0, -1))}
              >
                <ArrowLeft size={20} />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}

          {/* Continue Button */}
          <button 
            className="w-4/5 mx-auto py-3 mb-4 bg-[#1FBFFF] text-white rounded-full font-bold text-base hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50"
            onClick={handleNextStep}
            disabled={phoneNumber.length !== 11}
          >
            সামনে যান
          </button>

          {/* Delete Button */}
          <button 
            className="w-4/5 mx-auto py-2 bg-gray-300 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-400 active:scale-95 transition-all mb-4"
            onClick={() => setPhoneNumber(phoneNumber.slice(0, -1))}
          >
            মুছে ফেলুন
          </button>
        </div>
      )}

  {step === 2 && (
  <div className="mobile-content bg-white flex flex-col items-center justify-center">
    {/* Header with decorative lines */}
    <div className="text-center mb-8 pt-6">
      <p className="text-4xl font-bold text-sky-500">Amount দিন</p>
    </div>

    {/* Send to info */}
    <div className="text-center mb-4">
      <p className="text-gray-600 text-sm">Send to: <span className="font-bold text-sky-500">{recipientName || phoneNumber}</span></p>
    </div>

    {fromQR && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="text-sm text-green-800 flex items-center">
          <span className="mr-2">✅</span>
          <span>QR কোড থেকে স্ক্যান করা হয়েছে</span>
        </div>
      </div>
    )}

    {/* Display current amount */}
    {amount && (
      <div className="text-center mb-6 py-4 bg-sky-50 rounded-lg">
        <p className="text-gray-600 text-xs mb-1">Amount</p>
        <p className="text-4xl font-bold text-sky-500">৳ {Number(amount).toLocaleString()}</p>
      </div>
    )}

    {/* Number Keypad */}
    <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
      <div className="grid grid-cols-3 gap-2 w-fit">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => setAmount(amount + num.toString())}
            className="w-16 h-16 rounded-xl text-3xl font-bold text-sky-500 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setAmount(amount + '0')}
          className="w-16 h-16 rounded-xl text-3xl font-bold text-sky-500 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
        >
          0
        </button>
        <button
          onClick={() => setAmount(amount.slice(0, -1))}
          className="w-16 h-16 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
    </div>

    {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}

    {/* Action buttons */}
    <div className="w-full flex justify-center">
      <div className="flex gap-3 mt-6 mb-4 w-full max-w-xs">
        <button 
          className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 active:scale-95 transition-all"
          onClick={() => setStep(1)}
        >
          ফিরে যান
        </button>
        <button 
          className={`flex-1 py-4 px-4 rounded-full font-bold text-white active:scale-95 transition-all ${
            amount && Number(amount) > 0
              ? 'bg-sky-500 hover:bg-sky-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleNextStep}
          disabled={!amount || Number(amount) === 0}
        >
          পরবর্তী
        </button>
      </div>
    </div>
  </div>
)}

      {step === 3 && (
  <div className="mobile-content bg-white flex flex-col items-center justify-center">
    {/* Header */}
    <div className="text-center mb-8 pt-6">
      <p className="text-4xl font-bold text-sky-500">PIN দিন</p>
    </div>

    {/* PIN Display Dots */}
    <div className="text-center mb-8">
      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg bg-[#1FBFFF] flex items-center justify-center text-white font-bold text-lg transition-all"
          >
            {pin[i] ? '•' : ''}
          </div>
        ))}
      </div>
    </div>

          {/* Number Keypad Grid */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
            {/* Grid layout for all 11 buttons */}
            <div className="grid grid-cols-3 gap-2 w-fit">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => pin.length < 6 && setPin(pin + num.toString())}
                  className="w-20 h-20 rounded-2xl text-4xl font-bold text-[#1FBFFF] bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-50"
                  disabled={pin.length >= 6}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => pin.length < 6 && setPin(pin + '0')}
                className="w-20 h-20 rounded-2xl text-4xl font-bold text-[#1FBFFF] bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-50"
                disabled={pin.length >= 6}
              >
                0
              </button>
              <button
                onClick={() => setPin(pin.slice(0, -1))}
                className="w-20 h-20 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center"
              >
                <ArrowLeft size={24} />
              </button>
            </div>
          </div>

    {/* Action Buttons */}
    {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}

    <div className="flex gap-3 mt-6 mb-4 w-full max-w-md px-4">
      <button 
        className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 active:scale-95 transition-all"
        onClick={() => setStep(2)}
      >
        ফিরে যান
      </button>
      <button 
        className={`flex-1 py-4 px-4 rounded-full font-bold text-white active:scale-95 transition-all ${
          pin.length === 6
            ? 'bg-sky-500 hover:bg-sky-600'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        onClick={handleSendMoney}
        disabled={pin.length !== 6 || isTransferring}
      >
        {isTransferring ? "প্রক্রিয়াকরণ..." : "সম্পূর্ণ করি"}
      </button>
    </div>

    {/* Delete Button */}
    <button 
      className="w-4/5 mx-auto py-3 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 active:scale-95 transition-all mb-4"
      onClick={() => setPin(pin.slice(0, -1))}
    >
      মুছে ফেলুন
    </button>
  </div>
)}
    </div>
  )
}

export default function SendMoneyPage() {
  return (
    <ErrorBoundary>
      <SendMoneyContent />
    </ErrorBoundary>
  )
}
