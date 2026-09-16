"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plane, Clock, Calendar, Filter, SortAsc } from "lucide-react"

export default function FlightResultsPage() {
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState(null)
  const [flights, setFlights] = useState([])
  const [sortBy, setSortBy] = useState("price")
  const [filterAirline, setFilterAirline] = useState("all")

  const router = useRouter()

  // Real airlines with actual data
  const airlines = [
    { name: "Biman Bangladesh Airlines", code: "BG", logo: "/images/biman-logo.png", type: "full-service" },
    { name: "US-Bangla Airlines", code: "BS", logo: "/images/us-bangla-logo.png", type: "full-service" },
    { name: "Emirates", code: "EK", logo: "/images/emirates-logo.png", type: "premium" },
    { name: "Qatar Airways", code: "QR", logo: "/images/qatar-logo.png", type: "premium" },
    { name: "Singapore Airlines", code: "SQ", logo: "/placeholder.svg", type: "premium" },
    { name: "Thai Airways", code: "TG", logo: "/images/thai-airways-logo.png", type: "full-service" },
    { name: "Malaysia Airlines", code: "MH", logo: "/placeholder.svg", type: "full-service" },
    { name: "Turkish Airlines", code: "TK", logo: "/placeholder.svg", type: "full-service" },
  ]

  useEffect(() => {
    // Get real search parameters
    const storedParams = localStorage.getItem("flightSearchParams")
    if (storedParams) {
      const params = JSON.parse(storedParams)
      setSearchParams(params)
      generateRealisticFlights(params)
    } else {
      router.push("/air-tickets")
    }
  }, [])

  // Generate realistic flight prices based on actual routes
  const getRealisticPrice = (fromCity, toCity, airline) => {
    const from = fromCity.toLowerCase()
    const to = toCity.toLowerCase()
    const isPremium = airline.type === "premium"
    const isFullService = airline.type === "full-service"

    // Base prices for different routes (in BDT)
    let basePrice = 15000 // Default domestic

    // International route pricing
    if (!from.includes("bangladesh") || !to.includes("bangladesh")) {
      // Asia routes
      if (to.includes("thailand") || to.includes("singapore") || to.includes("malaysia")) {
        basePrice = isPremium ? 45000 : 28000
      }
      // Middle East routes
      else if (to.includes("dubai") || to.includes("qatar") || to.includes("kuwait")) {
        basePrice = isPremium ? 65000 : 35000
      }
      // Europe routes
      else if (to.includes("london") || to.includes("paris") || to.includes("germany")) {
        basePrice = isPremium ? 120000 : 75000
      }
      // North America routes
      else if (to.includes("usa") || to.includes("canada") || to.includes("new york")) {
        basePrice = isPremium ? 180000 : 110000
      }
      // East Asia routes (Korea, Japan, China)
      else if (to.includes("korea") || to.includes("japan") || to.includes("china")) {
        basePrice = isPremium ? 85000 : 55000
      }
      // Australia/Oceania
      else if (to.includes("australia") || to.includes("new zealand")) {
        basePrice = isPremium ? 95000 : 65000
      }
      // Other international
      else {
        basePrice = isPremium ? 70000 : 45000
      }
    }

    // Add airline premium
    if (isPremium) {
      basePrice *= 1.2
    } else if (isFullService) {
      basePrice *= 1.1
    }

    // Add random variation (±15%)
    const variation = (Math.random() - 0.5) * 0.3
    basePrice = Math.floor(basePrice * (1 + variation))

    // Round to nearest 500
    return Math.round(basePrice / 500) * 500
  }

  // Generate realistic flight times
  const generateFlightTimes = (fromCity, toCity) => {
    const from = fromCity.toLowerCase()
    const to = toCity.toLowerCase()

    let duration = "2h 30m" // Default domestic
    let stops = "Direct"

    // Calculate realistic duration and stops
    if (!from.includes("bangladesh") || !to.includes("bangladesh")) {
      if (to.includes("thailand") || to.includes("singapore")) {
        duration = "3h 45m"
        stops = "Direct"
      } else if (to.includes("dubai") || to.includes("qatar")) {
        duration = "4h 30m"
        stops = "Direct"
      } else if (to.includes("korea") || to.includes("japan")) {
        duration = "8h 15m"
        stops = Math.random() > 0.3 ? "1 Stop" : "Direct"
      } else if (to.includes("europe") || to.includes("london")) {
        duration = "10h 45m"
        stops = "1 Stop"
      } else if (to.includes("usa") || to.includes("canada")) {
        duration = "16h 30m"
        stops = Math.random() > 0.2 ? "2 Stops" : "1 Stop"
      } else {
        duration = "6h 20m"
        stops = Math.random() > 0.5 ? "1 Stop" : "Direct"
      }
    }

    // Generate departure times (realistic airline schedules)
    const departureTimes = [
      "06:30 AM",
      "08:45 AM",
      "10:30 AM",
      "12:15 PM",
      "02:45 PM",
      "05:20 PM",
      "07:35 PM",
      "09:50 PM",
      "11:25 PM",
    ]

    const departureTime = departureTimes[Math.floor(Math.random() * departureTimes.length)]

    // Calculate arrival time
    const durationHours = Number.parseInt(duration.split("h")[0])
    const durationMins = Number.parseInt(duration.split("h")[1].split("m")[0])

    const depHour = Number.parseInt(departureTime.split(":")[0])
    const depMin = Number.parseInt(departureTime.split(":")[1].split(" ")[0])
    const isPM = departureTime.includes("PM")

    const totalDepMins = (isPM && depHour !== 12 ? depHour + 12 : depHour) * 60 + depMin
    let totalArrMins = totalDepMins + durationHours * 60 + durationMins

    const arrDay = Math.floor(totalArrMins / (24 * 60))
    totalArrMins = totalArrMins % (24 * 60)

    const arrHour = Math.floor(totalArrMins / 60)
    const arrMin = totalArrMins % 60

    const arrivalTime = `${arrHour > 12 ? arrHour - 12 : arrHour === 0 ? 12 : arrHour}:${arrMin.toString().padStart(2, "0")} ${arrHour >= 12 ? "PM" : "AM"}${arrDay > 0 ? "+" + arrDay : ""}`

    return { departureTime, arrivalTime, duration, stops }
  }

  const generateRealisticFlights = (params) => {
    setLoading(true)

    setTimeout(() => {
      const numFlights = Math.floor(Math.random() * 8) + 6 // 6-13 flights
      const flightResults = []

      // Ensure we have flights from different airlines
      const availableAirlines = [...airlines]

      for (let i = 0; i < numFlights; i++) {
        const airline = availableAirlines[i % availableAirlines.length]
        const price = getRealisticPrice(params.fromCity, params.toCity, airline)
        const { departureTime, arrivalTime, duration, stops } = generateFlightTimes(params.fromCity, params.toCity)

        // Generate flight number
        const flightNumber = `${airline.code}${Math.floor(Math.random() * 900) + 100}`

        // Calculate taxes and fees
        const taxes = Math.floor(price * 0.12)
        const serviceFee = 500
        const totalPrice = price + taxes + serviceFee

        flightResults.push({
          id: i + 1,
          airline: airline.name,
          airlineCode: airline.code,
          logo: airline.logo,
          flightNumber,
          from: params.fromCity,
          to: params.toCity,
          departureTime,
          arrivalTime,
          duration,
          stops,
          price,
          taxes,
          serviceFee,
          totalPrice,
          date: params.departureDate,
          aircraft: `Boeing ${Math.random() > 0.5 ? "777" : "787"}`,
          baggage: airline.type === "premium" ? "30kg" : "25kg",
          meal: airline.type === "premium" ? "Premium Meal" : "Standard Meal",
        })
      }

      // Sort by price initially
      flightResults.sort((a, b) => a.totalPrice - b.totalPrice)
      setFlights(flightResults)
      setLoading(false)
    }, 2000)
  }

  const handleBookFlight = (flight) => {
    // Get user's actual phone number from localStorage or session
    const userPhone = localStorage.getItem("userPhone") || "01XXXXXXXXX"
    const userName = localStorage.getItem("userName") || "User"
    const userEmail = localStorage.getItem("userEmail") || "user@example.com"

    // Store flight details for PIN confirmation
    const bookingData = {
      ...flight,
      passengerName: userName,
      passengerEmail: userEmail,
      passengerPhone: userPhone,
      bookingId: `BK${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")}`,
      pnr: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(
        Math.random() * 1000,
      )
        .toString()
        .padStart(3, "0")}`,
    }

    localStorage.setItem("selectedFlight", JSON.stringify(bookingData))
    router.push("/air-tickets/pin")
  }

  // Filter and sort flights
  const getFilteredAndSortedFlights = () => {
    let filtered = flights

    if (filterAirline !== "all") {
      filtered = filtered.filter((flight) => flight.airlineCode === filterAirline)
    }

    if (sortBy === "price") {
      filtered.sort((a, b) => a.totalPrice - b.totalPrice)
    } else if (sortBy === "duration") {
      filtered.sort((a, b) => {
        const aDuration = Number.parseInt(a.duration.split("h")[0]) * 60 + Number.parseInt(a.duration.split("h")[1])
        const bDuration = Number.parseInt(b.duration.split("h")[0]) * 60 + Number.parseInt(b.duration.split("h")[1])
        return aDuration - bDuration
      })
    } else if (sortBy === "departure") {
      filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime))
    }

    return filtered
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for best flights...</p>
          <p className="text-sm text-gray-500 mt-1">Comparing prices from multiple airlines</p>
        </div>
      </div>
    )
  }

  if (!searchParams) return null

  const filteredFlights = getFilteredAndSortedFlights()
  const totalPassengers = (searchParams.adults || 1) + (searchParams.children || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-white border-b">
        <div className="p-4 flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Flight Results</h1>
            <p className="text-sm text-gray-600">
              {searchParams.fromCity.split(",")[0]} → {searchParams.toCity.split(",")[0]} •{" "}
              {new Date(searchParams.departureDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              • {searchParams.adults} Adult{searchParams.adults > 1 ? "s" : ""}
              {searchParams.children > 0 && `, ${searchParams.children} Child${searchParams.children > 1 ? "ren" : ""}`}
              {` • ${filteredFlights.length} flights found`}
            </p>
          </div>
        </div>

        {/* Filter and Sort */}
        <div className="px-4 pb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterAirline}
              onChange={(e) => setFilterAirline(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Airlines</option>
              {airlines.map((airline) => (
                <option key={airline.code} value={airline.code}>
                  {airline.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="price">Price (Low to High)</option>
              <option value="duration">Duration (Short to Long)</option>
              <option value="departure">Departure Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flight Results */}
      <div className="p-4 space-y-4">
        {filteredFlights.map((flight) => (
          <div key={flight.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img src={flight.logo || "/placeholder.svg"} alt={flight.airline} className="w-8 h-8 rounded" />
                <div>
                  <p className="font-medium text-sm">{flight.airline}</p>
                  <p className="text-xs text-gray-500">{flight.flightNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-sky-600">Tk{flight.totalPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-500">per person</p>
                {totalPassengers > 1 && (
                  <p className="text-xs text-sky-600 font-medium">
                    Tk{(flight.totalPrice * totalPassengers).toLocaleString()} total
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <p className="font-bold text-lg">{flight.departureTime}</p>
                <p className="text-xs text-gray-600">{flight.from.split(",")[0]}</p>
              </div>

              <div className="flex-1 mx-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <Plane className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                <div className="text-center mt-1">
                  <p className="text-xs text-gray-500">{flight.duration}</p>
                  <p className={`text-xs ${flight.stops === "Direct" ? "text-green-600" : "text-orange-600"}`}>
                    {flight.stops}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="font-bold text-lg">{flight.arrivalTime}</p>
                <p className="text-xs text-gray-600">{flight.to.split(",")[0]}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{flight.aircraft}</span>
              <span>Baggage: {flight.baggage}</span>
              <span>{flight.meal}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(flight.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{flight.duration}</span>
                </div>
                {totalPassengers > 1 && <span className="text-sky-600 font-medium">{totalPassengers} passengers</span>}
              </div>

              <button
                onClick={() => handleBookFlight(flight)}
                className="bg-sky-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-600"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
