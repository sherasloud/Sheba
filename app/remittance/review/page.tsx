"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RemittanceReviewPage() {
  const [country, setCountry] = useState<any>(null)
  const [amount, setAmount] = useState<string>("")
  const [recipient, setRecipient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get all data from localStorage
    const savedCountry = localStorage.getItem("remittanceCountry")
    const savedAmount = localStorage.getItem("remittanceAmount")
    const savedRecipient = localStorage.getItem("remittanceRecipient")

    if (savedCountry && savedAmount && savedRecipient) {
      setCountry(JSON.parse(savedCountry))
      setAmount(savedAmount)
      setRecipient(JSON.parse(savedRecipient))
    } else {
      router.push("/remittance")
    }
  }, [router])

  const handleConfirm = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push("/remittance/pin")
    }, 1000)
  }

  if (!country || !recipient) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <Link href="/remittance/recipient" className="mr-4">
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
        <Link href="/remittance/recipient" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Review & Confirm</div>
      </div>

      <div className="p-4 overflow-y-auto pb-20">
        <div className="space-y-4">
          {/* Destination */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Destination</h3>
              <Link href="/remittance" className="text-blue-600 text-sm flex items-center">
                <Edit size={14} className="mr-1" />
                Edit
              </Link>
            </div>
            <div className="flex items-center">
              <img
                src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                alt={`${country.name} flag`}
                className="w-6 h-4 object-cover rounded mr-2"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "inline"
                }}
              />
              <span className="text-lg mr-2 hidden">{country.flag}</span>
              <span className="font-medium">{country.name}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Transfer Amount</h3>
              <Link href="/remittance/amount" className="text-blue-600 text-sm flex items-center">
                <Edit size={14} className="mr-1" />
                Edit
              </Link>
            </div>
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
              <div className="flex justify-between mt-2 pt-2 border-t bg-green-50 -m-2 p-2 rounded">
                <span>Recipient Gets:</span>
                <span className="font-semibold text-green-600">
                  {foreignAmount.toFixed(2)} {currencyCode}
                </span>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Recipient Details</h3>
              <Link href="/remittance/recipient" className="text-blue-600 text-sm flex items-center">
                <Edit size={14} className="mr-1" />
                Edit
              </Link>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium">
                  {recipient.firstName} {recipient.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">{recipient.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-medium">{recipient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="font-medium text-right max-w-[60%]">{recipient.address}</span>
              </div>
              <div className="flex justify-between">
                <span>City:</span>
                <span className="font-medium">{recipient.city}</span>
              </div>
              {recipient.postalCode && (
                <div className="flex justify-between">
                  <span>Postal Code:</span>
                  <span className="font-medium">{recipient.postalCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-1">Important Notice</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Please verify all details are correct</p>
              <p>• Transfer cannot be cancelled once confirmed</p>
              <p>• Delivery time: 24-48 hours</p>
              <p>• You will receive SMS & email confirmation</p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : `Confirm Transfer - Tk${total}`}
          </button>
        </div>
      </div>
    </div>
  )
}
