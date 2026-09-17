"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, CheckCircle } from "lucide-react"
import Link from "next/link"
import VerificationRequired from "@/components/verification-required"

const banks = [
  {
    name: "Sonali Bank Limited",
    shortName: "Sonali Bank",
    code: "SONALI",
    fee: 15,
    logo: "🏛️",
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Janata Bank Limited",
    shortName: "Janata Bank",
    code: "JANATA",
    fee: 15,
    logo: "🏦",
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Agrani Bank Limited",
    shortName: "Agrani Bank",
    code: "AGRANI",
    fee: 15,
    logo: "🏛️",
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Rupali Bank Limited",
    shortName: "Rupali Bank",
    code: "RUPALI",
    fee: 15,
    logo: "🏦",
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "BRAC Bank Limited",
    shortName: "BRAC Bank",
    code: "BRAC",
    fee: 20,
    logo: "🏢",
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Dutch-Bangla Bank Limited",
    shortName: "Dutch-Bangla Bank",
    code: "DBBL",
    fee: 20,
    logo: "🏦",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    name: "City Bank Limited",
    shortName: "City Bank",
    code: "CITY",
    fee: 25,
    logo: "🏙️",
    color: "bg-gray-100 text-gray-600",
  },
  {
    name: "Eastern Bank Limited",
    shortName: "Eastern Bank",
    code: "EBL",
    fee: 25,
    logo: "🏦",
    color: "bg-teal-100 text-teal-600",
  },
  {
    name: "Prime Bank Limited",
    shortName: "Prime Bank",
    code: "PRIME",
    fee: 25,
    logo: "⭐",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    name: "Southeast Bank Limited",
    shortName: "Southeast Bank",
    code: "SEBL",
    fee: 25,
    logo: "🏦",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "Dhaka Bank Limited",
    shortName: "Dhaka Bank",
    code: "DHAKA",
    fee: 20,
    logo: "🏛️",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    name: "AB Bank Limited",
    shortName: "AB Bank",
    code: "ABBANK",
    fee: 25,
    logo: "🏢",
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "Bank Asia Limited",
    shortName: "Bank Asia",
    code: "BANKASIA",
    fee: 20,
    logo: "🌏",
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Islami Bank Bangladesh Limited",
    shortName: "Islami Bank",
    code: "IBBL",
    fee: 20,
    logo: "🕌",
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Al-Arafah Islami Bank Limited",
    shortName: "Al-Arafah Bank",
    code: "AIBL",
    fee: 20,
    logo: "🕌",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "Social Islami Bank Limited",
    shortName: "Social Islami Bank",
    code: "SIBL",
    fee: 20,
    logo: "🕌",
    color: "bg-teal-100 text-teal-600",
  },
  {
    name: "Standard Chartered Bank",
    shortName: "Standard Chartered",
    code: "SCB",
    fee: 30,
    logo: "🌐",
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "HSBC Bangladesh",
    shortName: "HSBC",
    code: "HSBC",
    fee: 30,
    logo: "🌍",
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Citibank N.A.",
    shortName: "Citibank",
    code: "CITI",
    fee: 35,
    logo: "🏙️",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    name: "Mutual Trust Bank Limited",
    shortName: "MTB",
    code: "MTB",
    fee: 25,
    logo: "🤝",
    color: "bg-purple-100 text-purple-600",
  },
]

