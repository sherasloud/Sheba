"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function VerificationPage() {
  const [step, setStep] = useState(1) // 1: NID input, 2: Facial verification
  const [nidNumber, setNidNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [videoReady, setVideoReady] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [cameraError, setCameraError] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setVideoReady(true)
        setHasPermission(true)
        console.log("[v0] Camera started successfully")
      }
    } catch (err) {
      setHasPermission(false)
      setCameraError("Camera access denied. Please allow camera permissions.")
      console.error("[v0] Camera error:", err)
    }
  }

  useEffect(() => {
    if (step === 2) {
      startCamera()
      // Simulate face detection (in production, use ml5.js or TensorFlow.js)
      const detectionInterval = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          // Simulate face detection by checking if video is playing
          console.log("[v0] Face detection: video ready, setting faceDetected to true")
          setFaceDetected(true)
        }
      }, 500)
      return () => clearInterval(detectionInterval)
    }
  }, [step])

  // Also detect when video is playing
  useEffect(() => {
    if (videoReady) {
      // When video is ready, also set face detected after a short delay
      const timer = setTimeout(() => {
        console.log("[v0] Video ready, setting faceDetected to true")
        setFaceDetected(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [videoReady])

  // NID validation
  const validateNID = (nid: string) => {
    return /^\d{10,17}$/.test(nid.trim())
  }

  // Handle NID submission
  const handleNIDSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!nidNumber) {
      setError("Please enter your NID number")
      return
    }

    if (!validateNID(nidNumber)) {
      setError("Invalid NID format. Please enter a 10-17 digit number")
      return
    }

    // Move to facial verification step
    setStep(2)
  }

  // Handle verification complete
  const handleVerificationComplete = async () => {
    console.log("[v0] handleVerificationComplete started, faceDetected:", faceDetected)
    
    if (!faceDetected) {
      console.log("[v0] Face not detected - button should be disabled")
      setError("Please ensure your face is detected before verifying")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Get phone number from localStorage
      const phoneNumber = localStorage.getItem("phoneNumber") || localStorage.getItem("currentUser")
      console.log("[v0] Phone number from localStorage:", phoneNumber)

      if (!phoneNumber) {
        console.log("[v0] Phone number not found")
        setError("Phone number not found. Please log in again.")
        setIsLoading(false)
        return
      }

      // Save verification request
      console.log("[v0] Sending verification request to API")
      const response = await fetch("/api/verify-nid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nidNumber: nidNumber.trim(),
          phone: phoneNumber,
          faceVerified: true,
        }),
      })

      console.log("[v0] API response status:", response.status)
      const result = await response.json()
      console.log("[v0] API response:", result)

      if (result.success) {
        // Store verification request info
        sessionStorage.setItem("verificationRequestId", result.data.requestId)
        sessionStorage.setItem("verificationStatus", result.data.status)
        sessionStorage.setItem("verificationSubmittedAt", result.data.submittedAt)
        sessionStorage.setItem("nidNumber", nidNumber.trim())
        console.log("[v0] Verification data stored, redirecting to processing page")

        // Show success modal
        setError("")
        alert(result.message)
        
        // Redirect to verification processing page
        setTimeout(() => {
          console.log("[v0] Redirecting to /verification-processing")
          router.push("/verification-processing")
        }, 1500)
      } else {
        console.log("[v0] API returned error:", result.message)
        setError(result.message || "Verification failed")
      }
    } catch (err) {
      console.error("[v0] Verification error:", err)
      setError("An error occurred during verification")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: NID Input
  if (step === 1) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-light text-white text-center mb-4">
            NID Verification
          </h1>

          <form onSubmit={handleNIDSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter your NID (10-17 digits)"
                className="w-full px-4 py-3 rounded-lg border-2 border-white/30 bg-white/10 text-white placeholder-white/50 text-center text-lg font-mono focus:outline-none focus:border-white"
                maxLength={17}
              />
            </div>

            {error && <p className="text-red-200 text-sm text-center">{error}</p>}

            <button
              type="submit"
              className="w-full px-6 py-4 bg-white text-blue-600 text-lg font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg"
            >
              Continue to Facial Verification
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Step 2: Facial Verification - Clean Minimal Design (EXACTLY like mockup)
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-between py-12">
      {/* Top Section - Title & Instruction */}
      <div className="w-full text-center">
        {/* Main Title */}
        <h1 className="text-7xl font-light text-[#29a9eb] tracking-widest mb-4">
          Facial Verify
        </h1>
        
        {/* Instruction Text */}
        <p className="text-3xl font-light text-[#29a9eb] mb-12">
          task show korbe
        </p>
      </div>

      {/* Middle Section - Large Blue Circle Camera */}
      <div className="flex-1 flex items-center justify-center px-6 mb-12">
        <div className="relative w-80 h-80">
          {/* Blue Circle Container */}
          <div className="absolute inset-0 bg-[#29a9eb] rounded-full overflow-hidden shadow-xl">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Face Detection Ring */}
          {videoReady && faceDetected && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 border-4 border-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Verify Button */}
      <div className="w-full flex justify-center px-6 pb-8">
        <button
          onClick={handleVerificationComplete}
          disabled={!faceDetected || isLoading}
          className={`w-full max-w-xs py-4 rounded-full font-semibold text-lg transition-all shadow-md ${
            isLoading
              ? "bg-gray-300 text-gray-500 cursor-wait"
              : !faceDetected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#29a9eb] text-white hover:bg-[#2191d4] active:scale-95"
          }`}
        >
          {isLoading ? "Verifying..." : "Verify Now"}
        </button>
      </div>

      {/* Camera Permission Modal */}
      {hasPermission === false && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2">Camera Permission</h3>
            <p className="text-gray-700 mb-4">{cameraError}</p>
            <button
              onClick={startCamera}
              className="w-full bg-[#29a9eb] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#2191d4]"
            >
              Allow Camera
            </button>
          </div>
        </div>
      )}

      {/* Start Camera Overlay */}
      {!videoReady && hasPermission !== false && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
          <button
            onClick={startCamera}
            className="px-8 py-3 bg-[#29a9eb] text-white rounded-full font-semibold hover:bg-[#2191d4] shadow-lg"
          >
            Start Camera
          </button>
        </div>
      )}
    </div>
  )
}
