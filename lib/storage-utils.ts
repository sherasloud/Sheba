export function safeSetItem(key: string, value: string) {
  try {
    // Store as-is in localStorage (no btoa encoding needed)
    localStorage.setItem(key, value)
  } catch (error) {
    console.error(`[v0] Error storing ${key}:`, error)
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`[v0] Error retrieving ${key}:`, error)
    return null
  }
}

export function safeSetObject(key: string, value: any) {
  try {
    const jsonString = JSON.stringify(value)
    localStorage.setItem(key, jsonString)
  } catch (error) {
    console.error(`[v0] Error storing object ${key}:`, error)
  }
}

export function safeGetObject(key: string): any | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`[v0] Error retrieving object ${key}:`, error)
    return null
  }
}
