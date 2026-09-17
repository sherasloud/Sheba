"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DonateAmountPage() {
  const router = useRouter()
  const [selectedCharity, setSelectedCharity] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [charityNumber, setCharityNumber] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("selectedCharity")
    if (stored) {
      try {
        setSelectedCharity(JSON.parse(stored))
      } catch {
        // Fallback if someone saved a plain string in the past
        setSelectedCharity({ name: stored, logo: "" })
      }
    }
  }, [])

  const handleContinue = () => {
    if (!amount) {
      alert("অনুগ্রহ করে পরিমাণ লিখুন")
      return
    }
    
    if (!charityNumber) {
      alert("অনুগ্রহ করে সংস্থার নম্বর লিখুন")
      return
    }

    // Save donation details
    localStorage.setItem(
      "donationDetails",
      JSON.stringify({
        charity: selectedCharity.name,
        charityNumber: charityNumber,
        amount: Number.parseFloat(amount),
        type: "donation",
      }),
    )

    // Instant navigation to PIN
    router.push("/donate/pin")
  }

  const handleBack = () => {
    // Instant back navigation
    router.push("/donate")
  }

  if (!selectedCharity) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/donate")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Donate Amount</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Charity Not Found</h2>
            <button onClick={() => router.push("/donate")} className="text-[#29a9eb]">
              Go back to Donate
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Donate Amount</div>
      </div>

      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900"><strong>সংস্থা:</strong> {selectedCharity.name}</p>
          {selectedCharity.number && (
            <p className="text-sm text-blue-900 mt-2"><strong>যোগাযোগ নম্বর / অ্যাকাউন্ট:</strong> {selectedCharity.number}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">দান এর পরিমাণ (টাকা)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="পরিমাণ লিখুন"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29a9eb]"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[100, 500, 1000, 2000, 5000, 10000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="py-2 px-4 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
              >
                {preset} টাকা
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">সংস্থার যোগাযোগ নম্বর / অ্যাকাউন্ট</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29a9eb]"
              value={charityNumber}
              onChange={(e) => setCharityNumber(e.target.value)}
              placeholder={`যেমন: ${selectedCharity?.number || "09666123456"}`}
            />
            <p className="text-xs text-gray-500 mt-1">সংস্থার নম্বর লিখুন যা অ্যাকাউন্ট যাচাইয়ের জন্য প্রয়োজন</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-green-900 mb-2">Your Impact</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Your donation will help those in need</li>
            <li>• 100% of your donation goes to the charity</li>
            <li>• You will receive a donation receipt</li>
            <li>• Tax benefits may apply</li>
          </ul>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium text-lg mt-8"
        >
          Continue to PIN
        </button>
      </div>
    </div>
  )
}
