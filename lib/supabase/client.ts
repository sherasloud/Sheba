import { createBrowserClient } from "@supabase/ssr"

// Safe wrapper - returns null if Supabase env vars are not configured
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.warn("[v0] Supabase is not configured. Using fallback storage.")
    return null as any
  }

  try {
    const parsedUrl = new URL(url)
    if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error("Invalid Supabase URL protocol")
    return createBrowserClient(parsedUrl.toString(), key)
  } catch {
    console.warn("[v0] Supabase URL is invalid. Using Neon APIs instead.")
    return null as any
  }
}
