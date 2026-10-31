"use client"

import { useEffect } from "react"

export function OrientationLock() {
  useEffect(() => {
    const orientation = screen.orientation
    if (!orientation?.lock) return

    orientation.lock("portrait-primary").catch(() => {
      // Browsers only allow orientation locking in supported standalone/fullscreen contexts.
    })
  }, [])

  return null
}
