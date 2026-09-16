"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function StorePaymentPage() {
  const router = useRouter()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    const details = localStorage.getItem("paymentDetails")
    if (details) {
      setPaymentDetails(JSON.parse(details))
    } else {
      router.push("/payment")
    }
  }, [router])

  const handleConfirm = () => {
    router.push("/payment/pin")
  }

  const handleBack = () => {
    router.push("/payment")
  }

  if (!paymentDetails) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={handleBack} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Payment Details</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Loading...</h2>
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
        <div className="text-xl font-medium">Confirm Payment</div>
      </div>

      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Confirm Your Payment</h2>
          <p className="text-gray-600">Please review the payment details below</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4 border border-gray-200">
              <Image
                src={paymentDetails.store?.logo || "/placeholder.svg"}
                alt={`${paymentDetails.store?.name} logo`}
                width={50}
                height={50}
                className="rounded-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">{paymentDetails.store?.name}</h3>
              <p className="text-gray-600">{paymentDetails.store?.category}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{paymentDetails.orderId}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Payment Amount:</span>
              <span className="text-2xl font-bold text-[#29a9eb]">Tk{paymentDetails.amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium text-lg hover:bg-[#2196d3] transition-colors shadow-md"
          >
            Confirm & Pay
          </button>

          <button
            onClick={handleBack}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-lg font-medium text-lg hover:bg-gray-200 transition-colors"
          >
            Back to Store Selection
          </button>
        </div>
      </div>
    </div>
  )
}
