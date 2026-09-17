"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RemittanceAmountPage() {
  const [country, setCountry] = useState<any>(null)
  const [amount, setAmount] = useState<string>("7000")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get selected country from localStorage
    const savedCountry = localStorage.getItem("remittanceCountry")
    if (savedCountry) {
      setCountry(JSON.parse(savedCountry))
    } else {
      router.push("/remittance")
    }
  }, [router])

  const handleContinue = () => {
    if (Number.parseInt(amount) < 7000) {
      alert("Minimum amount is Tk7,000")
      return
    }

    setIsLoading(true)

    // Save amount to localStorage
    localStorage.setItem("remittanceAmount", amount)

    setTimeout(() => {
      router.push("/remittance/recipient")
    }, 1000)
  }

  if (!country) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <Link href="/remittance" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-xl font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  const fee = 299
  const total = Number.parseInt(amount) + fee
  const exchangeRate = Number.parseFloat(country.rate)

  // Google-accurate currency calculation
  const foreignAmount = Number.parseInt(amount) * exchangeRate
  const currencyCode = country.currency

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/remittance" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Enter Amount</div>
      </div>

      <div className="p-4 overflow-y-auto pb-20">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <img
              src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
              alt={`${country.name} flag`}
              className="w-8 h-6 object-cover rounded mr-3"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling.style.display = "inline"
              }}
            />
            <span className="text-2xl mr-3 hidden">{country.flag}</span>
            <div>
              <h3 className="font-medium text-green-800">{country.name}</h3>
              <p className="text-sm text-green-600">
                Exchange Rate: 1 BDT = {country.rate} {country.currency}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Send Amount (BDT)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="7000"
              className="w-full p-4 border rounded-lg text-xl font-medium"
              placeholder="Minimum Tk7,000"
            />
            {Number.parseInt(amount) < 7000 && <p className="text-red-500 text-sm mt-2">Minimum amount is Tk7,000</p>}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3">Transaction Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Send Amount:</span>
                <span className="font-medium">Tk{amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Transfer Fee:</span>
                <span className="font-medium">Tk{fee}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total to Pay:</span>
                <span className="text-blue-600">Tk{total}</span>
              </div>
              <div className="flex justify-between mt-3 pt-2 border-t">
                <span>Recipient Gets:</span>
                <span className="font-semibold text-green-600">
                  {foreignAmount.toFixed(2)} {currencyCode}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Delivery Time: 24-48 hours</p>
              <p>• Exchange rate matches Google rates</p>
              <p>• All fees included in calculation</p>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={isLoading || Number.parseInt(amount) < 7000}
            className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : `Continue with Tk${total}`}
          </button>
        </div>
      </div>
    </div>
  )
}
