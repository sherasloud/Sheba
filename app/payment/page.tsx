"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import VerificationRequired from "@/components/verification-required"
import {
  getProfileByPhone,
  sendMoney as supabaseSendMoney,
  verifyPin,
  subscribeToBalanceUpdates,
  recordTransaction,
} from "@/lib/supabase/data-service"
import { ErrorBoundary } from "@/components/error-boundary"

function PaymentContent() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const [recipientName, setRecipientName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [senderPhone, setSenderPhone] = useState("")

  const searchParams = useSearchParams()
  const recipient = searchParams.get("recipient")
  const name = searchParams.get("name")
  const fromQR = searchParams.get("from") === "qr_scan"

  const loadBalance = async () => {
    const currentPhone = localStorage.getItem("phoneNumber")
    if (!currentPhone) return

    try {
      const profile = await getProfileByPhone(currentPhone)

      if (profile) {
        const bal = Number(profile.balance) || 0
        setBalance(bal)
        localStorage.setItem(`userBalance_${currentPhone}`, bal.toString())
        localStorage.setItem("userBalance", bal.toString())
      } else {
        setBalance(0)
      }
    } catch {
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

    // Subscribe to realtime balance updates
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
  }, [recipient, name, fromQR])

  useEffect(() => {
    setError("")
  }, [phoneNumber, amount, pin])

  const handleNextStep = async () => {
    if (step === 1) {
      if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
        setError("সঠিক ১১ সংখ্যার ফোন নম্বর দিন")
        return
      }

      // Check if recipient exists
      try {
        const recipientProfile = await getProfileByPhone(phoneNumber)
        if (recipientProfile) {
          setRecipientName(recipientProfile.name)
        } else {
          setRecipientName(`User ${phoneNumber.slice(-4)}`)
        }
      } catch {
        setRecipientName(`User ${phoneNumber.slice(-4)}`)
      }

      setStep(2)
    } else if (step === 2) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError("সঠিক পরিমাণ দিন")
        return
      }

      await loadBalance()

      if (Number(amount) > balance) {
        setError(
          `অপর্যাপ্ত ব্যালেন্স! প্রয়োজন: ৳ ${Number(amount).toLocaleString()}, আপনার ব্যালেন্স: ৳ ${balance.toLocaleString()}`
        )
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

  const handlePayment = async () => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError("৬ সংখ্যার পিন দিন")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // Verify PIN first
      const isPinValid = await verifyPin(senderPhone, pin)
      if (!isPinValid) {
        setError("ভুল পিন। আবার চেষ্টা করুন।")
        setIsProcessing(false)
        return
      }

      // Payment via Supabase
      const result = await supabaseSendMoney(
        senderPhone,
        phoneNumber,
        Number(amount),
        `PAY${Date.now()}`
      )

      if (result.success) {
        const txnId = result.transaction?.reference || `PAY${Date.now()}`
        setTransactionId(txnId)

        // Record transaction in database
        await recordTransaction(
          senderPhone,
          phoneNumber,
          Number(amount),
          "payment",
          txnId
        )

        await loadBalance()

        window.dispatchEvent(
          new CustomEvent("newTransaction", {
            detail: {
              type: "payment",
              amount: Number(amount),
              to: phoneNumber,
            },
          })
        )

        setSuccess(true)
      } else {
        setError(result.error || "লেনদেন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
      }
    } catch {
      setError("সার্ভারে সমস্যা। আবার চেষ্টা করুন।")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isVerified) {
    return <VerificationRequired title="Payment" />
  }

  if (success) {
    return (
      <div className="mobile-page">
        <div className="mobile-header">
          <Link href="/" className="mr-4 touch-manipulation">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-lg font-medium">Payment</div>
        </div>

        <div className="mobile-content flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#29a9eb] rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2">সফল!</h2>
          <p className="text-gray-600 mb-4 text-center">পেমেন্ট সফলভাবে সম্পন্ন হয়েছে</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">পরিমাণ:</span>
              <span className="font-bold">৳ {Number(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">প্রাপক:</span>
              <span className="font-bold">{recipientName || phoneNumber}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">ফোন:</span>
              <span className="font-bold">{phoneNumber}</span>
            </div>
            {reference && (
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">রেফারেন্স:</span>
                <span className="font-bold">{reference}</span>
              </div>
            )}
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">নতুন ব্যালেন্স:</span>
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
        <div className="text-lg font-medium">Payment</div>
      </div>

      {step === 1 && (
        <div className="mobile-content">
          <div className="text-xl font-bold mb-2">পেমেন্ট করুন</div>
          <div className="text-gray-600 mb-6 text-sm">
            মার্চেন্ট বা ব্যক্তিগত নম্বরে পেমেন্ট করুন
          </div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">📞</div>
            <div className="text-sm font-medium">প্রাপকের ফোন নম্বর</div>
          </div>

          <input
            type="tel"
            placeholder="01XXXXXXXXX"
            className="mobile-input mb-4"
            value={phoneNumber}
            onChange={(e) =>
              setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            maxLength={11}
          />

          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

          <button className="mobile-button mt-auto" onClick={handleNextStep}>
            পরবর্তী
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mobile-content">
          <div className="text-xl font-bold mb-2">পরিমাণ দিন</div>
          <div className="text-gray-600 mb-2 text-sm">
            প্রাপক: {recipientName || phoneNumber}
          </div>
          {fromQR && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-green-800">
                <div className="flex items-center">
                  <span className="mr-2">QR</span>
                  <span>QR কোড থেকে স্ক্যান করা হয়েছে</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-2 flex items-center">
            <div className="mr-2">৳</div>
            <div className="text-sm font-medium">পেমেন্ট পরিমাণ (৳)</div>
          </div>

          <input
            type="text"
            className="mobile-input text-center text-xl mb-4"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
          />

          <div className="mb-2 flex items-center">
            <div className="mr-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="text-sm font-medium">রেফারেন্স (ঐচ্ছিক)</div>
          </div>

          <input
            type="text"
            className="mobile-input mb-4"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Invoice / Order ID"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-blue-800">
              <div className="flex justify-between items-center">
                <span>আপনার ব্যালেন্স:</span>
                <span className="font-bold">৳ {balance.toLocaleString()}</span>
              </div>
              {amount && Number(amount) > 0 && (
                <div className="flex justify-between items-center mt-1 pt-1 border-t border-blue-200">
                  <span>পেমেন্টের পর:</span>
                  <span className="font-bold text-green-600">
                    ৳ {(balance - Number(amount)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

          <div className="flex gap-2 mt-auto">
            <button
              className="flex-1 border border-gray-300 p-4 rounded-md touch-manipulation bg-transparent"
              onClick={handleBackStep}
            >
              পিছনে
            </button>
            <button className="flex-1 mobile-button" onClick={handleNextStep}>
              পরবর্তী
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mobile-content">
          <div className="text-xl font-bold mb-2">পিন দিন</div>
          <div className="text-gray-600 mb-1 text-sm">
            পরিমাণ: ৳ {Number(amount).toLocaleString()}
          </div>
          <div className="text-gray-600 mb-1 text-sm">
            প্রাপক: {recipientName || phoneNumber}
          </div>
          <div className="text-gray-600 mb-1 text-sm">ফোন: {phoneNumber}</div>
          {reference && (
            <div className="text-gray-600 mb-1 text-sm">
              রেফারেন্স: {reference}
            </div>
          )}
          <div className="h-4" />

          <div className="mb-2 flex items-center">
            <div className="mr-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="text-sm font-medium">৬ সংখ্যার পিন</div>
          </div>

          <input
            type="password"
            className="mobile-input text-center mb-4"
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            placeholder="------"
            disabled={isProcessing}
          />

          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

          <div className="flex gap-2 mt-auto">
            <button
              className="flex-1 border border-gray-300 p-4 rounded-md touch-manipulation bg-transparent"
              onClick={handleBackStep}
              disabled={isProcessing}
            >
              পিছনে
            </button>
            <button
              className="flex-1 mobile-button"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "প্রক্রিয়াকরণ..." : "পেমেন্ট করুন"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaymentPage() {
  return (
    <ErrorBoundary>
      <PaymentContent />
    </ErrorBoundary>
  )
}
