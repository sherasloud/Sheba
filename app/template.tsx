"use client"

import type React from "react"

import BottomNavigation from "@/components/bottom-navigation"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16">
      {children}
      <BottomNavigation />
    </div>
  )
}
