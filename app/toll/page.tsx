"use client"

import { useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TollPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const tollRoutes = [
    { name: "Dhaka-Chittagong Highway", code: "DCH", flag: "🛣️", tollZones: "6 zones", fee: "50-300" },
    { name: "Padma Bridge", code: "PB", flag: "🌉", tollZones: "1 zone", fee: "100" },
    { name: "Bangabandhu Bridge", code: "BB", flag: "🌉", tollZones: "1 zone", fee: "80" },
    { name: "Jamuna Bridge", code: "JB", flag: "🌉", tollZones: "1 zone", fee: "90" },
    { name: "Meghna Bridge", code: "MB", flag: "🌉", tollZones: "2 zones", fee: "120-150" },
    { name: "Dhaka City Toll", code: "DCT", flag: "🚗", tollZones: "3 zones", fee: "20-50" },
    { name: "Chittagong City Toll", code: "CCT", flag: "🚗", tollZones: "2 zones", fee: "25-40" },
    { name: "Sylhet-Sunamganj Highway", code: "SSH", flag: "🛣️", tollZones: "4 zones", fee: "40-150" },
    { name: "Khulna-Jessore Highway", code: "KJH", flag: "🛣️", tollZones: "3 zones", fee: "30-100" },
    { name: "Rajshahi Ring Road", code: "RRR", flag: "🛣️", tollZones: "2 zones", fee: "35-75" },
  ]

  const filteredRoutes = tollRoutes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectRoute = (route: typeof tollRoutes[0]) => {
    router.push(`/toll/amount?route=${encodeURIComponent(route.code)}&name=${encodeURIComponent(route.name)}`)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center gap-3">
        <Link href="/home">
          <ArrowLeft size={24} className="cursor-pointer" />
        </Link>
        <h1 className="text-xl font-bold">Pay Toll</h1>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search toll routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent ml-2 outline-none text-sm"
          />
        </div>
      </div>

      {/* Routes List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No toll routes found
            </div>
          ) : (
            filteredRoutes.map((route) => (
              <button
                key={route.code}
                onClick={() => handleSelectRoute(route)}
                className="w-full p-4 border rounded-lg hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{route.flag}</span>
                      <div>
                        <p className="font-bold text-gray-900">{route.name}</p>
                        <p className="text-sm text-gray-600">{route.tollZones}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#29a9eb]">৳ {route.fee}</p>
                    <p className="text-xs text-gray-600">Fee range</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
