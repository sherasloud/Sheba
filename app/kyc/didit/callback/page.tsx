"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function DiditCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = (searchParams.get("status") || searchParams.get("decision") || "").toLowerCase()
    const sessionId = searchParams.get("verificationSessionId") || searchParams.get("session_id") || searchParams.get("sessionId") || ""
    const approved = ["approved", "completed", "success", "verified"].includes(status)
    if (approved) {
      sessionStorage.setItem("diditKycApproved", "true")
      if (sessionId) sessionStorage.setItem("diditSessionId", sessionId)
    } else {
      sessionStorage.removeItem("diditKycApproved")
    }
    if (window.parent !== window) {
      window.parent.postMessage({ type: "didit-kyc-result", status: approved ? "approved" : status || "pending", sessionId }, window.location.origin)
      setTimeout(() => router.replace(approved ? "/?verified=success" : `/onboarding?kyc=${status || "pending"}`), 1500)
      return
    }
    router.replace(approved ? "/?verified=success" : `/onboarding?kyc=${status || "pending"}`)
  }, [router, searchParams])

  return <main className="flex min-h-[100dvh] items-center justify-center bg-white text-[#38afe8]">যাচাইকরণ ফলাফল গ্রহণ করা হচ্ছে...</main>
}
