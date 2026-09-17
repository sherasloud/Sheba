"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import VerificationRequired from "@/components/verification-required"
import { 
  getProfileByPhone, 
  sendMoney as supabaseSendMoney,
  subscribeToBalanceUpdates,
  recordTransaction,
  updateBalance, // Declare the updateBalance variable here
} from "@/lib/supabase/data-service"
import { ErrorBoundary } from "@/components/error-boundary"

function CashoutContent() {
  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (err) {
      console.error('[v0] Sound not available')
    }
  }

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
    return (amount / 1000) * 9 // Proportional: ৳9 per ৳1000
  }

  const calculateStateCommission = (amount: number) => {
    return ((amount / 1000) * 9) * 0.5 // State gets 50% of fee
  }

  const calculateAdminCommission = (amount: number) => {
    return ((amount / 1000) * 9) * 0.5 // Company gets 50% of fee
  }

  const fee = amount ? calculateFee(Number(amount)) : 0
  const stateCommission = amount ? calculateStateCommission(Number(amount)) : 0
  const adminCommission = amount ? calculateAdminCommission(Number(amount)) : 0
  const totalAmount = amount ? Number(amount) + fee : 0

  const loadBalance = async () => {
    const currentPhone = localStorage.getItem("phoneNumber")
    if (!currentPhone) return

    try {
      // Fetch balance from Neon database
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: currentPhone }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          const bal = Number(data.user.balance) || 0
          setBalance(bal)
          localStorage.setItem(`userBalance_${currentPhone}`, bal.toString())
          localStorage.setItem("userBalance", bal.toString())
        } else {
          setBalance(0)
        }
      } else {
        setBalance(0)
      }
    } catch (error) {
      console.error('[v0] Error fetching balance from Neon:', error)
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
        console.log('[v0] Checking agent:', phoneNumber)
        
        // Fetch all users and find matching phone
        const response = await fetch('/api/users-list', {
          cache: 'no-store',
        })
        
        if (!response.ok) throw new Error('Failed to fetch users')
        
        const users = await response.json()
        console.log('[v0] Total users:', users.length)
        console.log('[v0] Users in list:', users.map((u: any) => ({ phone: u.phone, type: u.account_type })))
        
        // Try multiple phone formats
        const phonesToCheck = [
          phoneNumber,
          phoneNumber.replace(/^0/, '88'),
          phoneNumber.replace(/^88/, '0'),
        ]
        
        let agentProfile = null
        for (const phoneToCheck of phonesToCheck) {
          agentProfile = users.find((u: any) => 
            u.phone === phoneToCheck || 
            u.phone?.replace(/^0/, '88') === phoneToCheck.replace(/^0/, '88')
          )
          if (agentProfile) {
            console.log('[v0] Found agent with format:', phoneToCheck)
            break
          }
        }
        
        console.log('[v0] Agent profile found:', agentProfile)
        
        if (agentProfile) {
          const isStateAccount = agentProfile.account_type?.toLowerCase() === "state"
          console.log('[v0] Is state account?', isStateAccount, 'Type:', agentProfile.account_type)
          
          if (!isStateAccount) {
            setError(`এই নম্বরে কোনো State এজেন্ট নেই (Type: ${agentProfile.account_type})`)
            return
          }
          setAgentName(agentProfile.name)
        } else {
          setError("এই নম্বরে কোনো এজেন্ট পাওয়া যায়নি")
          console.log('[v0] Agent not found - checked formats:', phonesToCheck)
          return
        }
      } catch (err) {
        console.error('[v0] Error checking agent:', err)
        setError("এজেন্ট যাচাই করতে ত্রুটি হয়েছে")
        return
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
      // Verify PIN from Neon database via API
      try {
        const trimmedPhone = senderPhone.trim()
        console.log("[v0] PIN verification request:", { phone: trimmedPhone, pin: pin ? "provided" : "missing" })
        
        const pinResponse = await fetch('/api/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: trimmedPhone, pin }),
        })

        const pinData = await pinResponse.json()
        console.log("[v0] PIN verification response:", { 
          status: pinResponse.status, 
          verified: pinData.verified,
          message: pinData.message,
          success: pinData.success
        })

        if (!pinData.verified || !pinResponse.ok) {
          setError(pinData.message || "ভুল পিন। আবার চেষ্টা করুন।")
          setIsProcessing(false)
          return
        }
      } catch (error) {
        console.error('[v0] Error verifying PIN:', error)
        setError("পিন যাচাইকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
        setIsProcessing(false)
        return
      }

      // Cashout via Neon database API
      const cashoutResponse = await fetch('/api/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone,
          amount: totalAmount,
          agentPhone: phoneNumber, // State agent phone
        }),
      })

      const result = await cashoutResponse.json()
      console.log('[v0] Cashout result:', result)

      if (result.success) {
        const txnId = result.transaction?.id || `CASHOUT${Date.now()}`
        setTransactionId(txnId)
        
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

  if (success) {
    // Play sound immediately
    playNotificationSound()
    
    // Dispatch event to notify home page to refresh balance
    console.log('[v0] Dispatching balanceUpdated event')
    window.dispatchEvent(new Event('balanceUpdated'))

    return (
      <div className="mobile-page bg-white">
        <div className="mobile-header">
          <Link href="/" className="mr-4 touch-manipulation">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-lg font-medium">Cashout</div>
        </div>

        <div className="mobile-content flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 min-h-screen px-6 py-8">
          {/* Large Blue Checkmark Circle */}
          <div className="w-24 h-24 bg-[#1E88E5] rounded-full flex items-center justify-center mb-8 shadow-lg">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-[#1E88E5] mb-2 text-center">Cashout</h2>
          
          {/* Bengali Success Message */}
          <p className="text-lg font-semibold text-[#1E88E5] mb-2 text-center">সফল হয়েছে !</p>

          {/* State Number */}
          <p className="text-gray-700 text-center mb-6 font-medium">State নম্বর</p>
          <p className="text-gray-900 text-xl font-bold mb-8 text-center">{phoneNumber}</p>

          {/* Transaction Details */}
          <div className="w-full space-y-4 mb-8">
            <div className="flex justify-between items-center text-gray-800">
              <span className="text-base font-medium">পরিমাণ:</span>
              <span className="text-2xl font-bold text-[#1E88E5]">৳ {Number(amount).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-700">
              <span className="text-sm">তারিখ:</span>
              <div className="text-right">
                <div className="text-lg font-bold text-[#1E88E5]">{new Date().toLocaleDateString('en-BD', { day: '2-digit', month: '2-digit', year: '2-digit' }).split('/').join('.')}</div>
                <div className="text-lg font-bold text-[#1E88E5]">{new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
              </div>
            </div>
          </div>

          {/* Transaction ID */}
          <p className="text-[#1E88E5] text-center font-bold mb-2">Transaction ID:</p>
          <p className="text-gray-900 font-bold text-center mb-8 text-lg">{transactionId}</p>

          {/* Details Box */}
          <div className="bg-gray-100 w-full rounded-lg p-4 mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ফি (৳৫/১০০০):</span>
              <span className="font-bold">৳ {fee}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-3">
              <span className="text-gray-600">মোট কাটা:</span>
              <span className="font-bold">৳ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">এজেন্ট নাম:</span>
              <span className="font-bold">{agentName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">নতুন ব্যালেন্স:</span>
              <span className="font-bold text-green-600">৳ {balance.toLocaleString()}</span>
            </div>
          </div>

          <Link href="/inbox" className="mobile-button w-full bg-[#1E88E5] text-white font-bold py-3 rounded-lg hover:bg-[#1565C0] transition">
            লেনদেনের ইতিহাস দেখুন
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

            {/* Row with 0 and Delete - centered 0 */}
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

          {/* State info */}
          <div className="text-center mb-4">
            <p className="text-gray-600 text-sm">State: <span className="font-bold text-sky-500">{agentName}</span></p>
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
              {fee > 0 && (
                <p className="text-xs text-gray-600 mt-2">Fee: ৳ {fee} | Total: ৳ {totalAmount.toLocaleString()}</p>
              )}
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

          <div className="w-full flex justify-center">
            <div className="flex gap-3 mt-6 mb-4 w-full max-w-xs">
              <button 
                className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 active:scale-95 transition-all"
                onClick={handleBackStep}
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

          <div className="w-full flex justify-center">
            <div className="flex gap-3 mt-6 mb-4 w-full max-w-xs">
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
                onClick={handleCashout}
                disabled={pin.length !== 6 || isProcessing}
              >
                {isProcessing ? "প্রক্রিয়াকরণ..." : "সম্পূর্ণ করি"}
              </button>
            </div>
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

export default function CashoutPage() {
  return (
    <ErrorBoundary>
      <CashoutContent />
    </ErrorBoundary>
  )
}
