"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CreditCard } from "lucide-react"

export default function MetroBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const fromStation = searchParams.get("from") || ""
  const toStation = searchParams.get("to") || ""
  const travelDate = searchParams.get("date") || ""
  const passengers = Number(searchParams.get("passengers")) || 1
  const ticketType = searchParams.get("type") || ""
  const totalPrice = Number(searchParams.get("price")) || 0

  const handleProceedToPayment = () => {
    // Store booking details and proceed to payment
    const bookingData = {
      service: "metro",
      from: fromStation,
      to: toStation,
      date: travelDate,
      passengers: passengers,
      ticketType: ticketType,
      totalPrice: totalPrice,
    }

    localStorage.setItem("railBookingData", JSON.stringify(bookingData))
    router.push("/rail-tickets/payment")
  }

  const getTicketTypeName = (type: string) => {
    switch (type) {
      case "single":
        return "Single Journey"
      case "return":
        return "Return Journey"
      case "day-pass":
        return "Day Pass"
      default:
        return type
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-sm mx-auto relative">
      {/* Header */}
      <div className="bg-sky-500 text-white p-4">
        <div className="flex items-center space-x-3 mb-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Booking Details</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Journey Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">🚇 Journey Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Route:</span>
              <span className="font-medium">
                {fromStation} → {toStation}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date(travelDate).toLocaleDateString("en-GB")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket Type:</span>
              <span className="font-medium">{getTicketTypeName(ticketType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Passengers:</span>
              <span className="font-medium">{passengers}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span className="text-sky-500">Tk{totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Important Notes</h3>
          <div className="space-y-1 text-sm text-yellow-700">
            <div>• Carry valid ID proof during travel</div>
            <div>• Tickets are non-refundable</div>
            <div>• Arrive 15 minutes before departure</div>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceedToPayment}
          className="w-full bg-sky-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-sky-600 transition-colors flex items-center justify-center space-x-2"
        >
          <CreditCard size={20} />
          <span>Proceed to Payment - Tk{totalPrice}</span>
        </button>
      </div>
    </div>
  )
}
