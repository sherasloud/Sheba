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
  updateBalance, // Declare the updateBalance variable here
} from "@/lib/supabase/data-service"
import { ErrorBoundary } from "@/components/error-boundary"

function CashoutContent() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const [agentName, setAgentName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [senderPhone, setSenderPhone] = useState("")

  const searchParams = useSearchParams()
  const recipient = searchParams.get("recipient")
  const name = searchParams.get("name")
  const fromQR = searchParams.get("from") === "qr_scan"

  // Calculate fee: 9 taka per 1000 taka
  // State gets 5 tk, Admin gets 4 tk
  const calculateFee = (amount: number) => {
    return Math.ceil(amount / 1000) * 9
  }

  const calculateStateCommission = (amount: number) => {
    return Math.ceil(amount / 1000) * 5 // State gets 5 tk per 1000
  }

  const calculateAdminCommission = (amount: number) => {
    return Math.ceil(amount / 1000) * 4 // Admin gets 4 tk per 1000
  }

  const fee = amount ? calculateFee(Number(amount)) : 0
  const stateCommission = amount ? calculateStateCommission(Number(amount)) : 0
  const adminCommission = amount ? calculateAdminCommission(Number(amount)) : 0
  const totalAmount = amount ? Number(amount) + fee : 0

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
      setAgentName(name)
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

      // Check if agent exists and is a State account
      try {
        const agentProfile = await getProfileByPhone(phoneNumber)
        if (agentProfile) {
          if (agentProfile.account_type !== "state") {
            setError("এই নম্বরে কোনো State এজেন্ট নেই")
            return
          }
          setAgentName(agentProfile.name)
        } else {
          setError("এই নম্বরে কোনো State এজেন্ট নেই")
          return
        }
      } catch {
        setAgentName(`Agent ${phoneNumber.slice(-4)}`)
      }

      setStep(2)
    } else if (step === 2) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError("সঠিক পরিমাণ দিন")
        return
      }

      await loadBalance()

      if (totalAmount > balance) {
        setError(`অপর্যাপ্ত ব্যালেন্স! প্রয়োজন: ৳ ${totalAmount.toLocaleString()}, আপনার ব্যালেন্স: ৳ ${balance.toLocaleString()}`)
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

  const handleCashout = async () => {
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

      // Cashout via Supabase (send to State agent + fee)
      const result = await supabaseSendMoney(
        senderPhone,
        phoneNumber,
        totalAmount,
        `CASHOUT${Date.now()}`
      )

      if (result.success) {
        const txnId = result.transaction?.reference || `CASHOUT${Date.now()}`
        setTransactionId(txnId)
        
        // Recalculate commissions for this amount
        const cashoutAmount = Number(amount)
        const stateComm = Math.ceil(cashoutAmount / 1000) * 5
        const adminComm = Math.ceil(cashoutAmount / 1000) * 4
        
        // Record transaction in database
        await recordTransaction(
          senderPhone,
          phoneNumber,
          totalAmount,
          "cashout",
          txnId
        )
        
        // Distribute commissions
        // State agent gets 5 tk per 1000 tk
        const stateAgent = await getProfileByPhone(phoneNumber)
        if (stateAgent) {
          await updateBalance(phoneNumber, stateAgent.balance + stateComm)
          console.log("[v0] State commission added:", stateComm, "to", phoneNumber)
        }
        
        // Admin gets 4 tk per 1000 tk
        const adminPhone = "01709783145" // Admin phone
        const adminProfile = await getProfileByPhone(adminPhone)
        if (adminProfile) {
          await updateBalance(adminPhone, adminProfile.balance + adminComm)
          console.log("[v0] Admin commission added:", adminComm, "to admin")
        }
        
        await loadBalance()
        
        window.dispatchEvent(new CustomEvent("newTransaction", {
          detail: {
            type: "cashout",
            amount: totalAmount,
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
      setIsProcessing(false)
    }
  }

  if (!isVerified) {
    return <VerificationRequired title="Cashout" />
  }

  if (success) {
    return (
      <div className="mobile-page">
        <div className="mobile-header">
          <Link href="/" className="mr-4 touch-manipulation">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-lg font-medium">Cashout</div>
        </div>

        <div className="mobile-content flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#29a9eb] rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2">সফল!</h2>
          <p className="text-gray-600 mb-4 text-center">ক্যাশআউট সফলভাবে সম্পন্ন হয়েছে</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">ক্যাশআউট পরিমাণ:</span>
              <span className="font-bold">৳ {Number(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">ফি (৳৫/১০০০):</span>
              <span className="font-bold">৳ {fee}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm border-t pt-2">
              <span className="text-gray-600">মোট কাটা:</span>
              <span className="font-bold">৳ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">এজেন্ট:</span>
              <span className="font-bold">{agentName}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">ফোন:</span>
              <span className="font-bold">{phoneNumber}</span>
            </div>
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
        <div className="text-lg font-medium">Cashout</div>
      </div>

      {step === 1 && (
        <div className="mobile-content">
          <div className="text-xl font-bold mb-2">ক্যাশআউট</div>
          <div className="text-gray-600 mb-6 text-sm">ফি: ৳৫ প্রতি ৳১০০০ (State এজেন্ট কমিশন)</div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">📞</div>
            <div className="text-sm font-medium">State এজেন্ট নম্বর</div>
          </div>

          <input
            type="tel"
            placeholder="01XXXXXXXXX"
            className="mobile-input mb-4"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
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
          <div className="text-gray-600 mb-2 text-sm">এজেন্ট: {agentName}</div>
          {fromQR && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-green-800">
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  <span>QR কোড থেকে স্ক্যান করা হয়েছে</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-2 flex items-center">
            <div className="mr-2">৳</div>
            <div className="text-sm font-medium">ক্যাশআউট পরিমাণ (৳)</div>
          </div>

          <input
            type="text"
            className="mobile-input text-center text-xl mb-4"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-blue-800">
              <div className="flex justify-between items-center">
                <span>আপনার ব্যালেন্স:</span>
                <span className="font-bold">৳ {balance.toLocaleString()}</span>
              </div>
              {amount && Number(amount) > 0 && (
                <>
                  <div className="flex justify-between items-center mt-1">
                    <span>ক্যাশআউট:</span>
                    <span>৳ {Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span>ফি (৳৫/১০০০):</span>
                    <span>৳ {fee}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-blue-200">
                    <span>মোট কাটা হবে:</span>
                    <span className="font-bold text-red-600">৳ {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span>বাকি থাকবে:</span>
                    <span className="font-bold text-green-600">৳ {(balance - totalAmount).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

          <div className="flex space-x-2 mt-auto">
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
          <div className="text-gray-600 mb-1 text-sm">ক্যাশআউট: ৳ {Number(amount).toLocaleString()}</div>
          <div className="text-gray-600 mb-1 text-sm">ফি: ৳ {fee}</div>
          <div className="text-gray-600 mb-1 text-sm font-bold">মোট: ৳ {totalAmount.toLocaleString()}</div>
          <div className="text-gray-600 mb-1 text-sm">এজেন্ট: {agentName}</div>
          <div className="text-gray-600 mb-6 text-sm">ফোন: {phoneNumber}</div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">🔒</div>
            <div className="text-sm font-medium">৬ সংখ্যার পিন</div>
          </div>

          <input
            type="password"
            className="mobile-input text-center mb-4"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            placeholder="••••••"
            disabled={isProcessing}
          />

          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

          <div className="flex space-x-2 mt-auto">
            <button
              className="flex-1 border border-gray-300 p-4 rounded-md touch-manipulation bg-transparent"
              onClick={handleBackStep}
              disabled={isProcessing}
            >
              পিছনে
            </button>
            <button className="flex-1 mobile-button" onClick={handleCashout} disabled={isProcessing}>
              {isProcessing ? "প্রক্রিয়াকরণ..." : "ক্যাশআউট করুন"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CashoutPage() {
  return (
    <ErrorBoundary>
      <CashoutContent />
    </ErrorBoundary>
  )
}
