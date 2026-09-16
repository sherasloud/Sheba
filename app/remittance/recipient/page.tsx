"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RemittanceRecipientPage() {
  const [country, setCountry] = useState<any>(null)
  const [amount, setAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  const router = useRouter()

  useEffect(() => {
    // Get data from localStorage
    const savedCountry = localStorage.getItem("remittanceCountry")
    const savedAmount = localStorage.getItem("remittanceAmount")

    if (savedCountry && savedAmount) {
      setCountry(JSON.parse(savedCountry))
      setAmount(savedAmount)
    } else {
      router.push("/remittance")
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleContinue = () => {
    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city"]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

    if (missingFields.length > 0) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    // Save recipient data to localStorage
    localStorage.setItem("remittanceRecipient", JSON.stringify(formData))

    setTimeout(() => {
      router.push("/remittance/review")
    }, 1000)
  }

  if (!country) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <Link href="/remittance/amount" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-xl font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/remittance/amount" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Recipient Details</div>
      </div>

      <div className="p-4 overflow-y-auto pb-20">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                alt={`${country.name} flag`}
                className="w-6 h-4 object-cover rounded mr-2"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "inline"
                }}
              />
              <span className="text-lg mr-2 hidden">{country.flag}</span>
              <span className="font-medium">{country.name}</span>
            </div>
            <span className="font-medium text-blue-600">Tk{amount}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter full address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter postal code"
              />
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Continue to Review"}
          </button>
        </div>
      </div>
    </div>
  )
}
