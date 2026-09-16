"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Phone,
  Plus,
  Calendar,
  FileText,
  Edit,
  Plane,
  Train,
  Heart,
  Sprout,
  Globe,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import SwipeableBannerCarousel from "@/components/swipeable-banner-carousel"
import { getProfileByPhone, subscribeToBalanceUpdates, isAdminPhone } from "@/lib/supabase/data-service"
import { ErrorBoundary } from "@/components/error-boundary"

const TAKA = "\u09F3"

interface EditableBanner {
  id: string
  image: string
  link: string
  alt: string
  priority: number
  isActive: boolean
}

export default function HomePage() {
  const router = useRouter()

  const [balance, setBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(false)

  const [userName, setUserName] = useState("User")
  const [selectedPhoto, setSelectedPhoto] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [allBanners, setAllBanners] = useState<EditableBanner[]>([])

  const formatBalance = (amount: number) => {
    return amount.toLocaleString("en-US")
  }

  const checkNIDVerificationStatus = async (phone: string) => {
    try {
      const response = await fetch(`/api/verification-status?phone=${encodeURIComponent(phone)}`)
      const result = await response.json()
      
      if (result.success) {
        // User is only verified if BOTH NID and face verification are complete
        const isFullyVerified = result.data.isVerified === true
        setIsVerified(isFullyVerified)
      } else {
        // If API fails, default to unverified
        setIsVerified(false)
      }
    } catch (error) {
      console.error("[v0] Error checking verification status:", error)
      // Default to unverified on error
      setIsVerified(false)
    }
  }

  const handleProfileClick = () => {
    if (isVerified) {
      router.push("/scan-qr?mode=share")
    } else {
      alert("Please verify your account to access this feature")
    }
  }

  const toggleBalance = () => {
    setShowBalance((prev) => !prev)
  }

  const loadBalance = useCallback(async () => {
    const currentPhone = localStorage.getItem("phoneNumber")
    if (!currentPhone) {
      setBalance(0)
      return
    }

    try {
      // ALWAYS load from Supabase - single source of truth
      const profile = await getProfileByPhone(currentPhone)
      
      if (profile) {
        const newBalance = Number(profile.balance) || 0
        setBalance(newBalance)

        // Update localStorage cache (for display only, not as fallback)
        localStorage.setItem(`userBalance_${currentPhone}`, newBalance.toString())
        localStorage.setItem("userBalance", newBalance.toString())

        // Update userData
        const userData = localStorage.getItem("userData")
        if (userData) {
          try {
            const user = JSON.parse(userData)
            user.balance = newBalance
            localStorage.setItem("userData", JSON.stringify(user))
          } catch {
            // Ignore errors
          }
        }
      } else {
        // No profile in Supabase = 0 balance (DO NOT use localStorage)
        setBalance(0)
        localStorage.setItem(`userBalance_${currentPhone}`, "0")
        localStorage.setItem("userBalance", "0")
      }
    } catch {
      // On error, set to 0 (DO NOT use corrupted localStorage)
      setBalance(0)
    }
  }, [])

  const FeatureButton = ({
    href,
    icon,
    title,
    isRestricted = true,
    isExternal = false,
    iconSize = "normal",
  }: {
    href: string
    icon: React.ReactNode
    title: string
    isRestricted?: boolean
    isExternal?: boolean
    iconSize?: "normal" | "large"
  }) => {
    const canAccess = isVerified || !isRestricted

    const linkProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}

    return (
      <Link
        href={canAccess ? href : "#"}
        className="flex flex-col items-center touch-manipulation no-tap-highlight p-2 rounded-lg active:bg-gray-100 transition-colors"
        {...linkProps}
      >
        <div className={`mb-1 flex items-center justify-center ${iconSize === "large" ? "w-9 h-9" : "w-7 h-7"}`}>
          {icon}
        </div>
        <div className="text-center text-xs font-medium leading-tight">{title}</div>
      </Link>
    )
  }

  useEffect(() => {
    // Clean up corrupted localStorage balance data
    const cleanupCorruptedBalance = () => {
      const storedBalance = localStorage.getItem("userBalance")
      if (storedBalance) {
        const bal = Number(storedBalance)
        // If balance is corrupted (too large or NaN), reset it
        if (isNaN(bal) || bal > 10000000000) {
          localStorage.removeItem("userBalance")
          const phone = localStorage.getItem("phoneNumber")
          if (phone) {
            localStorage.removeItem(`userBalance_${phone}`)
          }
        }
      }
    }
    cleanupCorruptedBalance()

    const currentPhone = localStorage.getItem("phoneNumber")
    const pinVerified = localStorage.getItem("appPinVerified")
    const pinVerifiedTime = localStorage.getItem("pinVerifiedTime")

    const isPinValid = () => {
      if (!pinVerifiedTime) return false
      const verifiedTime = Number.parseInt(pinVerifiedTime)
      const currentTime = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000
      return currentTime - verifiedTime < twentyFourHours
    }

    if (!currentPhone) {
      router.replace("/enter-phone")
      return
    }

    if (!pinVerified || !isPinValid()) {
      router.replace("/pin")
      return
    }

    const storedPhone = localStorage.getItem("phoneNumber")
    const storedName = localStorage.getItem("userName")
    const storedPhoto = localStorage.getItem("userPhoto")

    if (storedPhone) {
      setPhoneNumber(storedPhone)
      // Check actual NID verification status from database
      checkNIDVerificationStatus(storedPhone)
    }
    if (storedName) setUserName(storedName)
    if (storedPhoto) setSelectedPhoto(storedPhoto)

    loadBalance()
    setIsLoading(false)

    setTimeout(() => loadBalance(), 50)
    setTimeout(() => loadBalance(), 200)

    const handleNewTransaction = () => {
      // Reload balance on transaction
      loadBalance()
      setTimeout(() => loadBalance(), 100)
      setTimeout(() => loadBalance(), 500)
    }

    const handleFocus = () => {
      loadBalance()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadBalance()
      }
    }

    const loadBanners = () => {
      const saved = localStorage.getItem("editableBanners")
      if (saved) {
        const banners: EditableBanner[] = JSON.parse(saved)
        const activeBanners = banners.filter((b) => b.isActive).sort((a, b) => b.priority - a.priority)
        setAllBanners(activeBanners)
      } else {
        const defaultBanners: EditableBanner[] = [
          {
            id: "add-money-cloud-new-banner",
            image: "/images/add-money-cloud-banner-new.png",
            link: "/add-money",
            alt: "Add Money Banner",
            priority: 4,
            isActive: true,
          },
          {
            id: "send-money-updated",
            image: "/images/sheba-send-money-banner-updated.jpeg",
            link: "/send-money",
            alt: "Send Money Banner",
            priority: 3,
            isActive: true,
          },
          {
            id: "cashout-beach",
            image: "/images/sheba-cashout-banner-beach.jpeg",
            link: "/cashout",
            alt: "Cashout Banner",
            priority: 2,
            isActive: true,
          },
          {
            id: "add-money-bangla",
            image: "/images/add-money-banner-bangla.png",
            link: "/add-money",
            alt: "Add Money Banner",
            priority: 1,
            isActive: true,
          },
        ]
        setAllBanners(defaultBanners)
        localStorage.setItem("editableBanners", JSON.stringify(defaultBanners))
      }
    }

    loadBanners()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "editableBanners") {
        loadBanners()
      }
    }

    window.addEventListener("newTransaction", handleNewTransaction as EventListener)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("storage", handleStorageChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Subscribe to Supabase Realtime for instant balance updates across Bangladesh
    let unsubscribe: (() => void) | null = null
    if (storedPhone) {
      unsubscribe = subscribeToBalanceUpdates(storedPhone, (newBalance) => {
        setBalance(newBalance)
        localStorage.setItem(`userBalance_${storedPhone}`, newBalance.toString())
        localStorage.setItem("userBalance", newBalance.toString())
      })
    }

    return () => {
      window.removeEventListener("newTransaction", handleNewTransaction as EventListener)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("storage", handleStorageChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (unsubscribe) unsubscribe()
    }
  }, [router, loadBalance])

  if (isLoading) {
    return (
      <div className="mobile-page items-center justify-center bg-[#3498DB]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        <p className="mt-4 text-white text-sm">Loading Sheba...</p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-screen max-w-sm mx-auto relative overflow-hidden"
      style={{
        backgroundColor: "#1A2B47",
        backgroundImage: 'url("/images/sheba.png")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        touchAction: "manipulation",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      <div className="safe-area-top"></div>

      <div
        className="pb-4 pt-3 px-4"
        style={{
          backgroundColor: "#3498DB",
        }}
      >
        <div className="text-white text-center mb-3 cursor-pointer" onClick={toggleBalance}>
          <h1 className="text-xl font-bold">Sheba</h1>
          {showBalance && <div className="text-sm mt-1 font-medium">Balance: {formatBalance(balance)} Tk</div>}
        </div>
        <div className="bg-white text-black rounded-full flex items-center justify-between p-2 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={handleProfileClick}
            >
              {selectedPhoto ? (
                <img src={selectedPhoto || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-600 text-xs font-bold">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="font-medium text-sm">{userName}</div>
                {isVerified && <CheckCircle size={14} className="text-blue-500" />}
              </div>
              {phoneNumber !== "01930314459" && !isVerified && <div className="text-xs text-gray-500">Unverified</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl -mt-3 flex-1 pt-4 px-4 pb-16 overflow-y-auto">
        {/* Toll Payment Feature Available - v2 */}
        {allBanners.length > 0 && (
          <SwipeableBannerCarousel banners={allBanners} autoPlayInterval={5000} className="mb-4" />
        )}

        {/* New Features Section - Toll Payment */}
        <div className="mb-6 mt-2 w-full">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">New Features</h2>
          <div 
            onClick={() => router.push("/toll")}
            className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg active:scale-95 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <div className="inline-block bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-semibold mb-2">
                  NEW
                </div>
                <h3 className="text-xl font-bold">Toll Payment</h3>
                <p className="text-sm opacity-95 mt-1">Pay highway tolls instantly</p>
              </div>
              <div className="text-4xl">🛣</div>
            </div>
          </div>
        </div>

        {/* Toll Routes Section */}
        <div className="mb-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Toll Routes</h2>
            <button 
              onClick={() => router.push("/toll")}
              className="text-blue-600 text-xs font-medium hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => router.push("/toll?route=Dhaka%20to%20Chittagong")}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-green-400 transition-all"
            >
              <div className="text-xs text-gray-500 font-medium">Toll Route</div>
              <div className="text-sm font-semibold text-gray-800 mt-1">Dhaka → Chittagong</div>
              <div className="text-xs text-gray-600 mt-2">Typically 500 Tk</div>
            </div>
            <div 
              onClick={() => router.push("/toll?route=Dhaka%20to%20Sylhet")}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-green-400 transition-all"
            >
              <div className="text-xs text-gray-500 font-medium">Toll Route</div>
              <div className="text-sm font-semibold text-gray-800 mt-1">Dhaka → Sylhet</div>
              <div className="text-xs text-gray-600 mt-2">Typically 450 Tk</div>
            </div>
            <div 
              onClick={() => router.push("/toll?route=Dhaka%20to%20Khulna")}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-green-400 transition-all"
            >
              <div className="text-xs text-gray-500 font-medium">Toll Route</div>
              <div className="text-sm font-semibold text-gray-800 mt-1">Dhaka → Khulna</div>
              <div className="text-xs text-gray-600 mt-2">Typically 400 Tk</div>
            </div>
            <div 
              onClick={() => router.push("/toll?route=Dhaka%20to%20Rajshahi")}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-green-400 transition-all"
            >
              <div className="text-xs text-gray-500 font-medium">Toll Route</div>
              <div className="text-sm font-semibold text-gray-800 mt-1">Dhaka → Rajshahi</div>
              <div className="text-xs text-gray-600 mt-2">Typically 380 Tk</div>
            </div>
          </div>
        </div>

        {/* Toll Bridges Section - Featured Bridges */}
        <div className="mb-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Popular Bridges</h2>
            <button 
              onClick={() => router.push("/toll")}
              className="text-blue-600 text-xs font-medium hover:text-blue-700"
            >
              More
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => router.push("/toll/amount?bridge=Jamuna%20Bridge")}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all"
            >
              <div className="text-xs text-gray-500 font-medium mb-1">Bridge Toll</div>
              <div className="text-sm font-bold text-gray-900">Jamuna Bridge</div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-lg font-bold text-green-600">100</span>
                <span className="text-xs text-gray-500">Tk</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Car / Jeep</div>
            </div>
            <div 
              onClick={() => router.push("/toll/amount?bridge=Padma%20Bridge")}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all"
            >
              <div className="text-xs text-gray-500 font-medium mb-1">Bridge Toll</div>
              <div className="text-sm font-bold text-gray-900">Padma Bridge</div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-lg font-bold text-green-600">200</span>
                <span className="text-xs text-gray-500">Tk</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Car / Jeep</div>
            </div>
            <div 
              onClick={() => router.push("/toll/amount?bridge=Bangabandhu%20Bridge")}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all"
            >
              <div className="text-xs text-gray-500 font-medium mb-1">Bridge Toll</div>
              <div className="text-sm font-bold text-gray-900">Bangabandhu Bridge</div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-lg font-bold text-green-600">50</span>
                <span className="text-xs text-gray-500">Tk</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Car / Jeep</div>
            </div>
            <div 
              onClick={() => router.push("/toll/amount?bridge=Meghna%20Bridge")}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all"
            >
              <div className="text-xs text-gray-500 font-medium mb-1">Bridge Toll</div>
              <div className="text-sm font-bold text-gray-900">Meghna Bridge</div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-lg font-bold text-green-600">120</span>
                <span className="text-xs text-gray-500">Tk</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Car / Jeep</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-1 gap-y-4 mb-4">
          <FeatureButton
            href="/send-money"
            icon={<img src="/images/send-money-icon.png" alt="Send Money" className="w-5 h-5" />}
            title="Send Money"
          />
          <FeatureButton href="/recharge" icon={<Phone size={18} />} title="Recharge" />
          <FeatureButton href="/cashout" icon={<div className="text-base font-bold">Tk</div>} title="Cashout" />

          <FeatureButton href="/add-money" icon={<Plus size={18} />} title="Add Money" />
          <FeatureButton href="/transfer" icon={<ArrowLeft size={18} className="rotate-45" />} title="Transfer" />
          <FeatureButton href="/monthly-budget" icon={<Calendar size={18} />} title="Budget" />
          <FeatureButton
            href="/payment"
            icon={<Image src="/images/payment-icon.png" alt="Payment" width={32} height={32} />}
            title="Payment"
            iconSize="large"
          />
          <FeatureButton href="/bill" icon={<FileText size={18} />} title="Bill" />
          <FeatureButton href="/edu-fee" icon={<Edit size={18} />} title="Edu Fee" />
          <FeatureButton href="/air-tickets" icon={<Plane size={18} />} title="Air Tickets" />
          <FeatureButton href="/rail-tickets" icon={<Train size={18} />} title="Rail Tickets" />
          <FeatureButton href="/toll" icon={<div className="text-lg text-green-600 font-bold">🛣</div>} title="Toll Fee" />
          <FeatureButton href="/donate" icon={<Heart size={18} className="text-sky-500" />} title="Donate" />
          <FeatureButton href="/savings" icon={<Sprout size={18} />} title="Savings" />
          <FeatureButton href="/remittance" icon={<Globe size={18} />} title="Remittance" />
          <FeatureButton href="/debenture" icon={<TrendingUp size={18} />} title="Debenture" />
          <FeatureButton href="/transaction-history" icon={<FileText size={18} />} title="History" />
        </div>
      </div>
    </div>
  )
}
