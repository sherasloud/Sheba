"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AirTicketsPinPage() {
  const [loading, setLoading] = useState(true)
  const [flight, setFlight] = useState(null)
  const [searchParams, setSearchParams] = useState(null)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)

  const router = useRouter()

  useEffect(() => {
    try {
      const storedFlight = localStorage.getItem("selectedFlight")
      const storedSearch = localStorage.getItem("flightSearchParams")

      if (storedFlight && storedSearch) {
        const flightData = JSON.parse(storedFlight)
        const searchData = JSON.parse(storedSearch)

        if (flightData.passengerName && flightData.passengerEmail && flightData.passengerPhone) {
          setFlight(flightData)
          setSearchParams(searchData)
        } else {
          router.push("/air-tickets")
        }
      } else {
        router.push("/air-tickets")
      }
    } catch (err) {
      console.error("Load error:", err)
      router.push("/air-tickets")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    setError("")
  }, [pin])

  const handleConfirm = async () => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError("Please enter a valid 6-digit PIN")
      return
    }

    const correctPin = localStorage.getItem("userPIN") || "123456"

    if (pin !== correctPin) {
      setError("Incorrect PIN")
      return
    }

    setIsConfirming(true)

    try {
      // Simulate booking confirmation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update flight booking status
      const updatedFlight = {
        ...flight,
        ...searchParams,
        bookingConfirmed: true,
        bookingTime: new Date().toISOString(),
        transactionId: `TXN${Date.now()}`,
      }
      localStorage.setItem("selectedFlight", JSON.stringify(updatedFlight))

      // Navigate to success page
      router.push("/air-tickets/success")
    } catch (err) {
      console.error("Booking confirmation error:", err)
      setError("Booking failed. Please try again.")
      setIsConfirming(false)
    }
  }

  const handleBackStep = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="mobile-page">
        <div className="mobile-content flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (!flight || !searchParams) {
    return (
      <div className="mobile-page">
        <div className="mobile-content flex flex-col items-center justify-center">
          <p className="text-red-600 mb-4">Flight booking not found</p>
          <Link href="/air-tickets" className="mobile-button">
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  // Calculate total passengers and price
  const totalPassengers = (searchParams.adults || 1) + (searchParams.children || 0)
  const totalPrice = flight.totalPrice * totalPassengers

  return (
    <div className="mobile-page">
      <div className="mobile-header">
        <Link href="/air-tickets/results" className="mr-4 touch-manipulation">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-medium">Book Flight</div>
      </div>

      <div className="mobile-content">
        <div className="text-xl font-bold mb-2">Enter PIN</div>
        <div className="text-gray-600 mb-1 text-sm">
          <span className="font-medium">{flight.airline}</span> - {flight.flightNumber}
        </div>
        <div className="text-gray-600 mb-1 text-sm">
          {flight.from.split(",")[0]} → {flight.to.split(",")[0]}
        </div>
        <div className="text-gray-600 mb-1 text-sm">
          {flight.departureTime} - {flight.arrivalTime} ({flight.duration})
        </div>
        <div className="text-gray-600 mb-1 text-sm">
          Date:{" "}
          {new Date(flight.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <div className="text-gray-600 mb-1 text-sm">Stops: {flight.stops}</div>

        <div className="bg-sky-50 p-3 rounded-lg mb-4 mt-3">
          <div className="text-gray-600 mb-1 text-sm">Price per person: Tk{flight.totalPrice.toLocaleString()}</div>
          <div className="text-gray-600 mb-1 text-sm">
            × {totalPassengers} passenger{totalPassengers > 1 ? "s" : ""}
          </div>
          <div className="text-sky-600 font-bold text-lg">Total: Tk{totalPrice.toLocaleString()}</div>
        </div>

        <input
          type="password"
          className="mobile-input text-center mb-4"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={6}
          placeholder="••••••"
          disabled={isConfirming}
        />

        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        <div className="flex space-x-2 mt-auto">
          <button
            className="flex-1 border border-gray-300 p-4 rounded-md touch-manipulation"
            onClick={handleBackStep}
            disabled={isConfirming}
          >
            Back
          </button>
          <button className="flex-1 mobile-button" onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? "Booking..." : "Book Flight"}
          </button>
        </div>
      </div>
    </div>
  )
}
