"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Shield, Zap, Users, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: "💸",
    title: "Send Money Instantly",
    description: "Transfer money to any mobile number in Bangladesh within seconds",
    color: "bg-blue-500",
  },
  {
    icon: "📱",
    title: "Mobile Recharge",
    description: "Recharge any operator - GP, Robi, Banglalink, Airtel instantly",
    color: "bg-green-500",
  },
  {
    icon: "💡",
    title: "Pay Bills",
    description: "Pay electricity, gas, water bills from anywhere, anytime",
    color: "bg-yellow-500",
  },
  {
    icon: "🎓",
    title: "Education Fees",
    description: "Pay school, college, university fees directly from your phone",
    color: "bg-purple-500",
  },
  {
    icon: "✈️",
    title: "Travel Booking",
    description: "Book air tickets, train tickets with instant confirmation",
    color: "bg-red-500",
  },
  {
    icon: "🛒",
    title: "Online Shopping",
    description: "Pay at thousands of stores - Daraz, Chaldal, Foodpanda & more",
    color: "bg-indigo-500",
  },
]

export default function WelcomePage() {
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length)
  }

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#29a9eb] to-[#1e88e5]">
      {/* Header */}
      <div className="text-center pt-12 pb-8">
        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
          <img src="/images/droplet-logo.png" alt="Sheba" className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Sheba</h1>
        <p className="text-blue-100 text-lg">Your Digital Financial Partner</p>
      </div>

      {/* Feature Carousel */}
      <div className="flex-1 px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Everything You Need</h2>
            <p className="text-gray-600">One app for all your financial needs</p>
          </div>

          {/* Feature Display */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className={`w-20 h-20 ${features[currentFeature].color} rounded-full flex items-center justify-center text-3xl mb-4 shadow-lg`}
            >
              {features[currentFeature].icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{features[currentFeature].title}</h3>
            <p className="text-gray-600 text-center leading-relaxed px-4">{features[currentFeature].description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevFeature}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentFeature ? "bg-[#29a9eb] w-6" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextFeature}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8 space-y-4">
        <Link
          href="/register"
          className="w-full bg-white text-[#29a9eb] py-4 rounded-xl font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <Shield className="mr-3" size={24} />
          Create New Account
          <ArrowRight className="ml-3" size={24} />
        </Link>

        <Link
          href="/login"
          className="w-full bg-white/20 backdrop-blur text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
        >
          <Users className="mr-3" size={24} />
          Login to Existing Account
        </Link>
      </div>

      {/* Trust Indicators */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center space-x-6 text-white/80 text-sm">
          <div className="flex items-center">
            <Shield size={16} className="mr-1" />
            <span>Bank Grade Security</span>
          </div>
          <div className="flex items-center">
            <Zap size={16} className="mr-1" />
            <span>Instant Transfers</span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>1M+ Users</span>
          </div>
        </div>
      </div>
    </div>
  )
}
