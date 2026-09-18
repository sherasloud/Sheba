"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Train, MapPin, Calendar, Users } from "lucide-react"

export default function RailTicketsPage() {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<"metro" | "train" | null>(null)
  const [fromStation, setFromStation] = useState("")
  const [toStation, setToStation] = useState("")
  const [travelDate, setTravelDate] = useState("")
  const [passengers, setPassengers] = useState(1)
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const [showTicketIntro, setShowTicketIntro] = useState(true)

  if (showTicketIntro) {
    return (
      <main className="relative min-h-[100dvh] overflow-hidden bg-white">
        <button
          type="button"
          aria-label="Continue to rail ticket search"
          onClick={() => {
            setShowTicketIntro(false)
            setSelectedService("train")
          }}
          className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
        >
          <img
            src="/images/rail-ticket-intro.png"
            alt="Train Tickets with Bangladesh Railway logo and Continue button"
            className="pointer-events-none absolute inset-0 h-full w-full object-contain object-top"
          />
        </button>
      </main>
    )
  }

  // Metro Rail Stations (Dhaka Metro MRT Line-6)
  const metroStations = [
    "Uttara North",
    "Uttara Center",
    "Uttara South",
    "Pallabi",
    "Mirpur-11",
    "Mirpur-10",
    "Kazipara",
    "Shewrapara",
    "Agargaon",
    "Bijoy Sarani",
    "Farmgate",
    "Karwan Bazar",
    "Shahbagh",
    "Dhaka University",
    "Bangladesh Secretariat",
    "Motijheel",
    "Kamalapur",
  ]

  // Train Routes with Real Bangladesh Railway Routes
  const trainRoutes = [
    { from: "Dhaka", to: "Chittagong", duration: "4h 30m" },
    { from: "Dhaka", to: "Sylhet", duration: "4h 15m" },
    { from: "Dhaka", to: "Rajshahi", duration: "4h 45m" },
    { from: "Dhaka", to: "Rangpur", duration: "6h 00m" },
    { from: "Dhaka", to: "Khulna", duration: "5h 15m" },
    { from: "Dhaka", to: "Barisal", duration: "3h 30m" },
    { from: "Dhaka", to: "Mymensingh", duration: "2h 15m" },
    { from: "Chittagong", to: "Dhaka", duration: "4h 30m" },
    { from: "Sylhet", to: "Dhaka", duration: "4h 15m" },
    { from: "Rajshahi", to: "Dhaka", duration: "4h 45m" },
  ]

  const handleSearch = () => {
    if (!selectedService || !fromStation || !toStation || !travelDate) {
      alert("Please fill all required fields")
      return
    }

    if (selectedService === "metro") {
      router.push(
        `/rail-tickets/metro-results?from=${fromStation}&to=${toStation}&date=${travelDate}&passengers=${passengers}`,
      )
    } else {
      router.push(
        `/rail-tickets/train-results?from=${fromStation}&to=${toStation}&date=${travelDate}&passengers=${passengers}`,
      )
    }
  }

  // Filter stations based on input and service type
  const getFilteredStations = (input: string, excludeStation: string, service: "metro" | "train" | null) => {
    if (!input || !service) return []

    const stations = service === "metro" ? metroStations : trainRoutes.map((route) => route.from)

    return stations
      .filter((station) => station.toLowerCase().includes(input.toLowerCase()) && station !== excludeStation)
      .slice(0, 10) // Show top 10 matches
  }

  // Handle station selection
  const handleFromStationSelect = (station: string) => {
    setFromStation(station)
    setShowFromSuggestions(false)
  }

  const handleToStationSelect = (station: string) => {
    setToStation(station)
    setShowToSuggestions(false)
  }

  return (
    <div className="flex flex-col h-screen bg-white max-w-sm mx-auto relative">
      {/* Header */}
      <div className="bg-white p-5 flex items-center space-x-3 text-[#2d2d2d]">
        <button onClick={() => router.back()} className="p-1" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-normal">Rail Tickets</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Service Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Train className="mr-2 text-sky-500" size={20} />
            Select Service
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedService("metro")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedService === "metro" ? "border-sky-500 bg-sky-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">🚇</div>
              <div className="font-medium">Metro Rail</div>
              <div className="text-xs text-gray-500">Dhaka Metro</div>
            </button>

            <button
              onClick={() => setSelectedService("train")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedService === "train" ? "border-sky-500 bg-sky-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img src="/images/rail-tickets-icon.png" alt="Rail ticket" className="mx-auto mb-2 h-12 w-16 object-contain" />
              <div className="font-medium">Rail Tickets</div>
              <div className="text-xs text-gray-500">Bangladesh Railway</div>
            </button>
          </div>
        </div>

        {/* Route Selection */}
        {selectedService && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 text-sky-500" size={20} />
              Select Route
            </h2>

            <div className="space-y-4">
              {/* From Station */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={fromStation}
                    onChange={(e) => {
                      setFromStation(e.target.value)
                      setShowFromSuggestions(true)
                    }}
                    onFocus={() => setShowFromSuggestions(true)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Select departure station"
                  />
                </div>
                {showFromSuggestions && fromStation && (
                  <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {getFilteredStations(fromStation, toStation, selectedService).map((station, index) => (
                      <button
                        key={index}
                        onClick={() => handleFromStationSelect(station)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <Train className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{station}</span>
                        </div>
                      </button>
                    ))}
                    {getFilteredStations(fromStation, toStation, selectedService).length === 0 && (
                      <div className="px-4 py-2 text-gray-500 text-sm">No stations found</div>
                    )}
                  </div>
                )}
              </div>

              {/* To Station */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={toStation}
                    onChange={(e) => {
                      setToStation(e.target.value)
                      setShowToSuggestions(true)
                    }}
                    onFocus={() => setShowToSuggestions(true)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Select destination station"
                  />
                </div>
                {showToSuggestions && toStation && (
                  <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {getFilteredStations(toStation, fromStation, selectedService).map((station, index) => (
                      <button
                        key={index}
                        onClick={() => handleToStationSelect(station)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <Train className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{station}</span>
                        </div>
                      </button>
                    ))}
                    {getFilteredStations(toStation, fromStation, selectedService).length === 0 && (
                      <div className="px-4 py-2 text-gray-500 text-sm">No stations found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Travel Details */}
        {selectedService && fromStation && toStation && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 text-sky-500" size={20} />
              Travel Details
            </h2>

            <div className="space-y-4">
              {/* Travel Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                <div className="flex items-center space-x-3">
                  <Users size={20} className="text-gray-400" />
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} Passenger{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        {selectedService && fromStation && toStation && travelDate && (
          <button
            onClick={handleSearch}
            className="w-full bg-sky-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-sky-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Train size={20} />
            <span>Search {selectedService === "metro" ? "Metro Rail" : "Rail Tickets"}</span>
          </button>
        )}

        {/* Real Pricing Info */}
        <div className="bg-sky-50 rounded-xl p-4">
          <h3 className="font-semibold text-sky-600 mb-2">Real Pricing Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
              <span>Metro Rail: Tk20-100 (DMTCL official rates)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
              <span>Rail Tickets: Tk150-2500 (Bangladesh Railway rates)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
              <span>Digital tickets with QR codes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