export default function BankTransferPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedBank, setSelectedBank] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [recipientDetails, setRecipientDetails] = useState({
    accountNumber: "",
    accountName: "",
    routingNumber: "",
    branch: "",
  })
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

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

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.shortName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleBankSelect = (bank: any) => {
    setSelectedBank(bank)
    setStep(2)
    setError("")
  }

  const handleRecipientNext = () => {
    if (!recipientDetails.accountNumber) {
      setError("Please enter the recipient's account number")
      return
    }

    if (recipientDetails.accountNumber.length < 10) {
      setError("Account number must be at least 10 digits")
      return
    }

    if (!/^\d+$/.test(recipientDetails.accountNumber)) {
      setError("Account number should contain only numbers")
      return
    }

    if (!recipientDetails.accountName.trim()) {
      setError("Please enter the recipient's account name")
      return
    }

    if (recipientDetails.accountName.trim().length < 2) {
      setError("Account name must be at least 2 characters")
      return
    }

    if (!/^[a-zA-Z\s.]+$/.test(recipientDetails.accountName.trim())) {
      setError("Account name should contain only letters, spaces, and dots")
      return
    }

    setStep(3)
    setError("")
  }

  const handleAmountNext = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (Number(amount) < 100) {
      setError("Minimum transfer amount is Tk100")
      return
    }

    if (Number(amount) > 100000) {
      setError("Maximum transfer amount is Tk100,000 per transaction")
      return
    }

    const totalAmount = Number(amount) + selectedBank.fee

    if (totalAmount > balance) {
      setError("Insufficient balance! (Including Tk" + selectedBank.fee + " transfer fee)")
      return
    }

    setStep(4)
    setError("")
  }

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setError("")
    }
  }

  const handleBankTransfer = async () => {
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
      // Simulate bank transfer processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const totalAmount = Number(amount) + selectedBank.fee
      const newBalance = balance - totalAmount
      setBalance(newBalance)
      localStorage.setItem("userBalance", newBalance.toString())

      // Add transaction to history
      const transaction = {
        id: Date.now(),
        type: "Bank Transfer",
        amount: -totalAmount,
        to: `${selectedBank.shortName} - ${recipientDetails.accountNumber}`,
        recipient: recipientDetails.accountName,
        transferAmount: Number(amount),
        fee: selectedBank.fee,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        transactionId: `BT${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
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
      setError("Transfer failed. Please try again.")
    }
  }

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Bank Transfer" />
  }

  if (success) {
    const totalAmount = Number(amount) + selectedBank.fee

    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <Link href="/transfer" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-xl font-medium">Bank Transfer</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
          <p className="text-gray-600 mb-4">Money transferred to bank account</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Bank:</span>
              <span className="font-bold">{selectedBank.shortName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-bold">{recipientDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Account Name:</span>
              <span className="font-bold">{recipientDetails.accountName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Transfer Amount:</span>
              <span className="font-bold">Tk{amount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Transfer Fee:</span>
              <span className="font-bold">Tk{selectedBank.fee}</span>
            </div>
            <div className="flex justify-between mb-2 border-t pt-2">
              <span className="text-gray-600">Total Deducted:</span>
              <span className="font-bold text-red-600">Tk{totalAmount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Your New Balance:</span>
              <span className="font-bold">Tk{balance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-bold">BT{Date.now().toString().slice(-8)}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
            <p className="text-blue-800 text-sm text-center">
              <strong>Processing Time:</strong> Bank transfers usually take 1-3 business days to complete.
              <br />
              <strong>Reference:</strong> Keep this transaction ID for your records.
            </p>
          </div>

          <Link href="/transfer" className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full text-center">
            Done
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        {step > 1 ? (
          <button onClick={handleBackStep} className="mr-4">
            <ArrowLeft size={24} />
          </button>
        ) : (
          <Link href="/transfer" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
        )}
        <div className="text-xl font-medium">Bank Transfer</div>
      </div>

      {step === 1 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Select Bank</div>
          <div className="text-gray-600 mb-6">Choose the recipient's bank</div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search banks..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {filteredBanks.map((bank, index) => (
              <button
                key={index}
                onClick={() => handleBankSelect(bank)}
                className="w-full border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${bank.color}`}>
                    <span className="text-2xl">{bank.logo}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{bank.shortName}</h3>
                    <p className="text-sm text-gray-500">{bank.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Fee</div>
                  <div className="font-bold text-[#29a9eb]">Tk{bank.fee}</div>
                </div>
              </button>
            ))}
          </div>

          {filteredBanks.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <div className="text-gray-500">No banks found for "{searchQuery}"</div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Recipient Details</div>
          <div className="text-gray-600 mb-6 flex items-center">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${selectedBank.color}`}>
              <span className="text-lg">{selectedBank.logo}</span>
            </span>
            Bank: {selectedBank.shortName}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Account Number *</label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={recipientDetails.accountNumber}
                onChange={(e) =>
                  setRecipientDetails({
                    ...recipientDetails,
                    accountNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="Enter recipient's account number"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Account Holder Name *</label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={recipientDetails.accountName}
                onChange={(e) =>
                  setRecipientDetails({
                    ...recipientDetails,
                    accountName: e.target.value,
                  })
                }
                placeholder="Enter account holder's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Branch Name (Optional)</label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={recipientDetails.branch}
                onChange={(e) =>
                  setRecipientDetails({
                    ...recipientDetails,
                    branch: e.target.value,
                  })
                }
                placeholder="Enter branch name if known"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Routing Number (Optional)</label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={recipientDetails.routingNumber}
                onChange={(e) =>
                  setRecipientDetails({
                    ...recipientDetails,
                    routingNumber: e.target.value,
                  })
                }
                placeholder="Enter routing number if required"
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-yellow-800 text-sm">
              <strong>Important:</strong> Please double-check the account number and name. Transfers to wrong accounts
              cannot be reversed easily.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-auto pt-4">
            <button onClick={handleRecipientNext} className="bg-[#29a9eb] text-white p-4 rounded-md w-full">
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Enter Amount</div>
          <div className="text-gray-600 mb-1 flex items-center">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${selectedBank.color}`}>
              <span className="text-sm">{selectedBank.logo}</span>
            </span>
            Bank: {selectedBank.shortName}
          </div>
          <div className="text-gray-600 mb-6">To: {recipientDetails.accountName}</div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">Tk</div>
            <div>Transfer Amount (Tk)</div>
          </div>

          <input
            type="text"
            className="border rounded-md p-4 mb-2 text-center text-2xl"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-blue-800">
              <div>Your Balance: Tk{balance.toLocaleString()}</div>
              {amount && (
                <>
                  <div>Transfer Amount: Tk{Number(amount).toLocaleString()}</div>
                  <div>Transfer Fee: Tk{selectedBank.fee}</div>
                  <div className="font-bold border-t pt-1 mt-1">
                    Total: Tk{(Number(amount) + selectedBank.fee).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-800 mb-2">Transfer Limits</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Minimum: Tk100 per transfer</li>
              <li>• Maximum: Tk100,000 per transfer</li>
              <li>• Daily limit: Tk500,000</li>
              <li>• Processing time: 1-3 business days</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-auto pt-4">
            <button onClick={handleAmountNext} className="bg-[#29a9eb] text-white p-4 rounded-md w-full">
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Confirm Transfer</div>
          <div className="text-gray-600 mb-6">Review details and enter PIN</div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bank:</span>
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${selectedBank.color}`}>
                    <span className="text-sm">{selectedBank.logo}</span>
                  </span>
                  <span className="font-bold">{selectedBank.shortName}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-bold">{recipientDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Name:</span>
                <span className="font-bold">{recipientDetails.accountName}</span>
              </div>
              {recipientDetails.branch && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-bold">{recipientDetails.branch}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfer Amount:</span>
                  <span className="font-bold">Tk{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfer Fee:</span>
                  <span className="font-bold">Tk{selectedBank.fee}</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2 mt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-[#29a9eb]">
                    Tk{(Number(amount) + selectedBank.fee).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">🔒</div>
            <div>6-Digit PIN</div>
          </div>

          <input
            type="password"
            className="border rounded-md p-4 mb-2 text-center"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            placeholder="••••••"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleBankTransfer}
            disabled={isLoading}
            className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto disabled:bg-gray-400"
          >
            {isLoading
              ? "Processing Transfer..."
              : `Transfer Tk${(Number(amount) + selectedBank.fee).toLocaleString()}`}
          </button>
        </div>
      )}
    </div>
  )
}
