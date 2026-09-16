import { Suspense } from "react"
import OTPContent from "./otp-content"

export default function OTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#1FBFFF] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      }
    >
      <OTPContent />
    </Suspense>
  )
}
