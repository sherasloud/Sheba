"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function CardToShebaPage() {
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

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    cardType: "",
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
  }, [])

  const handleAmountNext = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (Number(amount) < 100) {
      setError("Minimum amount is Tk100")
      return
    }

    if (Number(amount) > 50000) {
      setError("Maximum amount is Tk50,000 per transaction")
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
      // Simulate card to Sheba transfer
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Add to Sheba balance
      const newBalance = balance + Number(amount)
      setBalance(newBalance)
      localStorage.setItem("userBalance", newBalance.toString())

      // Add transaction to history
      const transaction = {
        id: Date.now(),
        transactionId: `CTS${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: "Card to Sheba",
        amount: Number(amount),
        method: selectedCard,
        status: "Completed",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fee: 0,
      }

      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      transactions.push(transaction)
      localStorage.setItem("transactions", JSON.stringify(transactions))

      // Trigger storage event
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

  const detectCardType = (cardNumber: string) => {
    const firstDigit = cardNumber[0]
    if (firstDigit === "4") return "Visa"
    if (firstDigit === "5") return "Mastercard"
    if (firstDigit === "3") return "American Express"
    if (firstDigit === "6") return "Discover"
    return ""
  }

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 16)
    const cardType = detectCardType(cleaned)
    setCardDetails({
      ...cardDetails,
      cardNumber: cleaned,
      cardType: cardType,
    })
  }

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Card to Sheba" />
  }

  if (success) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Card to Sheba</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-[#29a9eb] rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
          <p className="text-gray-600 mb-4">Money added to your Sheba wallet</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold">Tk{Number(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">From Card:</span>
              <span className="font-bold">{selectedCard}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Your New Balance:</span>
              <span className="font-bold">Tk{balance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-bold">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full text-center"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between px-5 py-5">
        <button onClick={() => router.push("/transfer")} className="text-[#10141c]" aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <div className="text-lg font-medium text-[#38afe8]">Card to Sheba</div>
        <div className="w-6" />
      </div>

      {step === 1 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Enter Amount</div>
          <div className="text-gray-600 mb-8">Add money from Card to Sheba</div>

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
              <div>Current Sheba Balance: Tk{balance.toLocaleString()}</div>
              {amount && <div>New Balance: Tk{(balance + Number(amount || 0)).toLocaleString()}</div>}
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
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 pb-8 pt-10">
          <h1 className="mb-14 text-center text-4xl font-bold text-[#38afe8]">কার্ড দিয়ে টাকা</h1>
          <div className="mb-10 text-sm text-[#9a9da5]">Amount: Tk{Number(amount).toLocaleString()}</div>

          <div className="flex w-full max-w-xs flex-col items-center gap-12">
            <button
              onClick={() => handleCardSelect("Visa")}
              className="flex w-full flex-col items-center rounded-2xl p-2 transition-transform hover:scale-[1.02]"
            >
              <div className="flex h-28 w-full items-center justify-center">
                <Image src="/images/visa-logo.png" alt="Visa" width={190} height={100} />
              </div>
              <div>Visa</div>
            </button>

            <button
              onClick={() => handleCardSelect("Mastercard")}
              className="flex w-full flex-col items-center rounded-2xl p-2 transition-transform hover:scale-[1.02]"
            >
              <div className="flex h-28 w-full items-center justify-center">
                <Image src="/images/mastercard-logo.webp" alt="Mastercard" width={190} height={100} />
              </div>
              <div>Mastercard</div>
            </button>

            <button
              onClick={() => handleCardSelect("American Express")}
              className="flex w-full flex-col items-center rounded-2xl p-2 transition-transform hover:scale-[1.02]"
            >
              <div className="flex h-28 w-full items-center justify-center">
                <Image src="/images/amex-logo.png" alt="American Express" width={190} height={100} />
              </div>
              <div>Amex</div>
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
        <div className="p-6 flex flex-col flex-1 bg-gray-50 overflow-y-auto">
          {/* Card Form Container */}
          <div className="bg-white rounded-lg p-0 mb-6">
            {/* Header with CARDS tab */}
            <div className="flex items-center justify-center bg-[#29a9eb] text-white py-4 px-6 rounded-t-lg">
              <div className="flex gap-8 text-sm font-semibold">
                <div className="border-b-2 border-white pb-2">CARDS</div>
              </div>
            </div>

            {/* Card Type Selection */}
            <div className="px-6 pt-6 pb-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Card Type</div>
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-8 flex items-center justify-center">
                  <Image src="/images/visa-logo.png" alt="Visa" width={40} height={24} />
                </div>
                <div className="w-12 h-8 flex items-center justify-center">
                  <Image src="/images/mastercard-logo.webp" alt="Mastercard" width={40} height={24} />
                </div>
                <div className="w-12 h-8 flex items-center justify-center">
                  <Image src="/images/amex-logo.png" alt="Amex" width={40} height={24} />
                </div>
                <div className="text-xs text-gray-500 flex items-center">Other cards</div>
              </div>
            </div>

            {/* Card Number Input */}
            <div className="px-6 pb-4">
              <input
                type="text"
                className="w-full border rounded-md p-3 text-base"
                value={cardDetails.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="Enter Card Number"
                maxLength={16}
              />
              {cardDetails.cardType && (
                <div className="text-xs text-gray-500 mt-1">Detected: {cardDetails.cardType}</div>
              )}
            </div>

            {/* Hint Text */}
            <div className="px-6 pb-4 text-xs text-gray-600">First digit is 37 or 4 or 5 and rest digits are 1</div>

            {/* Expiry and CVV */}
            <div className="px-6 pb-4 flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full border rounded-md p-3 text-base"
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
                <input
                  type="text"
                  className="w-full border rounded-md p-3 text-base"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").substring(0, 3) })
                  }
                  placeholder="CVC/CVV"
                  maxLength={3}
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="px-6 pb-4">
              <input
                type="text"
                className="w-full border rounded-md p-3 text-base"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                placeholder="Card holder Name"
              />
            </div>

            {/* Save Card Checkbox */}
            <div className="px-6 pb-6 flex items-center gap-2">
              <input type="checkbox" id="saveCard" className="rounded" />
              <label htmlFor="saveCard" className="text-sm text-gray-600">
                Save card & remember me
              </label>
            </div>

            {/* Terms */}
            <div className="px-6 pb-6 text-xs text-gray-500">
              By checking this box you agree to the Terms of Service
            </div>

            {/* Error Message */}
            {error && <div className="px-6 pb-4 text-red-500 text-sm">{error}</div>}

            {/* Pay Button */}
            <button
              className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-b-lg font-semibold"
              onClick={handleDetailsNext}
            >
              PAY {amount ? `Tk${Number(amount).toLocaleString()}` : ""}
            </button>
          </div>

          {/* Back Button */}
          <button className="border border-gray-300 p-3 rounded-md text-center mt-4" onClick={handleBackStep}>
            Back
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Enter PIN</div>
          <div className="text-gray-600 mb-1">Amount: Tk{Number(amount).toLocaleString()}</div>
          <div className="text-gray-600 mb-8">
            From: {selectedCard} card ending in {cardDetails.cardNumber.slice(-4)}
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
              {isLoading ? "Processing..." : "Add Money"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
