"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export default function IntroVideoPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)

  useEffect(() => {
    const handleVideoEnd = () => {
      setVideoEnded(true)
      sessionStorage.setItem("introVideoPlayed", "true")
      setTimeout(() => {
        router.replace("/home")
      }, 500)
    }

    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener("ended", handleVideoEnd)
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("ended", handleVideoEnd)
      }
    }
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <video
        ref={videoRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Yellow%20and%20Black%20Vintage%20Short%20Film%20Motivation%20Mobile%20Video%20%281%29-kC5GDQO2eOC535k3L83vDggJF6aYP7.mp4"
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        onEnded={() => setVideoEnded(true)}
      >
        Your browser does not support the video tag.
      </video>
      {videoEnded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#29a9eb]"></div>
          <p className="mt-4 text-gray-300 text-sm">Loading app...</p>
        </div>
      )}
    </div>
  )
}
