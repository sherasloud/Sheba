"use client"

import { useState, useEffect } from "react"
import { CheckCircle, ImageIcon, XCircle } from "lucide-react"
import Link from "next/link"
import TransactionCleaner from "@/components/transaction-cleaner"

const translations = {
  en: {
    settings: "Settings",
    nidVerified: "✓ NID Verified",
    unverified: "✗ Unverified",
    nidVerifiedDesc: "Your NID and face have been verified",
    completeVerification: "Complete NID and face verification to unlock features",
    verifyNow: "Verify Now",
    manageBanners: "Manage Banners",
    manageBannersDesc: "Edit, add, or remove home page banners",
  },
  bn: {
    settings: "সেটিংস",
    nidVerified: "✓ এনআইডি যাচাইকৃত",
    unverified: "✗ অযাচাইকৃত",
    nidVerifiedDesc: "আপনার এনআইডি এবং মুখ যাচাইকৃত হয়েছে",
    completeVerification: "বৈশিষ্ট্য আনলক করতে সম্পূর্ণ এনআইডি এবং মুখ যাচাইকরণ করুন",
    verifyNow: "এখনই যাচাই করুন",
    manageBanners: "ব্যানার পরিচালনা করুন",
    manageBannersDesc: "হোমপেজ ব্যানার সম্পাদনা, যোগ করুন বা সরান",
  }
}

const SettingsPage = () => {
  const [isNidVerified, setIsNidVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState<"en" | "bn">("en")
  const [userName, setUserName] = useState("")
  const [showNameModal, setShowNameModal] = useState(false)
  const [newName, setNewName] = useState("")
  
  const t = translations[language]

  useEffect(() => {
    // Get phone and name from localStorage
    const userData = localStorage.getItem("userData")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const userPhone = user.phoneNumber || user.phone
        const name = user.name || user.userName || "ব্যবহারকারী"
        setPhone(userPhone)
        setUserName(name)
        setNewName(name)

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

  const handleNameChange = () => {
    if (newName.trim()) {
      const userData = localStorage.getItem("userData")
      if (userData) {
        const user = JSON.parse(userData)
        user.name = newName
        localStorage.setItem("userData", JSON.stringify(user))
        setUserName(newName)
      }
      setShowNameModal(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t.settings}</h1>
        <button 
          onClick={() => setLanguage(language === "en" ? "bn" : "en")}
          className="bg-[#29a9eb] text-white px-3 py-1 rounded text-sm"
        >
          {language === "en" ? "বাংলা" : "English"}
        </button>
      </div>

      <TransactionCleaner />

      {/* User Profile Section */}
      <div className="bg-gradient-to-r from-[#29a9eb] to-blue-400 text-white border-2 border-[#29a9eb] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">👤 আপনার নাম</h3>
            <p className="text-lg font-bold text-white mt-1">{userName}</p>
          </div>
          <button
            onClick={() => setShowNameModal(true)}
            className="bg-white text-[#29a9eb] px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100"
          >
            পরিবর্তন করুন
          </button>
        </div>
        <div className="text-sm text-blue-100">📱 ফোন: {phone}</div>
      </div>

      {/* Name Change Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-gray-900">✏️ নাম পরিবর্তন করুন</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="নতুন নাম লিখুন"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 bg-white text-gray-900"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleNameChange}
                className="flex-1 bg-[#29a9eb] text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
              >
                সংরক্ষণ করুন
              </button>
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

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
                {isNidVerified ? t.nidVerified : t.unverified}
              </div>
              <div className={`text-sm ${isNidVerified ? "text-green-700" : "text-orange-700"}`}>
                {isNidVerified
                  ? t.nidVerifiedDesc
                  : t.completeVerification}
              </div>
            </div>
          </div>
          {!isNidVerified && (
            <Link href="/verification" className="bg-[#29a9eb] text-white px-4 py-2 rounded-md text-sm whitespace-nowrap">
              {t.verifyNow}
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-3">
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
                <div className="font-medium">{t.manageBanners}</div>
                <div className="text-sm text-gray-500">{t.manageBannersDesc}</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </Link>
        </div>

        {/* Facebook Link */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-blue-500 rounded-lg p-4">
          <a
            href="https://facebook.com/ShebaBangIadesh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between hover:opacity-90 p-3 rounded transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white text-blue-600 p-3 rounded-lg font-bold text-xl">f</div>
              <div>
                <div className="font-bold text-white">📘 Sheba Facebook</div>
                <div className="text-sm text-blue-100">আমাদের অফিসিয়াল ফেসবুক পেজ ভিজিট করুন</div>
              </div>
            </div>
            <div className="text-white font-bold text-xl">→</div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
