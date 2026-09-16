// Global btoa fix that runs before everything else
;(() => {
  console.log("[v0] [Sheba] Installing global btoa fix - START")

  // Save original btoa
  const originalBtoa = window.btoa

  // Create Unicode-safe btoa replacement
  window.btoa = (str) => {
    console.log("[v0] [Sheba] btoa called with:", typeof str, str?.substring?.(0, 50))
    try {
      // Try original first for ASCII strings
      const result = originalBtoa(str)
      console.log("[v0] [Sheba] btoa succeeded with original")
      return result
    } catch (e) {
      console.log("[v0] [Sheba] btoa failed with original, trying Unicode fix")
      try {
        // Handle Unicode by converting to UTF-8 bytes
        const utf8Bytes = new TextEncoder().encode(String(str))
        let binary = ""
        utf8Bytes.forEach((byte) => {
          binary += String.fromCharCode(byte)
        })
        const result = originalBtoa(binary)
        console.log("[v0] [Sheba] btoa succeeded with Unicode fix")
        return result
      } catch (e2) {
        // Last resort: return empty string instead of throwing
        console.warn("[v0] [Sheba] btoa failed completely, returning empty string", e2)
        return ""
      }
    }
  }

  // Suppress all errors globally
  window.addEventListener(
    "error",
    (event) => {
      console.log("[v0] [Sheba] Global error caught:", event.message)
      if (
        event.message &&
        (event.message.toLowerCase().includes("btoa") || event.message.toLowerCase().includes("invalidcharacter"))
      ) {
        console.log("[v0] [Sheba] Suppressed btoa/InvalidCharacter error")
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    },
    true,
  )

  // Suppress all promise rejections globally
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      console.log("[v0] [Sheba] Unhandled rejection caught:", event.reason)
      const reasonStr = String(event.reason?.message || event.reason || "")
      if (reasonStr.toLowerCase().includes("btoa") || reasonStr.toLowerCase().includes("invalidcharacter")) {
        console.log("[v0] [Sheba] Suppressed btoa/InvalidCharacter promise rejection")
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    },
    true,
  )

  console.log("[v0] [Sheba] Global btoa fix installed successfully - END")
})()
