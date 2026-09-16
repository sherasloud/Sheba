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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
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

        {/* Amount Display */}
        <div className="text-center mb-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-xs mb-1">Amount (BDT)</p>
          <p className="text-3xl font-bold text-[#29a9eb]">Tk {amount ? Number(amount).toLocaleString() : '0'}</p>
        </div>

        {/* Number Keypad */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 mb-4">
          <div className="grid grid-cols-3 gap-2 w-fit">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setAmount(amount + num.toString())}
                className="w-14 h-14 rounded-lg text-2xl font-bold text-[#29a9eb] bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Row with 0 and Delete */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setAmount(amount + '0')}
              className="w-14 h-14 rounded-lg text-2xl font-bold text-[#29a9eb] bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
            >
              0
            </button>
            <button
              onClick={() => setAmount(amount.slice(0, -1))}
              className="w-14 h-14 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h3 className="font-medium text-sm mb-2">Transaction Summary</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Send Amount:</span>
              <span className="font-medium">Tk{amount || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Transfer Fee:</span>
              <span className="font-medium">Tk{fee}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold text-sm">
              <span>Total to Pay:</span>
              <span className="text-blue-600">Tk{total}</span>
            </div>
            <div className="flex justify-between mt-2 pt-1 border-t">
              <span>Recipient Gets:</span>
              <span className="font-semibold text-green-600">
                {(Number.parseInt(amount || '0') * exchangeRate).toFixed(2)} {currencyCode}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={isLoading || Number.parseInt(amount) < 7000}
          className="w-full bg-[#29a9eb] text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : `Continue`}
        </button>
      </div>
    </div>
  )
}
