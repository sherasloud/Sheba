"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react"
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
          const category = String(p.category).toLowerCase()
          if (!grouped[category]) grouped[category] = []
          grouped[category].push(p)
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

    setIsLoading(false)
    setError(`${selectedProvider.name} এর real-time bill inquiry এখনো connected নয়। Provider API enable হলে এখানে আসল bill amount, due date এবং customer তথ্য দেখাবে।`)
  }

  const handlePayBill = async () => {
    if (!pin || pin.length !== 6) {
      setError("অনুগ্রহ করে ৬ সংখ্যার পিন লিখুন")
      return
    }

    const correctPin = localStorage.getItem("userPIN") || "123456"
    if (pin !== correctPin) {
      setError("Incorrect PIN")
      return
    }

    const totalAmount = Number(billInfo.amount) + (billInfo?.lateFee || 0)

    if (totalAmount > balance) {
      setError("Insufficient balance!")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/sohojxpay/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: billDetails.accountNumber,
          providerCode: selectedProvider.number,
          category: selectedCategory,
          amount: totalAmount,
          contactNumber: billDetails.providerNumber,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Payment was not accepted")
      }

      const newBalance = balance - totalAmount
      setBalance(newBalance)
      localStorage.setItem("userBalance", newBalance.toString())

      const transaction = {
        id: Date.now(),
        type: "বিল পরিশোধ",
        amount: -totalAmount,
        to: selectedProvider.name,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        details: {
          category: selectedCategory,
          accountNumber: billDetails.accountNumber,
          billMonth: billDetails.billMonth,
          providerNumber: billDetails.providerNumber,
          providerTransactionId: result.transactionId,
        },
      }

      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      transactions.push(transaction)
      localStorage.setItem("transactions", JSON.stringify(transactions))
      setSuccess(true)
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Payment failed")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProviders = selectedCategory && providers[selectedCategory] ? providers[selectedCategory] : []

  // Success screen
  if (success) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">বিল পরিশোধ</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your bill has been paid successfully</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">বিল প্রদানকারী:</span>
              <span className="font-bold">{selectedProvider.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">অ্যাকাউন্ট নম্বর:</span>
              <span className="font-bold">{billDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">বিলের পরিমাণ:</span>
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
            <button onClick={() => handleCategorySelect("electricity")} className="flex w-full flex-col items-center gap-5 border-0 bg-transparent text-center transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-center text-[76px] leading-none">💡</div>
              <h3 className="text-4xl font-normal text-foreground">বিদ্যুৎ বিল</h3>
            </button>
            <button onClick={() => handleCategorySelect("water")} className="flex w-full flex-col items-center gap-5 border-0 bg-transparent text-center transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-center text-[76px] leading-none">💧</div>
              <h3 className="text-4xl font-normal text-[#29a9eb]">পানি বিল</h3>
            </button>
            <button onClick={() => handleCategorySelect("gas")} className="flex w-full flex-col items-center gap-5 border-0 bg-transparent text-center transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-center text-[76px] leading-none">🔥</div>
              <h3 className="text-4xl font-normal text-orange-500">গ্যাস বিল</h3>
            </button>
          </div>
        </div>
      )}

  {step === 2 && (
  <div className="flex flex-1 flex-col bg-white px-6 pb-10 pt-6 sm:px-10">
  <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
  <button onClick={() => setStep(1)} className="mb-14 flex w-fit items-center gap-2 text-sm font-medium text-[#142033]" aria-label="Back to bill categories">
  <ArrowLeft size={22} strokeWidth={1.8} />
  Back
  </button>
  <div className="mb-16 text-center">
  <p className="mb-4 text-5xl font-normal tracking-tight text-[#36aaf0] sm:text-6xl">বিল পরিশোধ</p>
  <h1 className="text-2xl font-medium text-[#142033] sm:text-3xl">বিল প্রদানকারী নির্বাচন করুন</h1>
  <p className="mt-3 text-sm leading-6 text-slate-500">যে বিদ্যুৎ অ্যাকাউন্টের বিল পরিশোধ করতে চান, সেটি নির্বাচন করুন।</p>
  </div>
  <div className="flex flex-col">
  {filteredProviders.map((provider, index) => (
  <button key={index} onClick={() => handleProviderSelect(provider)} className="group flex min-h-[100px] items-center gap-4 border-0 bg-white px-2 py-5 text-left transition hover:bg-[#f7fcff]">
  <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-transparent ${provider.id === "sohoj-west-zone-postpaid" ? "rounded-full" : "rounded-none"}`}>
  {provider.isImage ? <img src={provider.icon || "/placeholder.svg"} alt={`${provider.name} logo`} className="h-14 w-14 object-contain" /> : <span className="text-xl text-white">{provider.icon}</span>}
  </div>
  <div className="min-w-0 flex-1">
  <div className="truncate text-base font-semibold text-[#142033]">{provider.name}</div>
  <div className="mt-1 truncate text-xs text-slate-500">{provider.fullName || "বিদ্যুৎ সেব�� প্রদানকারী"}</div>
  {provider.source && <div className="mt-2 text-[11px] font-medium text-[#36aaf0]">{provider.source} প্রদানকারী</div>}
  </div>
  </button>
  ))}
  </div>
    </div>
  </div>
  )}

      {step === 3 && (
  <div className="flex flex-1 flex-col bg-white px-6 pb-10 pt-6 sm:px-10">
  <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
  <button onClick={() => setStep(2)} className="mb-14 flex w-fit items-center gap-2 text-sm font-medium text-[#142033]" aria-label="বিল প্রদানকারী নির্বাচনে ফিরে যান">
  <ArrowLeft size={22} strokeWidth={1.8} />
  ফিরে যান
  </button>
  <div className="mb-10 text-center">
  <p className="mb-4 text-5xl font-normal tracking-tight text-[#36aaf0] sm:text-6xl">বিল পরিশোধ</p>
  <h1 className="text-2xl font-medium text-[#142033] sm:text-3xl">বিলের বিস্তারিত দিন</h1>
  <p className="mt-3 text-sm leading-6 text-slate-500">আপনার বিলের তথ্য দিয়ে পরবর্তী ধাপে এগিয়ে যান।</p>
  </div>
  <div className="mb-8 border-y border-[#e5f2f8] py-5 text-sm text-[#142033]">
  <p><strong>প্রদানকারী:</strong> {selectedProvider.name}</p>
  <p className="mt-2"><strong>বিভাগ:</strong> {selectedCategory === "electricity" ? "বিদ্যুৎ" : selectedCategory === "water" ? "পানি" : selectedCategory === "gas" ? "গ্যাস" : selectedCategory === "internet" ? "��ন্টারনেট" : "মোব��ইল"}</p>
  </div>
  <p className="mt-2"><strong>প্রদানকারীর কোড:</strong> {selectedProvider?.number}</p>
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
              <label className="block text-sm font-medium mb-2">বিল প্রদানকারীর নম্বর / ড্যাশবোর্ড অ্যাক্সেস নম্��র</label>
              <input
                type="tel"
                className="w-full border rounded-md p-3"
                value={billDetails.providerNumber || ""}
                onChange={(e) => setBillDetails({ ...billDetails, providerNumber: e.target.value })}
                placeholder={`যেমন: ${selectedProvider?.number || "09666123456"}`}
              />
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
            className="mt-[77px] bg-[#29a9eb] text-white p-4 rounded-md disabled:bg-gray-400"
          >
            {isLoading ? "Checking Bill..." : "Check Bill"}
          </button>
        </div>
      )}

      {step === 4 && billInfo && (
        <div className="p-6 flex flex-col flex-1">
<div className="mb-4 text-center text-5xl font-normal tracking-tight text-[#36aaf0]">বিল পরিশোধ</div>
  <div className="mb-2 text-center text-2xl font-medium text-[#142033]">বিলের বিস্তারিত</div>
  <div className="mb-6 text-center text-gray-600">আপনার বিলের তথ্য যাচাই করুন</div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">বিল প্রদানকারী:</span>
                <span className="font-bold">{selectedProvider.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">অ্যাকাউন্ট নম্বর:</span>
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
                  <span className="text-gray-600">বিলের পরিমাণ:</span>
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
