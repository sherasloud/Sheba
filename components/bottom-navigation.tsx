"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, QrCode, MessageSquare } from "lucide-react"

const BottomNavigation = React.memo(() => {
  const pathname = usePathname()

  // Hide bottom navigation on these pages
  const hideOnPages = [
    "/login",
    "/register",
    "/welcome",
    "/forgot-pin",
    "/create-unverified",
    "/enter-phone",
    "/phone",
    "/pin",
    "/sim-detection",
    "/otp",
  ]

  // Don't render if current page is in hideOnPages array
  if (hideOnPages.includes(pathname)) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white/95">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="flex justify-around items-end px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center p-2 min-w-[60px] transition-colors duration-200 ${
              pathname === "/" ? "text-[#29a9eb]" : "text-gray-500"
            }`}
          >
            <Home size={20} strokeWidth={1.8} />
            <span className="mt-0.5 text-center text-[15px] font-normal">Home</span>
          </Link>
          <Link
            href="/scan-qr"
            className={`flex flex-col items-center justify-center p-2 min-w-[60px] transition-colors duration-200 ${
              pathname === "/scan-qr" ? "text-[#29a9eb]" : "text-gray-500"
            }`}
          >
            <QrCode size={20} strokeWidth={1.8} />
            <span className="mt-0.5 text-center text-[15px] font-normal">Scan QR</span>
          </Link>
          <Link
            href="/inbox"
            className={`flex flex-col items-center justify-center p-2 min-w-[60px] transition-colors duration-200 ${
              pathname === "/inbox" ? "text-[#29a9eb]" : "text-gray-500"
            }`}
          >
            <MessageSquare size={20} strokeWidth={1.8} />
            <span className="mt-0.5 text-center text-[15px] font-normal">Inbox</span>
          </Link>
        </div>
      </div>
    </div>
  )
})

BottomNavigation.displayName = "BottomNavigation"

export default BottomNavigation
