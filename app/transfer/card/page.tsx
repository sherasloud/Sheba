"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function ShebaToCardPage() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCard, setSelectedCard] = useState("")
  const [dailyTransferred, setDailyTransferred] = useState(0)
  const [remainingLimit, setRemainingLimit] = useState(50000)

  // Card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  useEffect(() => {
    // Check verification status
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }

    // Load current balance
    const storedBalance = localStorage.getItem("userBalance")
    if (storedBalance) {
      setBalance(Number(storedBalance))
    }

    // Load daily transfer data
    const today = new Date().toDateString()
    const dailyTransferData = localStorage.getItem("dailyTransferData")

    if (dailyTransferData) {
      const data = JSON.parse(dailyTransferData)
      if (data.date === today) {
        setDailyTransferred(data.amount)
        setRemainingLimit(50000 - data.amount)
      } else {
        // New day, reset daily transfer
        setDailyTransferred(0)
        setRemainingLimit(50000)
        localStorage.setItem(
          "dailyTransferData",
          JSON.stringify({
            date: today,
            amount: 0,
          }),
        )
      }
    } else {
      // First time, set daily transfer data
      setDailyTransferred(0)
      setRemainingLimit(50000)
      localStorage.setItem(
        "dailyTransferData",
        JSON.stringify({
          date: today,
          amount: 0,
        }),
      )
    }
  }, [])

  const handleAmountNext = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (Number(amount) < 10) {
      setError("Minimum amount is Tk10")
      return
    }

    if (Number(amount) > remainingLimit) {
      setError(`Daily limit exceeded. You can transfer maximum Tk${remainingLimit.toLocaleString()} today`)
      return
    }

    if (Number(amount) > balance) {
      setError("Insufficient balance")
      return
    }

    setStep(2)
    setError("")
  }

  const handleCardSelect = (card: string) => {
    setSelectedCard(card)
    setStep(3)
  }

  const validateCardDetails = () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) {
      setError("Please enter a valid card number")
      return false
    }
    if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
      setError("Please enter a valid expiry date")
      return false
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      setError("Please enter a valid CVV")
      return false
    }
    if (!cardDetails.cardholderName) {
      setError("Please enter the cardholder name")
      return false
    }
    return true
  }

  const handleDetailsNext = () => {
    if (validateCardDetails()) {
      setStep(4)
      setError("")
    }
  }

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleTransfer = async () => {
    if (!pin || pin.length !== 6) {
      setError("Please enter your 6-digit PIN")
      return
    }

    const correctPin = localStorage.getItem("userPIN") || "123456"
    if (pin !== correctPin) {
      setError("Incorrect PIN")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate real API call for fund transfer
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Deduct from Sheba balance
      const newBalance = balance - Number(amount)
      setBalance(newBalance)
      localStorage.setItem("userBalance", newBalance.toString())

      // Update daily transfer limit
      const today = new Date().toDateString()
      const newDailyTransferred = dailyTransferred + Number(amount)
      setDailyTransferred(newDailyTransferred)
      setRemainingLimit(50000 - newDailyTransferred)

      localStorage.setItem(
        "dailyTransferData",
        JSON.stringify({
          date: today,
          amount: newDailyTransferred,
        }),
      )

      // Add transaction to history
      const transaction = {
        id: Date.now(),
        transactionId: `SHB${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: "Sheba to Card",
        amount: -Number(amount),
        method: selectedCard,
        status: "Completed",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fee: 0,
      }

      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      transactions.push(transaction)
      localStorage.setItem("transactions", JSON.stringify(transactions))

      // Trigger storage event for other tabs/windows
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "userBalance",
          newValue: newBalance.toString(),
          oldValue: balance.toString(),
        }),
      )

      setIsLoading(false)
      setSuccess(true)
    } catch (error) {
      setIsLoading(false)
      setError("Transaction failed. Please try again.")
    }
  }

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Sheba to Card" />
  }

  if (success) {
    const transactionId = `TRF${Date.now()}`
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Transfer to Card</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 bg-gradient-to-b from-white to-gray-50 px-6 py-8 overflow-y-auto">
          {/* Large Blue Checkmark Circle */}
          <div className="w-24 h-24 bg-[#1E88E5] rounded-full flex items-center justify-center mb-8 shadow-lg flex-shrink-0">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-[#1E88E5] mb-2 text-center">Send Money</h2>
          
          {/* Bengali Success Message */}
          <p className="text-lg font-semibold text-[#1E88E5] mb-2 text-center">সফল হয়েছে !</p>

          {/* Card Number */}
          <p className="text-gray-700 text-center mb-6 font-medium">কার্ড নম্বর</p>
          <p className="text-gray-900 text-xl font-bold mb-8 text-center">{selectedCard || 'XXXX-XXXX-XXXX-1234'}</p>

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
              <span className="text-gray-600">কার্ড:</span>
              <span className="font-bold">{selectedCard}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-3">
              <span className="text-gray-600">নতুন ব্যালেন্স:</span>
              <span className="font-bold text-green-600">৳ {balance.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-[#1E88E5] text-white font-bold py-3 px-6 rounded-lg w-full hover:bg-[#1565C0] transition flex-shrink-0"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={() => router.push("/transfer")} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Sheba to Card</div>
      </div>

      {step === 1 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Enter Amount</div>
          <div className="text-gray-600 mb-8">Transfer from Sheba to Card</div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">Tk</div>
            <div>Amount (Tk)</div>
          </div>

          <input
            type="text"
            className="border rounded-md p-4 mb-2 text-center text-2xl"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600">
              <div>Your Balance: Tk{balance.toLocaleString()}</div>
              {amount && <div>Remaining Balance: Tk{(balance - Number(amount || 0)).toLocaleString()}</div>}
            </div>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex mt-auto">
            <button
              onClick={() => router.push("/transfer")}
              className="flex-1 border border-gray-300 p-4 rounded-md mr-2 text-center"
            >
              Back
            </button>
            <button className="flex-1 bg-[#29a9eb] text-white p-4 rounded-md ml-2" onClick={handleAmountNext}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Select Card Type</div>
          <div className="text-gray-600 mb-8">Amount: Tk{Number(amount).toLocaleString()}</div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleCardSelect("Visa")}
              className="border rounded-lg p-4 flex flex-col items-center hover:bg-gray-50 transition-colors"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                <Image src="/images/visa-logo.png" alt="Visa" width={64} height={64} />
              </div>
              <div>Visa</div>
            </button>

            <button
              onClick={() => handleCardSelect("Mastercard")}
              className="border rounded-lg p-4 flex flex-col items-center hover:bg-gray-50 transition-colors"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                <Image src="/images/mastercard-logo.webp" alt="Mastercard" width={64} height={64} />
              </div>
              <div>Mastercard</div>
            </button>

            <button
              onClick={() => handleCardSelect("American Express")}
              className="border rounded-lg p-4 flex flex-col items-center hover:bg-gray-50 transition-colors"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                <Image src="/images/amex-logo.png" alt="American Express" width={64} height={64} />
              </div>
              <div>Amex</div>
            </button>

            <button
              onClick={() => handleCardSelect("Discover")}
              className="border rounded-lg p-4 flex flex-col items-center hover:bg-gray-50 transition-colors"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                <Image src="/images/discover-logo.jpeg" alt="Discover" width={64} height={64} />
              </div>
              <div>Discover</div>
            </button>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex mt-auto">
            <button className="flex-1 border border-gray-300 p-4 rounded-md mr-2" onClick={handleBackStep}>
              Back
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Card Details</div>
          <div className="text-gray-600 mb-2">Amount: Tk{Number(amount).toLocaleString()}</div>
          <div className="text-gray-600 mb-8">Card Type: {selectedCard}</div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Card Number</label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={cardDetails.cardNumber}
                onChange={(e) =>
                  setCardDetails({
                    ...cardDetails,
                    cardNumber: e.target.value.replace(/\D/g, "").substring(0, 16),
                  })
                }
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-3"
                  value={cardDetails.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "")
                    if (value.length > 2) {
                      value = value.substring(0, 2) + "/" + value.substring(2, 4)
                    }
                    setCardDetails({ ...cardDetails, expiryDate: value })
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">CVV</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-3"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").substring(0, 3) })
                  }
                  placeholder="123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cardholder Name</label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                placeholder="Enter name as on card"
              />
            </div>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex mt-auto">
            <button className="flex-1 border border-gray-300 p-4 rounded-md mr-2" onClick={handleBackStep}>
              Back
            </button>
            <button className="flex-1 bg-[#29a9eb] text-white p-4 rounded-md ml-2" onClick={handleDetailsNext}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Enter PIN</div>
          <div className="text-gray-600 mb-1">Amount: Tk{Number(amount).toLocaleString()}</div>
          <div className="text-gray-600 mb-8">
            To: {selectedCard} card ending in {cardDetails.cardNumber.slice(-4)}
          </div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">🔒</div>
            <div>6-Digit PIN</div>
          </div>

          <input
            type="password"
            className="border rounded-md p-4 mb-2 text-center"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").substring(0, 6))}
            maxLength={6}
            placeholder="••••••"
          />

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex mt-auto">
            <button className="flex-1 border border-gray-300 p-4 rounded-md mr-2" onClick={handleBackStep}>
              Back
            </button>
            <button
              className="flex-1 bg-[#29a9eb] text-white p-4 rounded-md ml-2"
              onClick={handleTransfer}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Transfer"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
