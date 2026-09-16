"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function ServiceWorkerUpdater() {
  const [waitingSw, setWaitingSw] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    const swUrl = "/sw.js"

    navigator.serviceWorker
      .register(swUrl, { scope: "/", type: "classic" }) // ensure classic SW
      .then((reg) => {
        // Update flow
        const listen = (sw: ServiceWorker | null) => {
          if (!sw) return
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingSw(sw)
            }
          })
        }
        listen(reg.waiting)
        reg.addEventListener("updatefound", () => listen(reg.installing))
      })
      .catch((err) => console.error("[SW-Updater] registration failed:", err))
  }, [])

  if (!waitingSw) return null

  const applyUpdate = () => {
    waitingSw.postMessage({ type: "SKIP_WAITING" })
    // Give the worker a tick, then reload
    setTimeout(() => window.location.reload(), 125)
  }

  return (
    <div className="fixed bottom-24 inset-x-0 flex justify-center px-4 z-40">
      <Card className="max-w-sm w-full bg-blue-600 text-white">
        <CardContent className="flex items-center justify-between p-3">
          <span className="flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" /> New update ready
          </span>
          <Button size="sm" onClick={applyUpdate} className="bg-white text-blue-600 hover:bg-blue-100">
            Update Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
