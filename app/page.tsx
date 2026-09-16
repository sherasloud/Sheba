"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowLeft, Bot, Bell } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { getUserBalance } from "@/lib/data/static-data"
import { getCurrentUserAccount, getCurrentUser } from "@/lib/account-manager"
import { VerifiedBadge } from "@/components/verified-badge"
import BottomNavigation from "@/components/bottom-navigation"


export default function AppPage() {
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(false)
  const [userName, setUserName] = useState("User")
  const [selectedPhoto, setSelectedPhoto] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showIntro, setShowIntro] = useState(false)
  const [isShebaProvider, setIsShebaProvider] = useState(false)
  const [shebaTransactions, setShebaTransactions] = useState<any[]>([])
  const [hasError, setHasError] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)

  const allBanners = [
    {
      id: "send-money-woman",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/White%20Digitalism%20Basic%20Simple%20Presentation%20%283%29-1LaWqW2UnOB0FpYeQqhSDbTbcyWWYf.jpg",
      link: "/send-money",
      alt: "Send Money Easily - Sheba",
    },
    {
      id: "weather-service",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_Beige%20%26%20Soft%20Brown%20Simple%20Woman%20Fashion%20Collection%20Promo%20Banner%20Landscape%20%282%29-F4JOJmKikxpA06ocKRF3Ult13WwJWw.png",
      link: "/recharge",
      alt: "Service Available in Any Weather - Sheba",
    },
    {
      id: "add-money-first",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Red%20Illustrated%20Mountains%20Facebook%20Cover%20%281%29-jqfm7Sa0mF3h4SezF7UFZuUJLv24th.png",
      link: "/add-money",
      alt: "Add Money First - Sheba",
    },
    {
      id: "cashout-beach",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/White%20Digitalism%20Basic%20Simple%20Presentation%20%282%29-do7fvFqPJrsnuBAi6LXmcnE0cHvbha.jpg",
      link: "/cashout",
      alt: "Cashout Service - Beach Banner",
    },
    {
      id: "financial-awareness",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20192be2-4f18-4ce1-a261-7f8e10bb5f14.png",
      link: "/financial-awareness",
      alt: "Financial Awareness - Don't waste your hard-earned money",
    },
  ]

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextBanner()
    } else if (isRightSwipe) {
      previousBanner()
    }
  }

  const nextBanner = () => {
    setCurrentBannerIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % allBanners.length
      console.log(`🔄 Next Banner: ${prevIndex} → ${nextIndex}`)
      return nextIndex
    })
    resetAutoRotation()
  }

  const previousBanner = () => {
    setCurrentBannerIndex((prevIndex) => {
      const prevIdx = prevIndex === 0 ? allBanners.length - 1 : prevIndex - 1
      console.log(`🔄 Previous Banner: ${prevIdx} → ${prevIdx}`)
      return prevIdx
    })
    resetAutoRotation()
  }

  const resetAutoRotation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setTimeout(() => {
      startAutoRotation()
    }, 5000)
  }

  const startAutoRotation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % allBanners.length
        console.log(`🔄 Auto Banner Change: ${prevIndex} → ${nextIndex}`)
        return nextIndex
      })
    }, 1500)
  }

  const getLatestBalance = useCallback(async () => {
    try {
      const currentPhone = localStorage.getItem("phoneNumber")
      if (!currentPhone) return 0

      // Fetch from Neon database via API - no caching
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
        body: JSON.stringify({ phone: currentPhone }),
      })

      if (!response.ok) throw new Error('Failed to fetch profile')
      
      const data = await response.json()
      if (data.success && data.user) {
        console.log(`[v0] Balance from Neon for ${currentPhone}: ${data.user.balance}`)
        return data.user.balance
      }

      // Fallback to localStorage
      const balance = getUserBalance(currentPhone)
      console.log(`[v0] Fallback balance from localStorage for ${currentPhone}: ${balance}`)
      return balance
    } catch (err) {
      console.error("[v0] Error getting balance:", err)
      return 0
    }
  }, [])

  const refreshUserData = useCallback(async () => {
    const userData = localStorage.getItem("userData")
    const storedPhone = localStorage.getItem("phoneNumber")

    // Load user name immediately (don't wait for balance)
    const storedName = localStorage.getItem('userName')
    const storedPhoto = localStorage.getItem('selectedPhoto')
    
    if (storedPhone) setPhoneNumber(storedPhone)
    if (storedName && storedName !== "User") {
      setUserName(storedName)
    }
    if (storedPhoto) {
      setSelectedPhoto(storedPhoto)
    }

    // Then load balance
    if (userData && storedPhone) {
      const currentBalance = await getLatestBalance()
      setBalance(currentBalance)
      
      // Fetch verification status from API instead of localStorage
      try {
        const response = await fetch(`/api/verification-status?phone=${encodeURIComponent(storedPhone)}`)
        const result = await response.json()
        
        if (response.ok && result.success && result.data) {
          const isFullyVerified = result.data.isVerified === true
          setIsVerified(isFullyVerified)
        } else {
          setIsVerified(false)
        }
      } catch (error) {
        console.error("[v0] Error fetching verification status:", error)
        setIsVerified(false)
      }
    }
  }, [getLatestBalance])

  const handleStorageChange = (e: StorageEvent) => {
    const currentPhone = localStorage.getItem("phoneNumber")
    if (
      e.key === "userBalance" ||
      e.key === `userBalance_${currentPhone}` ||
      e.key === `userName_${currentPhone}` ||
      e.key === `userPhoto_${currentPhone}` ||
      e.key === "userData"
    ) {
      console.log("[v0] Storage change detected:", e.key, e.newValue)
      refreshUserData()
    }
  }

  const handleCustomNameChange = (e: CustomEvent) => {
    console.log("[v0] Custom name change event received:", e.detail)
    refreshUserData()
  }

  const handleFocus = () => refreshUserData()
  const handleVisibilityChange = () => {
    if (!document.hidden) refreshUserData()
  }

  const handleBalanceUpdate = () => {
    console.log("[v0] Manual balance update triggered")
    refreshUserData()
  }

  // Load user name immediately on mount
  useEffect(() => {
    const name = localStorage.getItem('userName')
    if (name && name !== 'User') {
      setUserName(name)
    }
  }, [])

  useEffect(() => {
    const initializeHome = async () => {
      try {
        console.log("[v0] Home page authentication check starting")

        // This ensures PIN expires when app/browser is closed
        const phone = sessionStorage.getItem("phoneNumber") || localStorage.getItem("phoneNumber")
        const pinVerified = sessionStorage.getItem("appPinVerified")
        const pinVerifiedTime = sessionStorage.getItem("pinVerifiedTime")

        console.log("[v0] Auth values:", { phone, pinVerified, pinVerifiedTime })

        if (!phone) {
          console.log("[v0] No phone number, redirecting to /enter-phone")
          router.replace("/enter-phone")
          return
        }

        console.log("[v0] Authentication passed, loading home page")

      // Fetch balance from Neon database - no caching
      let currentBalance = 0
      try {
        const response = await fetch('/api/user-profile', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
          cache: 'no-store',
          body: JSON.stringify({ phone }),
        })
        const data = await response.json()
        // Check if we have a valid user response
        if (data.success && data.user) {
          currentBalance = Number(data.user.balance) || 0
          console.log(`[v0] Balance fetched from Neon for ${phone}: ${currentBalance}`)
        } else {
          // Fallback to localStorage
          currentBalance = getUserBalance(phone)
          console.log(`[v0] No Neon user found, using localStorage balance: ${currentBalance}`)
        }
      } catch (err) {
        console.warn("[v0] Error fetching balance from Neon (non-blocking):", err)
        currentBalance = getUserBalance(phone)
      }

      const userData = {
        phoneNumber: phone,
        balance: currentBalance,
        accountNumber: phone === "01709783145" ? "ADMIN001" : phone === "01930314459" ? "ADMIN002" : `USER${Date.now()}`,
        createdAt: new Date().toISOString(),
        fullName: localStorage.getItem(`userName_${phone}`) || "User",
      }

      localStorage.setItem("userData", JSON.stringify(userData))
      localStorage.setItem("isLoggedIn", "true")

      if (!localStorage.getItem(`userName_${phone}`)) {
        localStorage.setItem(`userName_${phone}`, "User")
      }

      setBalance(currentBalance)
      setPhoneNumber(phone)
      
      // Load profile pic from localStorage
      const savedPic = localStorage.getItem(`profilePic_${phone}`)
      if (savedPic) {
        setProfilePic(savedPic)
      }

      // Fetch real name from database
      try {
        const userResponse = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phone.trim() }),
        })
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUserName(userData.fullName || "User")
          console.log(`[v0] Real name loaded: ${userData.fullName}`)
        } else {
          setUserName("User")
        }
      } catch (err) {
        console.warn("[v0] Error fetching real name, using default:", err)
        setUserName("User")
      }
      
      setIsLoading(false)
      console.log(`[v0] User setup complete with balance: ${currentBalance}`)

      // Check if this is a Sheba provider (optional - don't block on error)
      if (phone && phone.trim()) {
        try {
          const shebaResponse = await fetch('/api/sheba/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phone.trim() }),
          })
          if (shebaResponse.ok) {
            const shebaData = await shebaResponse.json()
            if (shebaData.provider && shebaData.provider.isVerified) {
              setIsShebaProvider(true)
              setBalance(Number(shebaData.provider.balance) || 0)
              
              // Load Sheba transactions
              try {
                const txnResponse = await fetch('/api/sheba/transactions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ providerId: shebaData.provider.id }),
                })
                if (txnResponse.ok) {
                  const txnData = await txnResponse.json()
                  setShebaTransactions(Array.isArray(txnData.transactions) ? txnData.transactions : [])
                }
              } catch (txnErr) {
                console.warn('[v0] Could not fetch transactions:', txnErr)
              }
            }
          }
        } catch (err) {
          console.warn('[v0] Error checking Sheba provider (non-blocking):', err)
        }
      }
      } catch (err) {
        console.error('[v0] Critical error in initializeHome:', err)
        setHasError(true)
        setIsLoading(false)
      }
    }

    initializeHome()

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("nameChanged", handleCustomNameChange as EventListener)
    window.addEventListener("balanceUpdated", handleBalanceUpdate)

    startAutoRotation()

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("nameChanged", handleCustomNameChange as EventListener)
      window.removeEventListener("balanceUpdated", handleBalanceUpdate)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [router, refreshUserData])

  const formatBalance = (amount: number) => {
    return amount.toLocaleString("en-US")
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
    console.log("[v0] Balance visibility toggled to:", !showBalance)
  }

  if (hasError) {
    return (
      <div className="mobile-page items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Something went wrong</p>
          <button
            onClick={() => {
              setHasError(false)
              window.location.reload()
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mobile-page items-center justify-center bg-[#3498DB]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        <p className="mt-4 text-white text-sm">Loading Sheba...</p>
      </div>
    )
  }

  const FeatureButton = ({
    href,
    icon,
    title,
    isRestricted = true,
    isExternal = false,
    iconSize = "normal",
    requiresBalance = false,
  }: {
    href: string
    icon: React.ReactNode
    title: string
    isRestricted?: boolean
    isExternal?: boolean
    iconSize?: "normal" | "extra-large" | "super-large"
    requiresBalance?: boolean
  }) => {
    const linkProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}

    return (
      <Link
        href={href}
        className="flex flex-col items-center touch-manipulation no-tap-highlight p-2 rounded-lg active:bg-gray-100 transition-colors"
        {...linkProps}
      >
        <div
          className={`mb-1 flex items-center justify-center ${
            iconSize === "super-large"
              ? "w-16 h-16"
              : iconSize === "extra-large"
                ? "w-12 h-12"
                : iconSize === "large"
                  ? "w-9 h-9"
                  : "w-7 h-7"
          }`}
        >
          {icon}
        </div>
        <div className="text-center text-xs font-medium leading-tight">{title}</div>
      </Link>
    )
  }

  return (
    <div
      className="flex min-h-screen w-full max-w-[430px] mx-auto flex-col relative overflow-hidden bg-white text-[#142033] shadow-sm"
      style={{ paddingBottom: "calc(78px + env(safe-area-inset-bottom))" }}
    >
      <div className="h-7 bg-white" />

      <header className="bg-white px-6 pb-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="w-10" />
          <img src="/images/seba-logo-splash.png" alt="সেবা" className="h-12 w-auto object-contain" />
          <button type="button" aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center text-[#142033]">
            <Bell size={38} strokeWidth={1.8} />
            <span className="absolute right-0 top-0 h-4 w-4 rounded-full bg-[#ef4b55]" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <button type="button" onClick={handleProfileClick} className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#36a9e1] text-2xl font-semibold text-white">
            {profilePic || selectedPhoto ? <img src={profilePic || selectedPhoto || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" /> : userName.slice(0, 2).toUpperCase()}
          </button>
          <div className="min-w-0">
            <p className="truncate text-[30px] font-normal text-[#485163]">Hi {userName},</p>
            <button type="button" onClick={toggleBalance} className="mt-4 text-[30px] tracking-[0.35em] text-[#142033]" aria-label="Toggle balance">
              {showBalance ? `${formatBalance(balance)} ৳` : "•••••• ৳"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-white px-5 pb-8 pt-5">
        <div className="relative mb-9 overflow-hidden rounded-[22px] shadow-[0_8px_22px_rgba(30,64,88,0.12)] select-none" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <Link href="/financial-awareness" className="block">
            <img src="/images/home-reference-banner.jpg" alt="কাজে লাগবে ভাই" className="h-40 w-full object-cover" draggable={false} />
          </Link>
        </div>
        {/* Sheba Provider Transactions */}
        {isShebaProvider && (
          <div className="mb-4 bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-900">Recent Transactions</h3>
              <button
                onClick={() => router.push('/sheba/withdraw')}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition"
              >
                Withdraw
              </button>
            </div>
            {shebaTransactions.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shebaTransactions.slice(0, 5).map((txn: any) => (
                  <div key={txn.id} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">Shusto Paid</p>
                      <p className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+৳{Number(txn.amount).toLocaleString('bn-BD')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-x-2 gap-y-14 mb-4">
          <FeatureButton
            href="/send-money"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2876%29-yfBvAoE1ZfWE7IuAvwo62KopWylbvL.png"
                alt="Send Money"
                className="w-12 h-12 object-contain"
              />
            }
            title="Send Money"
            iconSize="extra-large"
            requiresBalance={true}
          />
          <FeatureButton
            href="/recharge"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled_design__84_-removebg-preview-0Hil3lZKtt6LKbSMp46OjzWv0rogTO.png"
                alt="Recharge"
                className="w-12 h-12 object-contain"
              />
            }
            title="Recharge"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/cashout"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/64e0899a-7037-486a-8776-25e8a5b953fb.jpeg"
                alt="Cashout"
                className="w-12 h-12 object-cover"
                style={{
                  objectPosition: "center 60%",
                  clipPath: "inset(20% 0 0 0)",
                }}
              />
            }
            title="Cashout"
            iconSize="extra-large"
            requiresBalance={true}
          />

          <FeatureButton
            href="/add-money"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2869%29-Is4eXYvHDgPEoH9KI3T3nCglc8DUav.png"
                alt="Add Money"
                className="w-12 h-12 object-contain"
              />
            }
            title="Add Money"
            iconSize="extra-large"
          />

          <FeatureButton
            href="/monthly-budget"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2873%29-Wggx68AVJrS0LO5ulwzCBo8U8HFeOX.png"
                alt="Budget"
                className="w-12 h-12 object-contain"
              />
            }
            title="Budget"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/payment"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2867%29-bU3Kc3d0szAI9B3B63i0NgKXKurhej.png"
                alt="Payment"
                className="w-12 h-12 object-contain"
              />
            }
            title="Payment"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/bill"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2880%29-7fbg9uLBhrp9GYtiIJJJJiaPCDTjHM.png"
                alt="Bill"
                className="w-12 h-12 object-contain"
              />
            }
            title="Bill"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/edu-fee"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2874%29-xRFkM5LL7L6QkHnPXyuzV9b1eF9M6O.png"
                alt="Edu Fee"
                className="w-12 h-12 object-contain"
              />
            }
            title="Edu Fee"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/air-tickets"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2889%29-Pt9GXwcc6ozU7Cz2uZclYH70hprrI4.png"
                alt="Air Tickets"
                className="w-12 h-12 object-contain"
              />
            }
            title="Air Tickets"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/rail-tickets"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rain%20icon-vxfPYPWHx1PGYWsC5dploh54k4fS0Y.png"
                alt="Rail Tickets"
                className="w-12 h-12 object-contain"
              />
            }
            title="Rail Tickets"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/toll"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design-13-EGLDGz2iHEJJ3hD65CAOcuSQ4uBiGr.png"
                alt="Toll"
                className="w-14 h-14 object-contain"
              />
            }
            title="Toll"
            iconSize="extra-large"
            requiresBalance={true}
          />
          <FeatureButton
            href="/remittance"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rain%20icon%20%283%29-Swe8FyJVHrPOQPHKHXZUW7q9hRAdqd.png"
                alt="Remittance"
                className="w-12 h-12 object-contain"
              />
            }
            title="Remittance"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/savings"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2887%29-dqA8QsSdamP9zvKIHqflNBxiamV7Og.png"
                alt="Savings"
                className="w-12 h-12 object-contain"
              />
            }
            title="Savings"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/debenture"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2888%29-0UrMS1Rj8GBUNl63meBJYMHpaptuC0.png"
                alt="Debenture"
                className="w-12 h-12 object-contain"
              />
            }
            title="Debenture"
            iconSize="extra-large"
          />
          <FeatureButton
            href="/donate"
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2885%29-bpoiakD49ghcbykza442ACOtXMWpLq.png"
                alt="Donate"
                className="w-12 h-12 object-contain"
              />
            }
            title="Donate"
            iconSize="super-large"
          />
          <FeatureButton
            href="/sheba-live"
            icon={<Bot size={32} className="text-[#3498DB]" />}
            title="Sheba Live"
            iconSize="extra-large"
          />
        </div>
      </main>
      <BottomNavigation />
    </div>
  )
}

export function InitialLoader() {
  const router = useRouter()

  useEffect(() => {
    const introVideoPlayed = sessionStorage.getItem("introVideoPlayed")

    if (introVideoPlayed === "true") {
      router.replace("/home")
    } else {
      router.replace("/intro-video")
    }
  }, [router])

  return (
    <div className="mobile-page items-center justify-center bg-[#3498DB]">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      <p className="mt-4 text-white text-sm">Loading Sheba...</p>
    </div>
  )
}
