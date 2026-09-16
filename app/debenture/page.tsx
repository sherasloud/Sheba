"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DebenturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#29a9eb] to-[#1e88c7] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center">
        <Link href="/home" className="text-white">
          <ArrowLeft size={24} />
        </Link>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Prohibition Icon */}
        <div className="relative mb-12">
          <div className="w-48 h-48 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
            <div className="w-32 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold leading-relaxed">
            দুঃখিত, আপনি বর্তমানে ডিবেঞ্চার (DEBENTURE) এর জন্য যোগ্য নন
          </h1>
        </div>
      </div>
    </div>
  )
}
