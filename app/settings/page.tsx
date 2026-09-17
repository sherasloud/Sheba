"use client"

import { useState, useEffect } from "react"
import { CheckCircle, ImageIcon, XCircle } from "lucide-react"
import Link from "next/link"
import TransactionCleaner from "@/components/transaction-cleaner"

const SettingsPage = () => {
  const [isNidVerified, setIsNidVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState("")

  useEffect(() => {
    // Get phone from localStorage
    const userData = localStorage.getItem("userData")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const userPhone = user.phoneNumber || user.phone
        setPhone(userPhone)

        // Fetch NID verification status
        if (userPhone) {
          fetchVerificationStatus(userPhone)
        }
      } catch (error) {
        console.error("[v0] Error parsing user data:", error)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchVerificationStatus = async (userPhone: string) => {
    try {
      const response = await fetch(`/api/verification-status?phone=${encodeURIComponent(userPhone)}`)
      const result = await response.json()

      console.log("[v0] Verification status response:", result)

      if (response.ok && result.success && result.data) {
        // Only verified if BOTH nidVerified AND faceVerified are true
        const isFullyVerified = (result.data.nidVerified === true) && (result.data.faceVerified === true)
        console.log("[v0] NID Verified:", result.data.nidVerified, "Face Verified:", result.data.faceVerified, "Fully Verified:", isFullyVerified)
        setIsNidVerified(isFullyVerified)
      } else {
        // If API fails, no user found, or incomplete verification, default to unverified
        console.log("[v0] Setting unverified - API not ok or no data")
        setIsNidVerified(false)
      }
    } catch (error) {
      console.error("[v0] Error fetching verification status:", error)
      // Default to unverified on error
      setIsNidVerified(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <TransactionCleaner />

      {/* NID Verification Status */}
      <div className={`border rounded-lg p-4 mb-4 ${isNidVerified ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3">
              {isNidVerified ? (
                <CheckCircle size={24} className="text-green-600" />
              ) : (
                <XCircle size={24} className="text-orange-600" />
              )}
            </div>
            <div>
              <div className={`font-medium flex items-center ${isNidVerified ? "text-green-800" : "text-orange-800"}`}>
                {isNidVerified ? "✓ NID Verified" : "✗ Unverified"}
              </div>
              <div className={`text-sm ${isNidVerified ? "text-green-700" : "text-orange-700"}`}>
                {isNidVerified
                  ? "Your NID and face have been verified"
                  : "Complete NID and face verification to unlock features"}
              </div>
            </div>
          </div>
          {!isNidVerified && (
            <Link href="/verification" className="bg-[#29a9eb] text-white px-4 py-2 rounded-md text-sm whitespace-nowrap">
              Verify Now
            </Link>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <Link
          href="/settings/editable-banners"
          className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors"
        >
          <div className="flex items-center">
            <div className="mr-3 bg-blue-100 p-2 rounded-lg">
              <ImageIcon size={24} className="text-[#29a9eb]" />
            </div>
            <div>
              <div className="font-medium">Manage Banners</div>
              <div className="text-sm text-gray-500">Edit, add, or remove home page banners</div>
            </div>
          </div>
          <div className="text-gray-400">→</div>
        </Link>
      </div>
    </div>
  )
}

export default SettingsPage
