"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, Download, Share2, Copy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AirTicketSuccessPage() {
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: "",
    pnr: "",
    airline: "Biman Bangladesh",
    flightNumber: "BG 178",
    departureCity: "Dhaka (DAC)",
    arrivalCity: "Cox's Bazar (CXB)",
    departureDate: new Date().toISOString().split("T")[0],
    departureTime: "08:30",
    arrivalTime: "09:45",
    passengers: 1,
    totalAmount: 0,
    paymentMethod: "Sheba Payment",
    passengerName: "",
  })

  const [copied, setCopied] = useState(false)
  const [flightDetails, setFlightDetails] = useState({ logo: "" })

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      // Get flight details from localStorage
      const storedFlightDetails = localStorage.getItem("selectedFlight")
      const storedSearchData = localStorage.getItem("flightSearchParams")

      if (storedFlightDetails) {
        const flightDetails = JSON.parse(storedFlightDetails)
        let totalPassengers = 1

        // Get passenger count from search data
        if (storedSearchData) {
          const searchData = JSON.parse(storedSearchData)
          totalPassengers = (searchData.adults || 1) + (searchData.children || 0)
        }

        setBookingDetails({
          bookingId:
            flightDetails.bookingId ||
            `BK${Math.floor(Math.random() * 1000000)
              .toString()
              .padStart(6, "0")}`,
          pnr:
            flightDetails.pnr ||
            `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
          airline: flightDetails.airline,
          flightNumber: flightDetails.flightNumber,
          departureCity: flightDetails.from,
          arrivalCity: flightDetails.to,
          departureDate: flightDetails.date,
          departureTime: flightDetails.departureTime,
          arrivalTime: flightDetails.arrivalTime,
          duration: flightDetails.duration,
          stops: flightDetails.stops,
          aircraft: flightDetails.aircraft,
          passengers: totalPassengers,
          totalAmount: flightDetails.totalPrice * totalPassengers,
          paymentMethod: "Sheba Payment",
          passengerName: flightDetails.passengerName,
          passengerEmail: flightDetails.passengerEmail,
          passengerPhone: flightDetails.passengerPhone,
        })
        setFlightDetails({ logo: flightDetails.logo })
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  const copyBookingDetails = () => {
    const detailsText = `
Booking ID: ${bookingDetails.bookingId}
PNR: ${bookingDetails.pnr}
Flight: ${bookingDetails.airline} ${bookingDetails.flightNumber}
From: ${bookingDetails.departureCity}
To: ${bookingDetails.arrivalCity}
Date: ${bookingDetails.departureDate}
Time: ${bookingDetails.departureTime} - ${bookingDetails.arrivalTime}
Passengers: ${bookingDetails.passengers}
Amount Paid: ${formatPrice(bookingDetails.totalAmount)}
    `
    navigator.clipboard.writeText(detailsText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-BD") + " Tk"
  }

  const getPassengerDetails = () => {
    if (typeof window === "undefined") return null

    try {
      const storedSearchData = localStorage.getItem("flightSearchParams")
      if (storedSearchData) {
        const searchData = JSON.parse(storedSearchData)
        const adults = searchData.adults || 1
        const children = searchData.children || 0
        return ` (${adults} Adult${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""})`
      }
    } catch (error) {
      console.error("Error accessing localStorage for passenger details:", error)
    }
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Booking Confirmation</div>
      </div>

      <div className="p-4 flex-1">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={32} className="text-green-500" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-center mb-2">Booking Confirmed!</h1>
          <p className="text-center text-gray-600 mb-6">Your flight has been successfully booked.</p>

          <div className="border-t border-b py-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-medium">{bookingDetails.bookingId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">PNR:</span>
              <span className="font-medium">{bookingDetails.pnr}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-3">Flight Details</h2>

            <div className="flex items-center mb-3">
              <img
                src={flightDetails.logo || "/placeholder.svg"}
                alt={bookingDetails.airline}
                className="w-8 h-8 rounded mr-2"
              />
              <div>
                <div className="font-medium">{bookingDetails.airline}</div>
                <div className="text-xs text-gray-500">{bookingDetails.flightNumber}</div>
              </div>
            </div>

            <div className="flex justify-between mb-4">
              <div className="flex flex-col items-center">
                <div className="font-bold">{bookingDetails.departureTime}</div>
                <div className="text-sm">{bookingDetails.departureCity.split(",")[0]}</div>
              </div>
              <div className="flex flex-col items-center flex-1 px-4">
                <div className="w-full h-0.5 bg-gray-300 relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{bookingDetails.stops}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="font-bold">{bookingDetails.arrivalTime}</div>
                <div className="text-sm">{bookingDetails.arrivalCity.split(",")[0]}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Date:</span>{" "}
              {new Date(bookingDetails.departureDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Duration:</span> {bookingDetails.duration}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Aircraft:</span> {bookingDetails.aircraft}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Passengers:</span> {bookingDetails.passengers}
              {getPassengerDetails()}
            </div>

            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Phone:</span> {bookingDetails.passengerPhone}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Baggage:</span> 25kg Check-in, 7kg Cabin
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-bold mb-3">Payment Details</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-green-600">{formatPrice(bookingDetails.totalAmount)}</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">Important Information</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
              <li>Please arrive at the airport at least 2 hours before departure</li>
              <li>Carry a valid photo ID for security check</li>
              <li>Check-in closes 45 minutes before departure</li>
              <li>For international flights, carry your passport and visa</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium"
              onClick={copyBookingDetails}
            >
              <Copy size={16} className="mr-2" />
              {copied ? "Copied!" : "Copy Details"}
            </button>
            <button className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium">
              <Download size={16} className="mr-2" />
              Download
            </button>
            <button className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium">
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full flex items-center justify-center"
        >
          Done
        </button>
      </div>
    </div>
  )
}
