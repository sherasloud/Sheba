"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function DiditCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = (searchParams.get("status") || "").toLowerCase()
    const sessionId = searchParams.get("verificationSessionId") || ""
    if (status === "approved" || status === "completed" || status === "success") {
      sessionStorage.setItem("diditKycApproved", "true")
      sessionStorage.setItem("diditSessionId", sessionId)
    } else {
      sessionStorage.removeItem("diditKycApproved")
    }
    router.replace(`/onboarding?kyc=${status || "pending"}`)
  }, [router, searchParams])

  return <main className="flex min-h-[100dvh] items-center justify-center bg-white text-[#38afe8]">যাচাইকরণ ফলাফল গ্রহণ করা হচ্ছে...</main>
}
