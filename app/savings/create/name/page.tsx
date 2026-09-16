"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SavingsNamePage() {
  const router = useRouter()
  const [name, setName] = useState("")

  const handleNext = () => {
    if (name.trim()) {
      localStorage.setItem("savingsName", name)
      router.push("/savings/create/amount")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-[#29a9eb] text-white p-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-medium">Create Savings Goal</h1>
          </div>
        </div>

        {/* Progress */}
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step 1 of 4</span>
            <span>25%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#29a9eb] h-2 rounded-full w-1/4 transition-all duration-300"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Name Your Goal</h2>
              <p className="text-gray-600">What are you saving for?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Savings Goal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Emergency Fund, New Phone, Vacation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
                  maxLength={50}
                />
                <div className="text-right text-xs text-gray-500 mt-1">{name.length}/50</div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Popular goals:</p>
                <div className="flex flex-wrap gap-2">
                  {["Emergency Fund", "New Phone", "Vacation", "Wedding", "Car", "Education"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setName(suggestion)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="mt-6">
            <Button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full bg-[#29a9eb] hover:bg-[#2490d1] text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Set Amount
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
