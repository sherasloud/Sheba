"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Users, User, Search, Calendar } from "lucide-react"

const AirTicketsPage = () => {
  const [tripType, setTripType] = useState("one-way")
  const [fromCity, setFromCity] = useState("Dhaka, Bangladesh")
  const [toCity, setToCity] = useState("")
  const [fromCityInput, setFromCityInput] = useState("Dhaka, Bangladesh")
  const [toCityInput, setToCityInput] = useState("")
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const [departureDate, setDepartureDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const router = useRouter()

  // Only cities with actual airports (excluding Ukraine)
  const allCities = [
    // Bangladesh Cities with Airports
    "Dhaka, Bangladesh", // Hazrat Shahjalal International Airport
    "Chittagong, Bangladesh", // Shah Amanat International Airport
    "Sylhet, Bangladesh", // Osmani International Airport
    "Jessore, Bangladesh", // Jessore Airport
    "Barisal, Bangladesh", // Barisal Airport
    "Rajshahi, Bangladesh", // Shah Makhdum Airport
    "Cox's Bazar, Bangladesh", // Cox's Bazar Airport
    "Saidpur, Bangladesh", // Saidpur Airport

    // Pakistan Cities with Major Airports
    "Karachi, Pakistan", // Jinnah International Airport
    "Lahore, Pakistan", // Allama Iqbal International Airport
    "Islamabad, Pakistan", // Islamabad International Airport
    "Peshawar, Pakistan", // Bacha Khan International Airport
    "Quetta, Pakistan", // Quetta International Airport
    "Faisalabad, Pakistan", // Faisalabad International Airport
    "Multan, Pakistan", // Multan International Airport
    "Sialkot, Pakistan", // Sialkot International Airport
    "Rahim Yar Khan, Pakistan", // Sheikh Zayed Airport

    // USA Cities with Major Airports
    "New York, USA", // JFK, LGA, EWR
    "Los Angeles, USA", // LAX
    "Chicago, USA", // ORD, MDW
    "Houston, USA", // IAH, HOU
    "Phoenix, USA", // PHX
    "Philadelphia, USA", // PHL
    "San Antonio, USA", // SAT
    "San Diego, USA", // SAN
    "Dallas, USA", // DFW, DAL
    "San Jose, USA", // SJC
    "Austin, USA", // AUS
    "Jacksonville, USA", // JAX
    "Fort Worth, USA", // DFW
    "Columbus, USA", // CMH
    "Charlotte, USA", // CLT
    "San Francisco, USA", // SFO
    "Indianapolis, USA", // IND
    "Seattle, USA", // SEA
    "Denver, USA", // DEN
    "Washington, USA", // DCA, IAD, BWI
    "Boston, USA", // BOS
    "Nashville, USA", // BNA
    "Detroit, USA", // DTW
    "Portland, USA", // PDX
    "Las Vegas, USA", // LAS
    "Memphis, USA", // MEM
    "Louisville, USA", // SDF
    "Baltimore, USA", // BWI
    "Milwaukee, USA", // MKE
    "Sacramento, USA", // SMF
    "Kansas City, USA", // MCI
    "Atlanta, USA", // ATL
    "Raleigh, USA", // RDU
    "Miami, USA", // MIA
    "Omaha, USA", // OMA
    "Oakland, USA", // OAK
    "Minneapolis, USA", // MSP
    "Tampa, USA", // TPA
    "New Orleans, USA", // MSY

    // Canada Cities with Major Airports
    "Toronto, Canada", // YYZ
    "Montreal, Canada", // YUL
    "Vancouver, Canada", // YVR
    "Calgary, Canada", // YYC
    "Ottawa, Canada", // YOW
    "Edmonton, Canada", // YEG
    "Winnipeg, Canada", // YWG
    "Quebec City, Canada", // YQB
    "Halifax, Canada", // YHZ
    "St. John's, Canada", // YYT
    "Thunder Bay, Canada", // YQT
    "Saskatoon, Canada", // YXE
    "Regina, Canada", // YQR
    "Kelowna, Canada", // YKA

    // UK Cities with Major Airports
    "London, UK", // LHR, LGW, STN, LTN
    "Birmingham, UK", // BHX
    "Manchester, UK", // MAN
    "Glasgow, UK", // GLA
    "Liverpool, UK", // LPL
    "Leeds, UK", // LBA
    "Edinburgh, UK", // EDI
    "Bristol, UK", // BRS
    "Cardiff, UK", // CWL
    "Belfast, UK", // BFS
    "Newcastle, UK", // NCL
    "Southampton, UK", // SOU
    "Luton, UK", // LTN
    "Bournemouth, UK", // BOH

    // Australia Cities with Major Airports
    "Sydney, Australia", // SYD
    "Melbourne, Australia", // MEL
    "Brisbane, Australia", // BNE
    "Perth, Australia", // PER
    "Adelaide, Australia", // ADL
    "Gold Coast, Australia", // OOL
    "Newcastle, Australia", // NTL
    "Canberra, Australia", // CBR
    "Hobart, Australia", // HBA
    "Townsville, Australia", // TSV
    "Cairns, Australia", // CNS
    "Darwin, Australia", // DRW
    "Ballarat, Australia", // BAL
    "Albury, Australia", // ABX
    "Launceston, Australia", // LST
    "Mackay, Australia", // MKY
    "Rockhampton, Australia", // ROK
    "Bundaberg, Australia", // BDB
    "Gladstone, Australia", // GLT
    "Tamworth, Australia", // TMW
    "Orange, Australia", // OAG
    "Dubbo, Australia", // DBO
    "Alice Springs, Australia", // ASP

    // Middle East Cities with Major Airports
    "Dubai, UAE", // DXB
    "Abu Dhabi, UAE", // AUH
    "Sharjah, UAE", // SHJ
    "Doha, Qatar", // DOH
    "Kuwait City, Kuwait", // KWI
    "Muscat, Oman", // MCT
    "Manama, Bahrain", // BAH
    "Riyadh, Saudi Arabia", // RUH
    "Jeddah, Saudi Arabia", // JED
    "Tehran, Iran", // IKA
    "Baghdad, Iraq", // BGW
    "Amman, Jordan", // AMM
    "Beirut, Lebanon", // BEY

    // Asian Cities with Major Airports
    "Singapore", // SIN
    "Bangkok, Thailand", // BKK, DMK
    "Kuala Lumpur, Malaysia", // KUL
    "Istanbul, Turkey", // IST, SAW
    "Tokyo, Japan", // NRT, HND
    "Seoul, South Korea", // ICN, GMP
    "Hong Kong", // HKG
    "Manila, Philippines", // MNL
    "Jakarta, Indonesia", // CGK
    "Ho Chi Minh City, Vietnam", // SGN
    "Hanoi, Vietnam", // HAN
    "Kathmandu, Nepal", // KTM
    "Colombo, Sri Lanka", // CMB
    "Male, Maldives", // MLE
    "Ankara, Turkey", // ESB
    "Tashkent, Uzbekistan", // TAS
    "Almaty, Kazakhstan", // ALA
    "Baku, Azerbaijan", // GYD
    "Tbilisi, Georgia", // TBS
    "Yerevan, Armenia", // EVN
    "Bishkek, Kyrgyzstan", // FRU

    // European Cities with Major Airports (excluding Ukraine)
    "Paris, France", // CDG, ORY
    "Berlin, Germany", // BER
    "Rome, Italy", // FCO, CIA
    "Madrid, Spain", // MAD
    "Amsterdam, Netherlands", // AMS
    "Brussels, Belgium", // BRU
    "Vienna, Austria", // VIE
    "Zurich, Switzerland", // ZUR
    "Stockholm, Sweden", // ARN
    "Oslo, Norway", // OSL
    "Copenhagen, Denmark", // CPH
    "Helsinki, Finland", // HEL
    "Warsaw, Poland", // WAW
    "Prague, Czech Republic", // PRG
    "Budapest, Hungary", // BUD
    "Bucharest, Romania", // OTP
    "Sofia, Bulgaria", // SOF
    "Athens, Greece", // ATH
    "Lisbon, Portugal", // LIS
    "Dublin, Ireland", // DUB
    "Frankfurt, Germany", // FRA
    "Munich, Germany", // MUC
    "Hamburg, Germany", // HAM
    "Cologne, Germany", // CGN
    "Milan, Italy", // MXP, LIN
    "Venice, Italy", // VCE
    "Florence, Italy", // FLR
    "Naples, Italy", // NAP
    "Barcelona, Spain", // BCN
    "Valencia, Spain", // VLC
    "Seville, Spain", // SVQ
    "Lyon, France", // LYS
    "Marseille, France", // MRS
    "Nice, France", // NCE
    "Geneva, Switzerland", // GVA
    "Basel, Switzerland", // BSL
    "Rotterdam, Netherlands", // RTM
    "Antwerp, Belgium", // ANR
    "Salzburg, Austria", // SZG
    "Innsbruck, Austria", // INN
    "Gothenburg, Sweden", // GOT
    "Bergen, Norway", // BGO
    "Trondheim, Norway", // TRD
    "Aarhus, Denmark", // AAR
    "Tampere, Finland", // TMP
    "Turku, Finland", // TKU
    "Krakow, Poland", // KRK
    "Gdansk, Poland", // GDN
    "Brno, Czech Republic", // BRQ
    "Bratislava, Slovakia", // BTS
    "Ljubljana, Slovenia", // LJU
    "Zagreb, Croatia", // ZAG
    "Split, Croatia", // SPU
    "Belgrade, Serbia", // BEG
    "Sarajevo, Bosnia and Herzegovina", // SJJ
    "Skopje, North Macedonia", // SKP
    "Tirana, Albania", // TIA
    "Podgorica, Montenegro", // TGD
    "Pristina, Kosovo", // PRN
    "Chisinau, Moldova", // KIV
    "Minsk, Belarus", // MSQ
    "Vilnius, Lithuania", // VNO
    "Riga, Latvia", // RIX
    "Tallinn, Estonia", // TLL
    "Moscow, Russia", // SVO, DME, VKO
    "Saint Petersburg, Russia", // LED

    // South American Cities with Major Airports
    "São Paulo, Brazil", // GRU, CGH
    "Rio de Janeiro, Brazil", // GIG, SDU
    "Brasília, Brazil", // BSB
    "Salvador, Brazil", // SSA
    "Buenos Aires, Argentina", // EZE, AEP
    "Córdoba, Argentina", // COR
    "Lima, Peru", // LIM
    "Santiago, Chile", // SCL
    "Bogotá, Colombia", // BOG
    "Medellín, Colombia", // MDE
    "Caracas, Venezuela", // CCS
    "Quito, Ecuador", // UIO
    "Guayaquil, Ecuador", // GYE
    "La Paz, Bolivia", // LPB
    "Santa Cruz, Bolivia", // VVI
    "Asunción, Paraguay", // ASU
    "Montevideo, Uruguay", // MVD

    // African Cities with Major Airports
    "Cairo, Egypt", // CAI
    "Lagos, Nigeria", // LOS
    "Abuja, Nigeria", // ABV
    "Nairobi, Kenya", // NBO
    "Addis Ababa, Ethiopia", // ADD
    "Casablanca, Morocco", // CMN
    "Cape Town, South Africa", // CPT
    "Johannesburg, South Africa", // JNB
    "Durban, South Africa", // DUR
    "Alexandria, Egypt", // HBE
    "Kano, Nigeria", // KAN
    "Dar es Salaam, Tanzania", // DAR
    "Kampala, Uganda", // EBB
    "Kigali, Rwanda", // KGL
    "Accra, Ghana", // ACC
    "Algiers, Algeria", // ALG

    // Oceania Cities with Major Airports
    "Auckland, New Zealand", // AKL
    "Wellington, New Zealand", // WLG
    "Christchurch, New Zealand", // CHC
    "Port Moresby, Papua New Guinea", // POM
    "Suva, Fiji", // SUV
    "Nadi, Fiji", // NAN

    // Mexico Cities with Major Airports
    "Mexico City, Mexico", // MEX
    "Guadalajara, Mexico", // GDL
    "Monterrey, Mexico", // MTY
    "Cancún, Mexico", // CUN
    "Tijuana, Mexico", // TIJ
    "Puerto Vallarta, Mexico", // PVR
    "Mérida, Mexico", // MID
    "Acapulco, Mexico", // ACA
  ].filter(
    (city) =>
      !city.includes("India") && !city.includes("Israel") && !city.includes("Ukraine") && !city.includes("Cyprus"),
  )

  // Filter cities based on input
  const getFilteredCities = (input, excludeCity = "") => {
    if (!input) return []
    return allCities
      .filter((city) => city.toLowerCase().includes(input.toLowerCase()) && city !== excludeCity)
      .slice(0, 10) // Show top 10 matches
  }

  // Handle city selection
  const handleFromCitySelect = (city) => {
    setFromCity(city)
    setFromCityInput(city)
    setShowFromSuggestions(false)
  }

  const handleToCitySelect = (city) => {
    setToCity(city)
    setToCityInput(city)
    setShowToSuggestions(false)
  }

  // Get today's date for minimum date selection
  const today = new Date().toISOString().split("T")[0]

  const searchFlights = () => {
    if (!fromCity || !toCity || !departureDate) {
      alert("Please fill in all required fields")
      return
    }

    if (fromCity === toCity) {
      alert("From and To cities cannot be the same")
      return
    }

    // Store search parameters in localStorage
    const searchParams = {
      tripType,
      fromCity,
      toCity,
      departureDate,
      returnDate,
      adults,
      children,
    }

    localStorage.setItem("flightSearchParams", JSON.stringify(searchParams))

    // Navigate to results page
    router.push("/air-tickets/results")
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Full Width Header */}
      <div className="bg-sky-500 text-white w-full">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Flight Booking</h1>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => setTripType("one-way")}
            className={`px-4 py-2 rounded-full text-sm ${
              tripType === "one-way" ? "bg-white text-sky-500" : "bg-sky-400"
            }`}
          >
            One Way
          </button>
          <button
            onClick={() => setTripType("round-trip")}
            className={`px-4 py-2 rounded-full text-sm ${
              tripType === "round-trip" ? "bg-white text-sky-500" : "bg-sky-400"
            }`}
          >
            Round Trip
          </button>
        </div>
      </div>

      {/* Full Width Content */}
      <div className="w-full">
        <div className="p-4 space-y-4">
          {/* From City */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={fromCityInput}
                onChange={(e) => {
                  setFromCityInput(e.target.value)
                  setShowFromSuggestions(true)
                }}
                onFocus={() => setShowFromSuggestions(true)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500"
                placeholder="Select departure city"
              />
            </div>
            {showFromSuggestions && fromCityInput && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                {getFilteredCities(fromCityInput, toCity).map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleFromCitySelect(city)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{city}</span>
                    </div>
                  </button>
                ))}
                {getFilteredCities(fromCityInput, toCity).length === 0 && (
                  <div className="px-4 py-2 text-gray-500 text-sm">No cities found</div>
                )}
              </div>
            )}
          </div>

          {/* To City */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={toCityInput}
                onChange={(e) => {
                  setToCityInput(e.target.value)
                  setShowToSuggestions(true)
                }}
                onFocus={() => setShowToSuggestions(true)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500"
                placeholder="Select destination city"
              />
            </div>
            {showToSuggestions && toCityInput && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                {getFilteredCities(toCityInput, fromCity).map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleToCitySelect(city)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{city}</span>
                    </div>
                  </button>
                ))}
                {getFilteredCities(toCityInput, fromCity).length === 0 && (
                  <div className="px-4 py-2 text-gray-500 text-sm">No cities found</div>
                )}
              </div>
            )}
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={today}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500"
              />
            </div>
          </div>

          {/* Return Date (if round trip) */}
          {tripType === "round-trip" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departureDate || today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* Passengers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number.parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:border-sky-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={children}
                  onChange={(e) => setChildren(Number.parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:border-sky-500"
                >
                  {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={searchFlights}
            className="w-full bg-sky-500 text-white py-3 rounded-lg font-medium hover:bg-sky-600 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search Flights
          </button>
        </div>
      </div>
    </div>
  )
}

export default AirTicketsPage
