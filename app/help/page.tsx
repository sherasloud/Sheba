"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, HandHeart } from "lucide-react" // Removed Phone import
import Link from "next/link"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function HelpPage() {
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check verification status
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }
  }, [])

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Help & Support" />
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Help & Support</div>
      </div>

      <div className="p-6 overflow-y-auto pb-20">
        <h1 className="text-2xl font-bold mb-4">How can we help you?</h1>
        <p className="text-gray-600 mb-6">Find answers to common questions or contact support</p>

        {/* Financial Help Button */}
        <div className="border-2 border-[#29a9eb] rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <HandHeart size={24} className="text-[#29a9eb] mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">Financial Help</h3>
              <p className="text-sm text-gray-500 mb-3">
                Request financial assistance for emergencies or special needs
              </p>
              <button
                onClick={() => router.push("/financial-help")}
                className="bg-[#29a9eb] text-white py-2 px-4 rounded-md text-sm"
              >
                Request Help
              </button>
            </div>
          </div>
        </div>

        {/* Support Contact Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">Contact Support</h3>
          <div className="flex items-center">
            <Mail size={16} className="text-[#29a9eb] mr-2" />
            <p className="text-sm">support@shebabd.org</p>
          </div>
        </div>
      </div>
    </div>
  )
}
