"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Download, Share2, Home, QrCode } from "lucide-react"

export default function RailSuccessPage() {
  const router = useRouter()
  const [ticketData, setTicketData] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem("railTicketData")
    if (data) {
      setTicketData(JSON.parse(data))
    } else {
      router.push("/rail-tickets")
    }
  }, [router])

  const handleDownloadTicket = () => {
    alert("Ticket downloaded successfully!")
  }

  const handleShareTicket = () => {
    if (navigator.share && ticketData) {
      navigator.share({
        title: "Metro Rail Ticket",
        text: `Metro Rail Ticket - ${ticketData.from} to ${ticketData.to}\nTicket: ${ticketData.ticketNumber}`,
      })
    } else {
      alert("Ticket details copied to clipboard!")
    }
  }

  if (!ticketData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#29a9eb]"></div>
      </div>
    )
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
      {/* Success Header */}
      <div className="bg-green-500 text-white p-6 text-center">
        <CheckCircle size={48} className="mx-auto mb-3" />
        <h1 className="text-xl font-bold">Booking Confirmed!</h1>
        <p className="text-green-100 mt-1">Your metro rail ticket has been booked successfully</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Digital Ticket */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#29a9eb]">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">🚇 DHAKA METRO RAIL</h2>
            <p className="text-sm text-gray-600">Digital Ticket</p>
          </div>

          {/* QR Code Placeholder */}
          <div className="bg-gray-100 rounded-lg p-8 text-center mb-4">
            <QrCode size={80} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Scan at station entry</p>
          </div>

          {/* Ticket Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Ticket Number:</span>
              <span className="font-mono font-bold">{ticketData.ticketNumber}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span className="font-medium">{ticketData.from}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-medium">{ticketData.to}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date(ticketData.date).toLocaleDateString("en-GB")}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Ticket Type:</span>
              <span className="font-medium">{getTicketTypeName(ticketData.ticketType)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Passengers:</span>
              <span className="font-medium">{ticketData.passengers}</span>
            </div>

            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-bold text-[#29a9eb]">Tk{ticketData.totalPrice}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Booking Time:</span>
              <span className="font-medium">{new Date(ticketData.bookingTime).toLocaleString("en-GB")}</span>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">👥 Passenger Details</h3>
          <div className="space-y-2">
            {ticketData.passengerDetails.map((passenger: any, index: number) => (
              <div key={index} className="flex justify-between text-sm border-b pb-2 last:border-b-0">
                <span className="text-gray-600">Passenger {index + 1}:</span>
                <div className="text-right">
                  <div className="font-medium">{passenger.name}</div>
                  <div className="text-gray-500">{passenger.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Instructions */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-[#29a9eb] mb-2">📋 Important Instructions</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <div>• Show this QR code at station entry</div>
            <div>• Carry valid ID proof during travel</div>
            <div>• Ticket valid for selected date only</div>
            <div>• Arrive 15 minutes before departure</div>
            <div>• Keep ticket until exit from destination</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadTicket}
            className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            <Download size={18} />
            <span>Download</span>
          </button>

          <button
            onClick={handleShareTicket}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>

        {/* Home Button */}
        <button
          onClick={() => router.push("/home")}
          className="w-full bg-[#29a9eb] text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Home size={20} />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  )
}
