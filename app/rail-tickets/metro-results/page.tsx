"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, MapPin, Clock, Users } from "lucide-react"
import { getFare } from "@/lib/data/metro-fare-data"

export default function MetroResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const fromStation = searchParams.get("from") || "Mirpur-10"
  const toStation = searchParams.get("to") || "Uttara South"
  const travelDate = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const passengers = Number(searchParams.get("passengers")) || 1

  const singleJourneyFare = getFare(fromStation, toStation)

  const ticketOptions = [
    {
      id: "single",
      type: "Single Journey",
      description: "One-way ticket",
      price: singleJourneyFare,
      features: ["Valid for selected date", "Direct route", "DMTCL official rate"],
      icon: "🎫",
    },
  ]

  const handleBookTicket = (option: any) => {
    const totalPrice = option.price * passengers
    const params = new URLSearchParams({
      from: fromStation,
      to: toStation,
      date: travelDate,
      passengers: passengers.toString(),
      type: option.id,
      price: totalPrice.toString(),
    })

    router.push(`/rail-tickets/metro-booking?${params.toString()}`)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-sm mx-auto relative">
      {/* Header */}
      <div className="bg-sky-500 text-white p-4">
        <div className="flex items-center space-x-3 mb-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Metro Rail Tickets</h1>
        </div>

        {/* Journey Info */}
        <div className="bg-sky-400 rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MapPin size={16} />
              <span>
                {fromStation} → {toStation}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users size={16} />
              <span>{passengers}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span>{new Date(travelDate).toLocaleDateString("en-GB")}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {ticketOptions.map((option) => (
            <div key={option.id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{option.type}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-sky-500">Tk{option.price * passengers}</div>
                  {passengers > 1 && (
                    <div className="text-xs text-gray-500">
                      Tk{option.price} × {passengers}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 mb-4">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1 h-1 bg-sky-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleBookTicket(option)}
                className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
              >
                Book Now - Tk{option.price * passengers}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
