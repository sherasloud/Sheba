"use client"

import { useEffect, useState } from "react"
import { realtimeTransferService, type TransferNotification } from "@/lib/api/realtime-transfer-service"
import { Bell, X } from "lucide-react"

export function RealtimeTransferNotification() {
  const [notifications, setNotifications] = useState<TransferNotification[]>([])
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)

  useEffect(() => {
    // Get current user's phone number
    const phone = localStorage.getItem("phoneNumber")
    if (!phone) return

    setPhoneNumber(phone)

    // Subscribe to real-time transfer updates
    const unsubscribe = realtimeTransferService.subscribeToTransfers(phone, (notification) => {
      // Add notification to list
      setNotifications((prev) => [notification, ...prev])

      // Show browser notification if permitted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.type === "received" ? "টাকা পেয়েছেন!" : "টাকা পাঠানো হয়েছে!", {
          body: `৳${notification.amount.toLocaleString()} - ${notification.phone}`,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        })
      }

      // Play notification sound
      const audio = new Audio("/notification.mp3")
      audio.play().catch(() => {
        // Ignore audio play errors
      })

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.transactionId !== notification.transactionId))
      }, 5000)

      // Update balance in real-time
      const currentBalance = Number(localStorage.getItem("userBalance") || "0")
      const newBalance =
        notification.type === "received" ? currentBalance + notification.amount : currentBalance - notification.amount

      localStorage.setItem("userBalance", newBalance.toString())
      localStorage.setItem(`userBalance_${phone}`, newBalance.toString())

      // Trigger balance update event
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "userBalance",
          newValue: newBalance.toString(),
          oldValue: currentBalance.toString(),
        }),
      )
    })

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const removeNotification = (transactionId: string) => {
    setNotifications((prev) => prev.filter((n) => n.transactionId !== transactionId))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.transactionId}
          className={`${
            notification.type === "received" ? "bg-green-500" : "bg-blue-500"
          } text-white rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in`}
        >
          <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-bold">{notification.type === "received" ? "টাকা পেয়েছেন!" : "টাকা পাঠানো হয়েছে!"}</div>
            <div className="text-sm">
              ৳{notification.amount.toLocaleString()} - {notification.phone}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {new Date(notification.timestamp).toLocaleTimeString("bn-BD")}
            </div>
          </div>
          <button
            onClick={() => removeNotification(notification.transactionId)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
