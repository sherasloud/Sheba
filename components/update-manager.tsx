"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Download, RefreshCw } from "lucide-react"

export default function UpdateManager() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [newVersion, setNewVersion] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    console.log("[UpdateManager] Initializing global update system")

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[UpdateManager] Service worker registered for global updates")

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[UpdateManager] New version detected globally")
                  setUpdateAvailable(true)
                  setShowUpdatePrompt(true)
                }
              })
            }
          })

          // Check for updates immediately
          if (registration.active) {
            registration.active.postMessage({ type: "CHECK_UPDATE" })
          }
        })
        .catch((error) => {
          console.error("[UpdateManager] Service worker registration failed:", error)
        })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "UPDATE_AVAILABLE") {
          console.log("[UpdateManager] Global update available:", event.data.version)
          setUpdateAvailable(true)
          setNewVersion(event.data.version)
          setShowUpdatePrompt(true)

          // Store update info
          localStorage.setItem(
            "pendingUpdate",
            JSON.stringify({
              version: event.data.version,
              timestamp: Date.now(),
            }),
          )
        }
      })
    }

    // Check for updates via API (backup method)
    const checkUpdates = async () => {
      try {
        const response = await fetch("/api/version", { cache: "no-cache" })
        const data = await response.json()
        const currentVersion = localStorage.getItem("appVersion") || "1.0.0"

        if (data.version !== currentVersion) {
          console.log("[UpdateManager] API detected new version:", data.version)
          setUpdateAvailable(true)
          setNewVersion(data.version)
          setShowUpdatePrompt(true)
        }
      } catch (error) {
        console.error("[UpdateManager] Error checking updates via API:", error)
      }
    }

    // Check immediately and then every minute
    checkUpdates()
    const interval = setInterval(checkUpdates, 60000)

    // Check for pending updates on load
    const pendingUpdate = localStorage.getItem("pendingUpdate")
    if (pendingUpdate) {
      const updateInfo = JSON.parse(pendingUpdate)
      const currentVersion = localStorage.getItem("appVersion") || "1.0.0"

      if (updateInfo.version !== currentVersion) {
        setUpdateAvailable(true)
        setNewVersion(updateInfo.version)
        setShowUpdatePrompt(true)
      }
    }

    return () => clearInterval(interval)
  }, [])

  const handleUpdate = async () => {
    console.log("[UpdateManager] Starting global update process")
    setIsUpdating(true)

    try {
      // Clear all caches for fresh content
      if ("caches" in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
        console.log("[UpdateManager] Cleared all caches")
      }

      // Update service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
        }
      }

      // Update version tracking
      localStorage.setItem("appVersion", newVersion)
      localStorage.setItem("lastUpdateTime", Date.now().toString())
      localStorage.removeItem("pendingUpdate")

      console.log("[UpdateManager] Updated to version:", newVersion)

      // Force reload to apply updates
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("[UpdateManager] Update failed:", error)
      setIsUpdating(false)
    }
  }

  const dismissUpdate = () => {
    setShowUpdatePrompt(false)
    // Show again in 5 minutes
    setTimeout(() => {
      if (updateAvailable) {
        setShowUpdatePrompt(true)
      }
    }, 300000)
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg animate-in slide-in-from-top">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0 animate-pulse" />
        <div className="flex-1">
          <h3 className="font-semibold">🌍 Global Update Available!</h3>
          <p className="text-sm opacity-90">Version {newVersion} - Updating worldwide</p>
          <p className="text-xs opacity-75">Real-time synchronization active</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={dismissUpdate} disabled={isUpdating}>
            Later
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            {isUpdating ? "Updating..." : "Update Now"}
          </Button>
        </div>
      </div>
    </div>
  )
}
