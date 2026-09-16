// Safe localStorage wrapper that removes Bengali characters before storing
export const safeStorage = {
  setItem: (key: string, value: string) => {
    try {
      // Remove all Bengali Unicode characters (U+0980 to U+09FF)
      const sanitized = value.replace(/[\u0980-\u09FF]/g, "")
      localStorage.setItem(key, sanitized)
    } catch (e) {
      console.error("[v0] localStorage.setItem failed:", e)
    }
  },

  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.error("[v0] localStorage.getItem failed:", e)
      return null
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error("[v0] localStorage.removeItem failed:", e)
    }
  },

  clear: () => {
    try {
      localStorage.clear()
    } catch (e) {
      console.error("[v0] localStorage.clear failed:", e)
    }
  },
}

// Helper to sanitize any string before encoding
export function sanitizeForEncoding(str: string): string {
  // Remove Bengali Unicode characters
  return str.replace(/[\u0980-\u09FF]/g, "")
}

// Helper to sanitize objects before JSON.stringify
export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeForEncoding(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {}
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key])
    }
    return sanitized
  }

  return obj
}
