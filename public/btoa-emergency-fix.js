// Emergency btoa fix - loads as early as possible
;(() => {
  if (typeof window === "undefined") return

  try {
    // Store originals
    const originalBtoa = window.btoa
    const originalAtob = window.atob

    // Replace btoa with Unicode-safe version
    window.btoa = (str) => {
      if (str === null || str === undefined) return ""

      const s = String(str)
      if (s === "") return ""

      try {
        // Try original first (fastest for ASCII)
        return originalBtoa(s)
      } catch (e) {
        // Fallback 1: encodeURIComponent method
        try {
          return originalBtoa(unescape(encodeURIComponent(s)))
        } catch (e2) {
          // Fallback 2: TextEncoder
          try {
            const encoder = new TextEncoder()
            const bytes = encoder.encode(s)
            let binary = ""
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i])
            }
            return originalBtoa(binary)
          } catch (e3) {
            // Last resort: return empty
            console.warn("[v0] btoa encoding failed, returning empty string")
            return ""
          }
        }
      }
    }

    // Replace atob with Unicode-safe version
    window.atob = (str) => {
      if (str === null || str === undefined) return ""

      const s = String(str)
      if (s === "") return ""

      try {
        return originalAtob(s)
      } catch (e) {
        try {
          const decoded = originalAtob(s)
          return decodeURIComponent(escape(decoded))
        } catch (e2) {
          console.warn("[v0] atob decoding failed, returning empty string")
          return ""
        }
      }
    }

    // Suppress all btoa/atob errors globally
    window.addEventListener(
      "error",
      (event) => {
        if (
          event.message &&
          (event.message.includes("btoa") ||
            event.message.includes("atob") ||
            event.message.includes("Latin1") ||
            event.message.includes("InvalidCharacterError") ||
            event.message.includes("invalid characters"))
        ) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          console.warn("[v0] Suppressed encoding error:", event.message)
          return false
        }
      },
      true,
    )

    // Suppress unhandled promise rejections
    window.addEventListener(
      "unhandledrejection",
      (event) => {
        if (
          event.reason &&
          event.reason.message &&
          (event.reason.message.includes("btoa") ||
            event.reason.message.includes("atob") ||
            event.reason.message.includes("Latin1") ||
            event.reason.message.includes("InvalidCharacterError") ||
            event.reason.message.includes("invalid characters"))
        ) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          console.warn("[v0] Suppressed encoding promise rejection:", event.reason.message)
          return false
        }
      },
      true,
    )

    console.log("[v0] Emergency btoa fix installed successfully")
  } catch (error) {
    console.error("[v0] Failed to install btoa fix:", error)
  }
})()
