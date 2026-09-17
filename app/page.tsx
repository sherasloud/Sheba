"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bot, Bell } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { getUserBalance } from "@/lib/data/static-data"
import { getCurrentUserAccount, getCurrentUser } from "@/lib/account-manager"

export default function AppPage() {
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(false) // Balance hidden by default, click "Sheba" to show
  const [userName, setUserName] = useState("User")
  const [selectedPhoto, setSelectedPhoto] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showIntro, setShowIntro] = useState(false)

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

  const getLatestBalance = useCallback(() => {
    try {
      // First, try to get from account manager (most accurate)
      const currentUser = getCurrentUser()
      if (currentUser) {
        const account = getCurrentUserAccount()
        if (account) {
          console.log(`[v0] Balance from account manager for ${currentUser.phone}: ${account.balance}`)
          return account.balance
        }
      }
      
      // Fallback to localStorage
      const currentPhone = localStorage.getItem("phoneNumber")
      if (!currentPhone) return 0

      const balance = getUserBalance(currentPhone)
      console.log(`[v0] Latest balance loaded for ${currentPhone}: ${balance}`)
      return balance
    } catch (err) {
      console.error("[v0] Error getting balance:", err)
      return 0
    }
  }, [])

  const refreshUserData = useCallback(async () => {
    const userData = localStorage.getItem("userData")
    const storedPhone = localStorage.getItem("phoneNumber")

    if (userData && storedPhone) {
      const currentBalance = getLatestBalance()
      setBalance(currentBalance)
      console.log("[v0] Balance refreshed:", currentBalance)
    }

    const storedVerified = localStorage.getItem("isVerified")
    const storedName = localStorage.getItem(`userName_${storedPhone}`)
    const storedPhoto = localStorage.getItem(`userPhoto_${storedPhone}`)

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }

    if (storedPhone) setPhoneNumber(storedPhone)
    if (storedName) {
      setUserName(storedName)
    } else {
      setUserName("User")
    }
    if (storedPhoto) {
      setSelectedPhoto(storedPhoto)
    } else {
      setSelectedPhoto("")
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

  useEffect(() => {
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

    if (!pinVerified || pinVerified !== "true") {
      console.log("[v0] PIN not verified in session, redirecting to /pin")
      router.replace("/pin")
      return
    }

    console.log("[v0] Authentication passed, loading home page")

    const currentBalance = getUserBalance(phone)
    console.log(`[v0] Balance loaded for ${phone}: ${currentBalance}`)

    const userData = {
      phoneNumber: phone,
      balance: currentBalance,
      isVerified: true,
      accountNumber: phone === "01709783145" ? "ADMIN001" : phone === "01930314459" ? "ADMIN002" : `USER${Date.now()}`,
      createdAt: new Date().toISOString(),
      fullName: localStorage.getItem(`userName_${phone}`) || "User",
    }

    localStorage.setItem("userData", JSON.stringify(userData))
    localStorage.setItem("isVerified", "true")
    localStorage.setItem("isLoggedIn", "true")

    if (!localStorage.getItem(`userName_${phone}`)) {
      localStorage.setItem(`userName_${phone}`, "User")
    }

    setBalance(currentBalance)
    setUserName(localStorage.getItem(`userName_${phone}`) || "User")
    setIsVerified(true)
    setPhoneNumber(phone)
    setIsLoading(false)
    console.log(`[v0] User setup complete with balance: ${currentBalance}`)

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
  }: {
    href: string
    icon: React.ReactNode
    title: string
    isRestricted?: boolean
    isExternal?: boolean
    iconSize?: "normal" | "extra-large" | "super-large"
  }) => {
    const canAccess = isVerified || !isRestricted

    const linkProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}

    return (
      <Link
        href={canAccess ? href : "#"}
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
      className="flex flex-col h-screen max-w-sm mx-auto relative overflow-hidden"
      style={{
        backgroundColor: "#1A2B47",
        backgroundImage: 'url("/images/sheba.png")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
      }}
    >
      <div className="safe-area-top"></div>

      <div className="bg-white px-5 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="w-11" />
          <img src="/images/seba-logo-splash.png" alt="সেবা" className="h-10 w-auto object-contain" />
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center text-[#142033]"
          >
            <Bell size={30} strokeWidth={1.8} />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#ef4b55]" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleProfileClick}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#36a9e1] text-xl font-semibold text-white"
          >
            {selectedPhoto ? (
              <img src={selectedPhoto || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              userName.slice(0, 2).toUpperCase()
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-2xl font-normal text-[#485163]">Hi {userName},</p>
            <button
              type="button"
              onClick={toggleBalance}
              className="mt-2 text-2xl tracking-[0.3em] text-[#142033]"
              aria-label="Toggle balance"
            >
              {showBalance ? `${formatBalance(balance)} ৳` : "•••••• ৳"}
            </button>
          </div>
        </div>

      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-16 pt-3">
        <div
          className="mb-4 relative overflow-hidden rounded-2xl shadow-md select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Link href={allBanners[currentBannerIndex].link} className="block">
            <img
              src={allBanners[currentBannerIndex].image || "/placeholder.svg"}
              alt={allBanners[currentBannerIndex].alt}
              className="w-full h-32 object-cover rounded-2xl transition-all duration-500"
              draggable={false}
            />
          </Link>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {allBanners.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to banner ${index + 1}`}
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  index === currentBannerIndex ? "bg-white shadow-lg scale-125" : "bg-white/50"
                }`}
                onClick={() => {
                  setCurrentBannerIndex(index)
                  resetAutoRotation()
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-5 mb-4">
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
            href="/transfer"
            icon={<ArrowLeft size={32} className="rotate-45 text-red-500" />}
            title="Transfer"
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
            iconSize="super-large"
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
            iconSize="super-large"
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
      </div>
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
