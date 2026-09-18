"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import VerificationRequired from "@/components/verification-required"
import { cardProviders } from "@/lib/data/static-data"

export default function AddMoneyPage() {
  // SSLCommerz Payment Gateway Information
  const SSLCOMMERZ_STORE_ID = process.env.NEXT_PUBLIC_SSLCOMMERZ_STORE_ID || "shusto0live"
  const SSLCOMMERZ_SANDBOX_URL = "https://sandbox.sslcommerz.com/EasyCheckOut"
  const SSLCOMMERZ_LIVE_URL = "https://securepay.sslcommerz.com/EasyCheckOut"

  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("")
  const [selectedCardType, setSelectedCardType] = useState("") // New state for selected card type
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState(0)
  const [cardBalance, setCardBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionIdCopied, setTransactionIdCopied] = useState(false)
  const [transactionId, setTransactionId] = useState("")

  // Bank details
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
  })

  // Card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  useEffect(() => {
    const paymentStatus = new URLSearchParams(window.location.search).get("payment")
    if (paymentStatus === "success") {
      const returnedAmount = localStorage.getItem("paystationAmount")
      if (returnedAmount) setAmount(returnedAmount)
      setSuccess(true)
      localStorage.removeItem("paystationAmount")
      localStorage.removeItem("paystationInvoice")
    } else if (paymentStatus === "failed") {
      setError("PayStation payment failed. Please try again.")
    } else if (paymentStatus === "pending") {
      setError("Payment received. Wallet credit is being verified.")
    }

    // Check verification status
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }

    const fetchBalance = async () => {
      const currentPhone = localStorage.getItem("phoneNumber")
      if (currentPhone) {
        try {
          const response = await fetch(`/api/balance?phone=${currentPhone}`)
          const data = await response.json()
          if (data.balance !== undefined) {
            setBalance(data.balance)
            localStorage.setItem("userBalance", data.balance.toString())
            localStorage.setItem(`userBalance_${currentPhone}`, data.balance.toString())
          }
        } catch (error) {
          console.error("[v0] Failed to fetch balance from API:", error)
          // Fallback to localStorage
          const storedBalance = localStorage.getItem("userBalance")
          if (storedBalance) {
            setBalance(Number(storedBalance))
          }
        }
      }
    }

    fetchBalance()

    const storedCardBalance = localStorage.getItem("cardBalance")
    if (storedCardBalance) {
      setCardBalance(Number(storedCardBalance))
    } else {
      const initialCardBalance = 85000 // Tk85,000 initial card balance
      setCardBalance(initialCardBalance)
      localStorage.setItem("cardBalance", initialCardBalance.toString())
    }
  }, [])

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    if (method === "card") {
      setStep(2) // Go to card type selection
    } else {
      setStep(3) // Go directly to amount for bank
    }
    setError("")
  }

  const handleCardTypeSelect = (cardType: string) => {
    setSelectedCardType(cardType)
    localStorage.setItem("selectedCardType", cardType)
    setError("")
    setAmount("")
    setStep(3)
  }

  const handleCardPayment = (userAmountNum: number) => {
    // Calculate total amount with commission (2% SSLCommerz fee)
    const commissionRate = 0.02
    const commission = Math.round(userAmountNum * commissionRate * 100) / 100
    const totalAmount = userAmountNum + commission
    
    const transactionRef = `SHEBA_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    localStorage.setItem("transactionRef", transactionRef)
    localStorage.setItem("addMoneyAmount", String(userAmountNum))
    localStorage.setItem("commissionAmount", String(commission))
    
    // Create and submit form to SSLCommerz
    const form = document.createElement("form")
    form.method = "POST"
    form.action = "https://pay.sslcommerz.com/gwprocess/v4/api.php"
    form.style.display = "none"
    
    const fields: Record<string, string> = {
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: "6A0D6039B299110857",
      total_amount: String(totalAmount), // Send total (user amount + commission)
      currency: "BDT",
      tran_id: transactionRef,
      success_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sslcommerz/success`,
      fail_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sslcommerz/fail`,
      cancel_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/add-money`,
      cus_name: "Customer",
      cus_email: "customer@sheba.com",
      cus_phone: "01000000000",
      cus_add1: "Dhaka",
      ship_name: "Customer",
      ship_add1: "Dhaka",
      shipping_method: "NO",
      product_name: "Add Money to Sheba",
      product_category: "Wallet Top-up",
      product_profile: "general"
    }
    
    console.log("[v0] Form fields:", fields)
    
    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = value
      form.appendChild(input)
    })
    
    document.body.appendChild(form)
    console.log("[v0] Form appended to body, submitting...")
    console.log("[v0] Form action:", form.action)
    console.log("[v0] Form method:", form.method)
    
    // Try to submit
    try {
      form.submit()
      console.log("[v0] Form submitted successfully")
    } catch (err) {
      console.log("[v0] Form submission error:", err)
    }
  }

  const handleAmountNext = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (Number(amount) < 10) {
      setError("Minimum amount is Tk10")
      return
    }

    if (Number(amount) > 50000) {
      setError("Maximum amount is Tk50,000 per transaction")
      return
    }

    // Check card balance for card method
    if (selectedMethod === "card" && Number(amount) > cardBalance) {
      setError(`Insufficient card balance. Please try a lower amount`)
      return
    }

    setStep(4) // Go to details step
    setError("")
  }

  const validateBankDetails = () => {
    if (!bankDetails.bankName) {
      setError("Please select a bank")
      return false
    }
    if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 10) {
      setError("Please enter a valid account number (minimum 10 digits)")
      return false
    }
    if (!/^\d+$/.test(bankDetails.accountNumber)) {
      setError("Account number should contain only numbers")
      return false
    }
    return true
  }

  const validateCardNumberLuhn = (cardNumber: string) => {
    const digits = cardNumber.replace(/\s/g, "")
    if (!/^\d{16}$/.test(digits)) return false

    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(digits[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  const validateCardDetails = () => {
    const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, "")

    if (!cleanCardNumber || cleanCardNumber.length !== 16) {
      setError("Please enter a valid 16-digit card number")
      return false
    }

    if (!validateCardNumberLuhn(cleanCardNumber)) {
      setError("Invalid card number. Please check and try again")
      return false
    }

    if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      setError("Please enter expiry date in MM/YY format")
      return false
    }

    const [month, year] = cardDetails.expiryDate.split("/")
    const expiryDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 1)
    const today = new Date()
    if (expiryDate < today) {
      setError("Card has expired")
      return false
    }

    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      setError("Please enter a valid CVV")
      return false
    }
    if (!cardDetails.cardholderName || cardDetails.cardholderName.length < 2) {
      setError("Please enter cardholder name")
      return false
    }
    return true
  }

  const startPayStationCheckout = async () => {
    const currentPhone = localStorage.getItem("phoneNumber")
    if (!currentPhone) {
      setError("Phone number not found. Please log in again.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      const response = await fetch("/api/paystation/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: currentPhone,
          amount: Number(amount),
          userEmail: userData.email,
          userName: userData.name || cardDetails.cardholderName || "Customer",
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        setError(result.message || "Unable to start PayStation checkout")
        setIsLoading(false)
        return
      }

      localStorage.setItem("paystationInvoice", result.invoiceNumber)
      localStorage.setItem("paystationAmount", String(amount))
      window.location.assign(result.redirectUrl)
    } catch {
      setIsLoading(false)
      setError("Unable to connect to PayStation. Please try again.")
    }
  }

  const handleDetailsNext = () => {
    if (selectedMethod === "card") {
      if (validateCardDetails()) {
        void startPayStationCheckout()
      }
      return
    }

    if (selectedMethod === "bank" && validateBankDetails()) {
      // Bank details are collected first; all Add Money methods use PayStation.
      void startPayStationCheckout()
    }
  }

  const handleBackStep = () => {
    if (step === 5) {
      setStep(4) // From PIN to Details
    } else if (step === 4) {
      setStep(3) // From Details to Amount
    } else if (step === 3) {
      if (selectedMethod === "card") {
        setStep(2) // From Amount (Card) to Card Type Selection
      } else {
        setStep(1) // From Amount (Bank) to Method Selection
      }
    } else if (step === 2) {
      setStep(1) // From Card Type Selection to Method Selection
    } else if (step === 1) {
      router.push("/") // Go back to home if on first step
    }
    setError("") // Clear error on back navigation
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleAddMoney = async () => {
    if (!pin || pin.length !== 6) {
      setError("Please enter your 6-digit PIN")
      return
    }

    const correctPin = localStorage.getItem("userPIN") || "123456"
    if (pin !== correctPin) {
      setError("Incorrect PIN")
      return
    }

    if (selectedMethod === "card") {
      // Check if card has sufficient balance
      if (Number(amount) > cardBalance) {
        setError(`Insufficient card balance. Available: Tk${cardBalance.toLocaleString()}`)
        return
      }

      // Validate all card details are properly filled
      if (!validateCardDetails()) {
        return
      }
    }

    if (selectedMethod === "bank") {
      if (!validateBankDetails()) {
        return
      }
    }

    setIsLoading(true)
    setError("")

    try {
      const currentPhone = localStorage.getItem("phoneNumber")
      if (!currentPhone) {
        setError("Phone number not found. Please log in again.")
        setIsLoading(false)
        return
      }

      const userData = JSON.parse(localStorage.getItem("userData") || "{}")

      if (selectedMethod === "card") {
        const response = await fetch("/api/paystation/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: currentPhone,
            amount: Number(amount),
            userEmail: userData.email,
            userName: userData.name || "Customer",
          }),
        })
        const result = await response.json()
        if (!response.ok || !result.success) {
          setError(result.message || "Unable to start PayStation checkout")
          setIsLoading(false)
          return
        }
        localStorage.setItem("paystationInvoice", result.invoiceNumber)
        localStorage.setItem("paystationAmount", String(amount))
        window.location.assign(result.redirectUrl)
        return
      }

      // Bank flow remains the existing internal balance flow.
      const response = await fetch("/api/add-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: currentPhone,
          amount: Number(amount),
          method: selectedMethod,
          cardType: selectedCardType,
          userEmail: userData.email,
          userName: userData.name || "Customer",
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.message || "Transaction failed. Please try again.")
        setIsLoading(false)
        return
      }

      console.log("[v0] Add Money successful, new balance:", result.newBalance)

      if (selectedMethod === "card") {
        const newCardBalance = cardBalance - Number(amount)
        setCardBalance(newCardBalance)
        localStorage.setItem("cardBalance", newCardBalance.toString())
      }

      const newShebaBalance = result.newBalance
      setBalance(newShebaBalance)
      localStorage.setItem("userBalance", newShebaBalance.toString())
      localStorage.setItem(`userBalance_${currentPhone}`, newShebaBalance.toString())

      const newTransactionId = `SHB${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setTransactionId(newTransactionId)

      const transaction = {
        id: Date.now(),
        transactionId: newTransactionId,
        type: selectedMethod === "card" ? "Card to Sheba" : "Bank to Sheba",
        amount: Number(amount),
        method: selectedMethod === "card" ? `${selectedCardType} Card` : bankDetails.bankName, // Use selected card type
        status: "Completed",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fee: 0,
      }

      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      transactions.push(transaction)
      localStorage.setItem("transactions", JSON.stringify(transactions))

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "userBalance",
          newValue: newShebaBalance.toString(),
          oldValue: balance.toString(),
        }),
      )

      setIsLoading(false)
      setSuccess(true)
    } catch (error) {
      console.error("[v0] Add Money error:", error)
      setIsLoading(false)
      setError("Transaction failed. Please try again.")
    }
  }

  if (success) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Add Money</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-[#29a9eb] rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-[#38afe8] mb-4">Money added successfully</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-[#38afe8]">Amount:</span>
              <span className="font-bold">Tk{amount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[#38afe8]">Method:</span>
              <span className="font-bold">
                {selectedMethod === "card" ? `${selectedCardType} Card` : bankDetails.bankName}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[#38afe8]">Sheba Balance:</span>
              <span className="font-bold">Tk{balance.toLocaleString()}</span>
            </div>
            {selectedMethod === "card" && (
              <div className="flex justify-between mb-2">
                <span className="text-[#38afe8]">Card Balance:</span>
                <span className="font-bold">Tk{cardBalance.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#38afe8]">Transaction ID:</span>
              <span className="font-bold">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </div>
          </div>

          <button onClick={() => router.push("/")} className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white text-[#38afe8]">
      <div className={`flex items-center justify-between px-5 py-5 ${step === 3 || step === 4 ? "bg-[#38afe8]" : "bg-white"}`}>
        <button onClick={() => router.push("/")} className={step === 3 || step === 4 ? "text-white" : "text-[#38afe8]"} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <div className={`text-lg font-medium ${step === 3 || step === 4 ? "text-white" : "text-[#38afe8]"}`}>Add Money</div>
        <div className="w-6" />
      </div>

      {step === 1 && (
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
          <div className="mb-2 text-2xl font-bold text-[#38afe8]">Add Money</div>
          <div className="mb-8 text-sm text-[#38afe8]">Choose a method to add money</div>

          <div className="space-y-4">
            <button
              onClick={() => handleMethodSelect("bank")}
              className="flex w-full items-center rounded-2xl border border-[#eef0f3] bg-white p-4 text-left shadow-[0_4px_14px_rgba(20,32,51,0.04)] transition-colors hover:border-[#38afe8] hover:bg-[#f8fcff]"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e8f7fd] mr-4">
                <span className="text-green-500 text-xl">🏦</span>
              </div>
              <div className="text-left">
                <h3 className="font-medium">Bank To Sheba</h3>
                <p className="text-sm text-[#38afe8]">Add money from your bank account</p>
              </div>
            </button>
            <button
              onClick={() => handleMethodSelect("card")}
              className="flex w-full items-center rounded-2xl border border-[#eef0f3] bg-white p-4 text-left shadow-[0_4px_14px_rgba(20,32,51,0.04)] transition-colors hover:border-[#38afe8] hover:bg-[#f8fcff]"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e8f7fd] mr-4">
                <span className="text-purple-500 text-xl">💳</span>
              </div>
              <div className="text-left">
                <h3 className="font-medium">Card To Sheba</h3>
                <p className="text-sm text-[#38afe8]">Add money from your credit/debit card</p>
              </div>
            </button>

          </div>
        </div>
      )}

      {step === 2 && selectedMethod === "card" && (
        <div className="flex flex-1 flex-col items-center overflow-y-auto bg-white px-6 pb-8 pt-10">
          <h1 className="mb-24 text-center text-4xl font-normal text-[#38afe8]">কার্ড সিলেক্ট করুন</h1>

          <div className="flex w-full max-w-xs flex-col items-center gap-10">
            {cardProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleCardTypeSelect(provider.name)}
                className="flex w-full flex-col items-center p-2"
              >
                <div className="flex h-28 w-full items-center justify-center">
                  <Image
                    src={provider.logo || "/placeholder.svg"}
                    alt={provider.name}
                    width={190}
                    height={100}
                    className="max-h-24 w-auto object-contain"
                  />
                </div>
              </button>
            ))}
          </div>

        </div>
      )}

      {step === 3 && (
        <div className={`flex flex-1 flex-col overflow-y-auto ${selectedMethod === "card" ? "bg-white px-8 pb-8 pt-16" : "px-5 py-6"}`}>
          {selectedMethod === "card" ? (
            <>
              <h1 className="mb-52 text-center text-[3.25rem] font-normal leading-tight text-[#38afe8]">এমাউন্ট লিখুন</h1>
              <div className="mb-24 flex items-center justify-center gap-5 text-black">
                <span className="text-5xl font-normal">Tk</span>
                <input
                  type="text"
                  aria-label="Amount"
                  className="w-full border-0 bg-transparent p-0 text-center text-[14rem] font-normal leading-none text-black outline-none placeholder:text-black"
                  value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                  inputMode="numeric"
                />
              </div>
              {error && <div className="mb-4 text-center text-red-500">{error}</div>}
              <div className="flex justify-center"><button className="mobile-button w-full max-w-sm rounded-full py-5 text-5xl font-normal" onClick={handleAmountNext}>Next</button></div>
            </>
          ) : (
            <>
              <h1 className="mb-24 text-center text-[3.25rem] font-normal leading-tight text-[#38afe8]">এমাউন্ট লিখুন</h1>
              <div className="mb-10 flex items-center justify-center gap-4 text-black">
                <span className="text-5xl font-normal">Tk</span>
                <input
                  type="text"
                  aria-label="Amount"
                  inputMode="numeric"
                  className="h-32 w-full rounded-2xl border-0 bg-transparent p-0 text-center text-[10rem] font-normal leading-none text-black outline-none placeholder:text-black"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="0"
                />
              </div>
              {error && <div className="mb-4 text-center text-red-500">{error}</div>}
              <div className="mt-auto flex justify-center"><button className="mobile-button w-full max-w-sm rounded-full py-5 text-4xl font-normal" onClick={handleAmountNext}>Next</button></div>
            </>
          )}
        </div>
      )}

      {step === 4 && selectedMethod === "bank" && (
        <div className="flex flex-1 flex-col overflow-y-auto bg-white px-6 pb-8 pt-10 text-black">
          <h1 className="mb-4 text-center text-4xl font-normal text-[#38afe8]">ব্যাংক তথ্য</h1>
          <div className="mb-8 text-center text-lg font-medium text-[#38afe8]">Amount: Tk{amount}</div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Bank</label>
              <select
                className="w-full border rounded-md p-3"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              >
                <option value="">Choose your bank</option>
                <option value="Sonali Bank Limited">Sonali Bank Limited</option>
                <option value="Janata Bank Limited">Janata Bank Limited</option>
                <option value="Agrani Bank Limited">Agrani Bank Limited</option>
                <option value="Rupali Bank Limited">Rupali Bank Limited</option>
                <option value="BRAC Bank Limited">BRAC Bank Limited</option>
                <option value="Dutch-Bangla Bank Limited">Dutch-Bangla Bank Limited</option>
                <option value="City Bank Limited">City Bank Limited</option>
                <option value="Eastern Bank Limited">Eastern Bank Limited</option>
                <option value="Prime Bank Limited">Prime Bank Limited</option>
                <option value="Southeast Bank Limited">Southeast Bank Limited</option>
                <option value="Dhaka Bank Limited">Dhaka Bank Limited</option>
                <option value="AB Bank Limited">AB Bank Limited</option>
                <option value="Islami Bank Bangladesh Limited">Islami Bank Bangladesh Limited</option>
                <option value="Al-Arafah Islami Bank Limited">Al-Arafah Islami Bank Limited</option>
                <option value="Social Islami Bank Limited">Social Islami Bank Limited</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, "") })}
                placeholder="Enter your account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Routing Number (Optional)</label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={bankDetails.routingNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                placeholder="Enter routing number if required"
              />
            </div>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex space-x-2 mt-auto">
            <button
              className="flex-1 border border-gray-300 p-4 rounded-md touch-manipulation"
              onClick={handleBackStep}
            >
              Back
            </button>
            <button className="flex-1 mobile-button" onClick={handleDetailsNext}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && selectedMethod === "card" && (
        <div className="flex flex-1 flex-col overflow-y-auto bg-white px-8 pb-8 pt-10">
          <h1 className="mb-24 text-center text-[3.25rem] font-normal leading-[1.2] text-[#38afe8]">কার্ডের তথ্য দিন</h1>

          <div className="space-y-20">
            <div className="relative">
              <input
                type="text"
                aria-label="Card Number"
                className="w-full border-0 bg-transparent px-0 py-0 text-[3rem] font-light text-[#a8a8a8] outline-none placeholder:text-[#a8a8a8]"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                placeholder="Card Number"
                maxLength={19}
              />
              <Image
                src={cardProviders.find((provider) => provider.name === selectedCardType)?.logo || "/placeholder.svg"}
                alt={selectedCardType || "Card"}
                width={135}
                height={75}
                className="absolute -top-4 right-0 max-h-20 w-auto object-contain"
              />
            </div>

            <div className="flex items-start justify-between gap-8">
              <input
                type="text"
                aria-label="Expiration Date"
                className="min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-[2.8rem] font-light text-[#a8a8a8] outline-none placeholder:text-[#a8a8a8]"
                value={cardDetails.expiryDate}
                onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: formatExpiryDate(e.target.value) })}
                placeholder="Expiration Date"
                maxLength={5}
              />
              <input
                type="text"
                aria-label="CVV"
                className="w-32 border-0 bg-transparent px-0 py-0 text-[2.8rem] font-light text-[#a8a8a8] outline-none placeholder:text-[#a8a8a8]"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "") })}
                placeholder="CVV"
                maxLength={3}
              />
            </div>

            <input
              type="text"
              aria-label="Cardholder name"
              className="w-full border-0 bg-transparent px-0 py-0 text-center text-[2.8rem] font-light text-[#a8a8a8] outline-none placeholder:text-[#a8a8a8]"
              value={cardDetails.cardholderName}
              onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
              placeholder="Cardholder name"
            />
          </div>

          {error && <div className="mt-4 text-[#38afe8]">{error}</div>}

          <button className="mt-auto w-full rounded-full bg-[#38afe8] py-5 text-[3.2rem] font-light leading-none text-white" onClick={handleDetailsNext}>
            Next
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
          <div className="text-2xl font-bold mb-2">Enter PIN</div>
          <div className="text-[#38afe8] mb-1">Amount: Tk{amount}</div>
          <div className="text-[#38afe8] mb-8">
            {selectedMethod === "card" ? `From: ${selectedCardType} Card` : `From: ${bankDetails.bankName}`}
          </div>

          {selectedMethod === "card" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-[#38afe8]">
                <div>⚠️ Tk{amount} will be deducted from your card</div>
              </div>
            </div>
          )}

          <div className="mb-2 flex items-center">
            <div className="mr-2">🔒</div>
            <div>6-Digit PIN</div>
          </div>

          <input
            type="password"
            className="border rounded-md p-4 mb-2 text-center"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={6}
            placeholder="••••••"
          />

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex space-x-2 mt-auto">
            <button
              className="flex-1 border border-gray-300 p-4 rounded-md touch-manipulation"
              onClick={handleBackStep}
            >
              Back
            </button>
            <button className="flex-1 mobile-button" onClick={handleAddMoney} disabled={isLoading}>
              {isLoading ? "Processing..." : "Add Money"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
