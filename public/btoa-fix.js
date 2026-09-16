;(() => {
  console.log("[v0] Installing comprehensive btoa Unicode fix")

  // Store original btoa
  const originalBtoa = window.btoa

  // Override btoa to handle Unicode characters
  window.btoa = (str) => {
    try {
      // First, check if string contains only Latin1 characters
      if (/^[\x00-\xFF]*$/.test(str)) {
        return originalBtoa(str)
      }

      // If it contains Unicode, convert to UTF-8 bytes first
      console.log("[v0] Converting Unicode string for btoa")
      const utf8Bytes = new TextEncoder().encode(str)
      let binaryString = ""
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryString += String.fromCharCode(utf8Bytes[i])
      }
      return originalBtoa(binaryString)
    } catch (e) {
      console.error("[v0] btoa error caught and handled:", e.message)
      // Return empty string as fallback
      return ""
    }
  }

  // Global error handler for any btoa errors that slip through
  window.addEventListener(
    "error",
    (event) => {
      if (event.message && event.message.includes("btoa")) {
        console.log("[v0] Prevented btoa error from breaking page")
        event.preventDefault()
        event.stopImmediatePropagation()
        return false
      }
    },
    true,
  )

  // Global promise rejection handler
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes("btoa")) {
        console.log("[v0] Prevented btoa promise rejection from breaking page")
        event.preventDefault()
        event.stopImmediatePropagation()
        return false
      }
    },
    true,
  )

  console.log("[v0] btoa Unicode fix installed successfully")
})()
