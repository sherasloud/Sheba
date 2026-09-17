"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, AlertTriangle, Search } from "lucide-react"
import { useRouter } from "next/navigation"

const billProviders: { [key: string]: any[] } = {}

export default function BillPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [billDetails, setBillDetails] = useState({
    accountNumber: "",
    customerName: "",
    amount: "",
    dueDate: "",
    billMonth: "",
    providerNumber: "",
  })
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [billInfo, setBillInfo] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [providers, setProviders] = useState<{ [key: string]: any[] }>({})

  useEffect(() => {
    // Load current balance
    const storedBalance = localStorage.getItem("userBalance")
    if (storedBalance) {
      setBalance(Number(storedBalance))
    }
    
    // Load bill providers from database
    loadBillProviders()
  }, [])

  const loadBillProviders = async () => {
    try {
      const response = await fetch('/api/bill-providers')
      if (response.ok) {
        const data = await response.json()
        const grouped: { [key: string]: any[] } = {}
        data.providers?.forEach((p: any) => {
          if (!grouped[p.category]) grouped[p.category] = []
          grouped[p.category].push(p)
        })
        setProviders(grouped)
      }
    } catch (error) {
      console.error("[v0] Failed to load bill providers:", error)
    }
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setStep(2)
    setError("")
  }

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider)
    setStep(3)
    setError("")
  }

  const handleBillInquiry = () => {
    if (!billDetails.accountNumber) {
      setError("অনুগ্রহ করে অ্যাকাউন্ট নম্বর লিখুন")
      return
    }

    if (billDetails.accountNumber.length < 5) {
      setError("অ্যাকাউন্ট নম্বর কমপক্ষে ৫ অক্ষর হতে হবে")
      return
    }
    
    if (!billDetails.providerNumber) {
      setError("অনুগ্রহ করে প্রদানকারীর নম্বর লিখুন")
      return
    }

    if (billDetails.accountNumber.length < 5) {
      setError("Please enter a valid account number")
      return
    }

    setIsLoading(true)
    setError("")

    // Generate mock bill data immediately
    const mockBill = {
      accountNumber: billDetails.accountNumber,
      customerName: "John Doe",
      amount: Math.floor(Math.random() * 5000) + 500,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      billMonth: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: Math.random() > 0.3 ? "Due" : "Overdue",
      lateFee: Math.random() > 0.7 ? Math.floor(Math.random() * 200) + 50 : 0,
    }

    setBillInfo(mockBill)
    setBillDetails({
      ...billDetails,
      customerName: mockBill.customerName,
      amount: mockBill.amount.toString(),
      dueDate: mockBill.dueDate,
      billMonth: mockBill.billMonth,
    })
    setIsLoading(false)
    setStep(4)
  }

  const handlePayBill = () => {
    if (!pin || pin.length !== 6) {
      setError("Please enter your 6-digit PIN")
      return
    }

    const correctPin = localStorage.getItem("userPIN") || "123456"
    if (pin !== correctPin) {
      setError("Incorrect PIN")
      return
    }

    const totalAmount = Number(billDetails.amount) + (billInfo?.lateFee || 0)

    if (totalAmount > balance) {
      setError("Insufficient balance!")
      return
    }

    // Update balance immediately
    const newBalance = balance - totalAmount
    setBalance(newBalance)
    localStorage.setItem("userBalance", newBalance.toString())

    // Add transaction to history
    const transaction = {
      id: Date.now(),
      type: "Bill Payment",
      amount: -totalAmount,
      to: selectedProvider.name,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      details: {
        category: selectedCategory,
        accountNumber: billDetails.accountNumber,
        billMonth: billDetails.billMonth,
        providerNumber: billDetails.providerNumber,
      },
    }

    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
    transactions.push(transaction)
    localStorage.setItem("transactions", JSON.stringify(transactions))

    setSuccess(true)
  }

  const filteredProviders = selectedCategory && providers[selectedCategory]
    ? providers[selectedCategory].filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (provider.fullName && provider.fullName.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : []

  // Success screen
  if (success) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Bill Payment</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your bill has been paid successfully</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Provider:</span>
              <span className="font-bold">{selectedProvider.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-bold">{billDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Bill Amount:</span>
              <span className="font-bold">Tk{billDetails.amount}</span>
            </div>
            {billInfo?.lateFee > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Late Fee:</span>
                <span className="font-bold text-red-600">Tk{billInfo.lateFee}</span>
              </div>
            )}
            <div className="flex justify-between mb-2 border-t pt-2">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-bold text-green-600">
                Tk{Number(billDetails.amount) + (billInfo?.lateFee || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Balance:</span>
              <span className="font-bold">Tk{balance.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full">
            <p className="text-green-800 text-sm text-center">
              <strong>Payment Reference:</strong> {Math.random().toString(36).substring(2, 10).toUpperCase()}
              <br />
              <strong>Transaction ID:</strong> {Math.random().toString(36).substring(2, 15).toUpperCase()}
            </p>
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
    <div className="flex flex-col h-screen bg-white">
      {step === 1 && (
        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-5">
          <div className="mb-8 flex items-center">
            <button onClick={() => router.push("/")} className="text-[#142033]" aria-label="Back to home">
              <ArrowLeft size={34} strokeWidth={1.8} />
            </button>
          </div>
          <h1 className="mb-28 text-center text-6xl font-normal text-[#29a9eb]">বিল পে</h1>

          <div className="space-y-32">
            <button
              onClick={() => handleCategorySelect("electricity")}
              className="flex w-full flex-col items-center gap-5 border-0 bg-transparent text-center transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center text-[76px] leading-none">💡</div>
              <div className="text-center">
                <h3 className="text-4xl font-normal text-foreground">বিদ্যুৎ বিল</h3>
              </div>
            </button>

            <button
              onClick={() => handleCategorySelect("water")}
              className="flex w-full flex-col items-center gap-5 border-0 bg-transparent text-center transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center text-[76px] leading-none">💧</div>
              <div className="text-center">
                <h3 className="text-4xl font-normal text-[#29a9eb]">পানি বিল</h3>
              </div>
            </button>

            <button
              onClick={() => handleCategorySelect("gas")}
              className="flex w-full flex-col items-center gap-5 border-0 bg-transparent text-center transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center text-[76px] leading-none">🔥</div>
              <div className="text-center">
                <h3 className="text-4xl font-normal text-orange-500">গ্যাস বিল</h3>
              </div>
            </button>

          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">
            {selectedCategory === "electricity"
              ? "Electricity Providers"
              : selectedCategory === "water"
                ? "Water Providers"
                : selectedCategory === "gas"
                  ? "Gas Providers"
                  : selectedCategory === "internet"
                    ? "Internet Providers"
                    : "Mobile Providers"}
          </div>
          <div className="text-gray-600 mb-6">Select your service provider</div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {filteredProviders.map((provider, index) => (
              <button
                key={index}
                onClick={() => handleProviderSelect(provider)}
                className="w-full border rounded-lg p-4 flex items-center hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className={`w-12 h-12 ${provider.color} rounded-full flex items-center justify-center mr-4 overflow-hidden`}
                >
                  {provider.isImage ? (
                    <img
                      src={provider.icon || "/placeholder.svg"}
                      alt={provider.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <span className="text-white text-lg">{provider.icon}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{provider.name}</h3>
                  <p className="text-sm text-gray-500">{provider.fullName}</p>
                </div>
              </button>
            ))}
          </div>

          {filteredProviders.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <div className="text-gray-500">No providers found for "{searchQuery}"</div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">বিল বিস্তারিত</div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900"><strong>প্রদানকারী:</strong> {selectedProvider.name}</p>
            <p className="text-sm text-blue-900"><strong>বিভাগ:</strong> {selectedCategory === "electricity" ? "বিদ্যুৎ" : selectedCategory === "water" ? "পানি" : selectedCategory === "gas" ? "গ্যাস" : selectedCategory === "internet" ? "ইন্টারনেট" : "মোবাইল"}</p>
            <p className="text-sm text-blue-900"><strong>প্রদানকারীর নম্বর:</strong> {selectedProvider?.number}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {selectedCategory === "electricity"
                  ? "গ্রাহক/অ্যাকাউন্ট নম্বর"
                  : selectedCategory === "water"
                    ? "গ্রাহক নম্বর"
                    : selectedCategory === "gas"
                      ? "অ্যাকাউন্ট নম্বর"
                      : selectedCategory === "internet"
                        ? "গ্রাহক আইডি"
                        : "মোবাইল নম্বর"}
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-3"
                value={billDetails.accountNumber}
                onChange={(e) => setBillDetails({ ...billDetails, accountNumber: e.target.value })}
                placeholder={
                  selectedCategory === "mobile"
                    ? "01XXXXXXXXX"
                    : selectedCategory === "electricity"
                      ? "আপনার মিটার নম্বর লিখুন"
                      : "আপনার অ্যাকাউন্ট নম্বর লিখুন"
                }
                maxLength={selectedCategory === "mobile" ? 11 : undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">প্রদানকারীর নম্ব��� / ড্যাশবোর্ড অ্যাক্সেস নম্বর</label>
              <input
                type="tel"
                className="w-full border rounded-md p-3"
                value={billDetails.providerNumber || ""}
                onChange={(e) => setBillDetails({ ...billDetails, providerNumber: e.target.value })}
                placeholder={`যেমন: ${selectedProvider?.number || "09666123456"}`}
              />
              <p className="text-xs text-gray-500 mt-1">প্রদানকারীর নম্বর লিখুন যা আপনার ড্যাশবোর্ড অ্যাক্সেস এর জন্য প্রয়োজন</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-yellow-800 text-sm font-medium mb-1">Important</p>
                  <p className="text-yellow-700 text-xs">
                    Make sure to enter the correct{" "}
                    {selectedCategory === "electricity"
                      ? "meter/customer number"
                      : selectedCategory === "mobile"
                        ? "mobile number"
                        : "account number"}{" "}
                    as shown on your bill. Incorrect numbers may result in payment to wrong account.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">📋 Where to find your number:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                {selectedCategory === "electricity" && (
                  <>
                    <li>• Check your electricity bill</li>
                    <li>• Look for "Customer Number" or "Account Number"</li>
                    <li>• Usually 8-12 digits long</li>
                  </>
                )}
                {selectedCategory === "water" && (
                  <>
                    <li>• Check your water bill</li>
                    <li>• Look for "Customer Number"</li>
                    <li>• Usually printed at the top of the bill</li>
                  </>
                )}
                {selectedCategory === "gas" && (
                  <>
                    <li>• Check your gas bill</li>
                    <li>• Look for "Account Number"</li>
                    <li>• Usually 10-15 digits long</li>
                  </>
                )}
                {selectedCategory === "internet" && (
                  <>
                    <li>• Check your internet bill</li>
                    <li>• Look for "Customer ID" or "Account Number"</li>
                    <li>• Contact your ISP if unsure</li>
                  </>
                )}
                {selectedCategory === "mobile" && (
                  <>
                    <li>• Your postpaid mobile number</li>
                    <li>• Must be 11 digits starting with 01</li>
                    <li>• Check your mobile bill for confirmation</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleBillInquiry}
            disabled={isLoading}
            className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto disabled:bg-gray-400"
          >
            {isLoading ? "Checking Bill..." : "Check Bill"}
          </button>
        </div>
      )}

      {step === 4 && billInfo && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Bill Information</div>
          <div className="text-gray-600 mb-6">Review your bill details</div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-bold">{selectedProvider.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-bold">{billInfo.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-bold">{billInfo.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bill Month:</span>
                <span className="font-bold">{billInfo.billMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span className="font-bold">{billInfo.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className={`font-bold ${billInfo.status === "Overdue" ? "text-red-600" : "text-orange-600"}`}>
                  {billInfo.dueDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-bold ${billInfo.status === "Overdue" ? "text-red-600" : "text-orange-600"}`}>
                  {billInfo.status}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Amount:</span>
                  <span className="font-bold">Tk{billInfo.amount}</span>
                </div>
                {billInfo.lateFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late Fee:</span>
                    <span className="font-bold text-red-600">Tk{billInfo.lateFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg border-t pt-2 mt-2">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-[#29a9eb]">Tk{billInfo.amount + billInfo.lateFee}</span>
                </div>
              </div>
            </div>
          </div>

          {billInfo.status === "Overdue" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-red-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium mb-1">Overdue Bill</p>
                  <p className="text-red-700 text-xs">
                    This bill is overdue. Late fee of Tk{billInfo.lateFee} has been added. Pay now to avoid service
                    disconnection.
                  </p>
                </div>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-blue-800">
              <div>Your Balance: Tk{balance.toLocaleString()}</div>
              <div>After Payment: Tk{(balance - (billInfo.amount + billInfo.lateFee)).toLocaleString()}</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handlePayBill}
            disabled={isLoading}
            className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto disabled:bg-gray-400"
          >
            {isLoading ? "Processing Payment..." : `Pay Tk${billInfo.amount + billInfo.lateFee}`}
          </button>
        </div>
      )}
    </div>
  )
}
