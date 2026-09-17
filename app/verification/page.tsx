"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, CheckCircle, AlertTriangle, Camera, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function VerificationPage() {
  const router = useRouter()
  const [nidNumber, setNidNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [step, setStep] = useState(1) // 1: NID input, 2: Video KYC
  const [videoReady, setVideoReady] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)

  useEffect(() => {
    // Get phone from localStorage
    const userData = localStorage.getItem("userData")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const userPhone = user.phoneNumber || user.phone
        setPhone(userPhone)

        // Check if already verified
        if (userPhone) {
          fetchVerificationStatus(userPhone)
        }
      } catch (error) {
        console.error("[v0] Error parsing user data:", error)
      }
    }
  }, [])

  const fetchVerificationStatus = async (userPhone: string) => {
    try {
      const response = await fetch(`/api/verification-status?phone=${encodeURIComponent(userPhone)}`)
      const result = await response.json()

      if (result.success && result.data.isVerified) {
        setIsVerified(true)
        setNidNumber(result.data.nidNumber || "")
      }
    } catch (error) {
      console.error("[v0] Error fetching verification status:", error)
    }
  }

  const validateNID = (nid: string): boolean => {
    const nidRegex = /^\d{10,17}$/
    return nidRegex.test(nid.trim())
  }

  const handleNIDSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validate NID format
    if (!validateNID(nidNumber)) {
      setError("Invalid NID format. NID should be 10-17 digits.")
      return
    }

    if (!phone) {
      setError("Phone number not found. Please log in again.")
      return
    }

    // Move to video KYC step
    setStep(2)
  }

  const handleVerificationComplete = async () => {
    if (!faceDetected) {
      setError("Please complete the video KYC and ensure your face is detected.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify-nid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nidNumber: nidNumber.trim(),
          phone,
          faceVerified: faceDetected,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setIsVerified(true)
        // Redirect to settings after 2 seconds
        setTimeout(() => {
          router.push("/settings")
        }, 2000)
      } else {
        setError(result.message || "Verification failed. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error verifying NID:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // If in step 2 (Video KYC), show video component
  if (step === 2 && !isVerified) {
    return <VideoKYCComponent 
      nidNumber={nidNumber}
      onFaceDetected={setFaceDetected}
      onComplete={handleVerificationComplete}
      onBack={() => {
        setStep(1)
        setFaceDetected(false)
        setError("")
      }}
      isLoading={isLoading}
      error={error}
      videoReady={videoReady}
      setVideoReady={setVideoReady}
    />
  }

  // If already verified, show success screen
  if (isVerified && success) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center justify-center">
          <div className="text-xl font-medium">Verification Complete</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center">NID Verified!</h2>
          <p className="text-gray-600 mb-4 text-center">
            Your NID has been verified successfully. You will be redirected to settings shortly.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 w-full max-w-md">
            <h3 className="font-bold text-green-800 mb-3">Verification Details:</h3>
            <div className="space-y-2 text-green-700 text-sm">
              <div>NID Number: {nidNumber}</div>
              <div>Status: Verified ✓</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <Link
            href="/settings"
            className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full max-w-md text-center block font-medium"
          >
            Back to Settings
          </Link>
        </div>
      </div>
    )
  }

  // If already verified, show already verified screen
  if (isVerified) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <Link href="/settings" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-xl font-medium">NID Verification</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center">Already Verified</h2>
          <p className="text-gray-600 mb-4 text-center">Your NID has already been verified.</p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 w-full max-w-md">
            <h3 className="font-bold text-green-800 mb-3">Your NID:</h3>
            <div className="space-y-2 text-green-700 text-sm">
              <div>{nidNumber}</div>
              <div>Status: Verified ✓</div>
            </div>
          </div>

          <Link
            href="/settings"
            className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full max-w-md text-center block font-medium"
          >
            Back to Settings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/settings" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">NID Verification</div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 pb-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Verify Your NID</h2>
            <p className="text-gray-600">
              Enter your National ID (NID) number to verify your account. This will unlock additional features.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">NID Information</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <div>• Bangladesh National ID (NID)</div>
              <div>• 10-17 digit number</div>
              <div>• Issued by the Election Commission</div>
              <div>• Required for account verification</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-red-600 mr-2" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleNIDSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">NID Number</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter your 10-17 digit NID number"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#29a9eb]"
                maxLength={17}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {nidNumber.length > 0 && `${nidNumber.length}/17 digits`}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2">How to find your NID number:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Check your physical NID card</li>
                <li>• Look at your NID certificate</li>
                <li>• Check official government documents</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading || nidNumber.length === 0}
              className="bg-[#29a9eb] text-white p-4 rounded-md w-full font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next: Video Verification
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Video KYC Component - Client-side face detection
interface VideoKYCProps {
  nidNumber: string
  onFaceDetected: (detected: boolean) => void
  onComplete: () => void
  onBack: () => void
  isLoading: boolean
  error: string
  videoReady: boolean
  setVideoReady: (ready: boolean) => void
}

function VideoKYCComponent({
  nidNumber,
  onFaceDetected,
  onComplete,
  onBack,
  isLoading,
  error,
  videoReady,
  setVideoReady,
}: VideoKYCProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [faceDetectedLocal, setFaceDetectedLocal] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [isScanning, setIsScanning] = useState(true)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setHasPermission(true)
        setCameraError("")
        setVideoReady(true)

        // Start face detection
        setTimeout(() => {
          detectFace()
        }, 500)
      }
    } catch (err) {
      console.error("[v0] Camera access error:", err)
      setHasPermission(false)
      setCameraError("Camera access is required. Please allow camera permission.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const detectFace = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    const detect = () => {
      if (!isScanning) return

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const faceDetectedResult = detectFaceInImage(imageData)

        if (faceDetectedResult) {
          setFaceDetectedLocal(true)
          onFaceDetected(true)
        } else {
          setFaceDetectedLocal(false)
          onFaceDetected(false)
        }
      }

      if (isScanning) {
        requestAnimationFrame(detect)
      }
    }

    detect()
  }

  const detectFaceInImage = (imageData: ImageData): boolean => {
    try {
      const data = imageData.data
      const width = imageData.width
      const height = imageData.height

      // Simple face detection: look for skin tone regions
      let skinPixels = 0
      const totalPixels = width * height

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Basic skin tone detection (HSV approach simplified)
        const rg = r - g
        const rb = r - b

        if (rg > 95 && rb > 40 && r > 95 && g > 40 && b > 20) {
          skinPixels++
        }
      }

      // If more than 5% of image is detected as skin tone, assume face is present
      const skinPercentage = skinPixels / totalPixels
      return skinPercentage > 0.05
    } catch (error) {
      console.error("[v0] Face detection error:", error)
      return false
    }
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={onBack} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Video Verification</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <Camera size={64} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Camera Permission Required</h2>
          <p className="text-gray-600 text-center mb-6">{cameraError}</p>
          <button
            onClick={startCamera}
            className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full max-w-sm"
          >
            Allow Camera Access
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Video Verification (KYC)</div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 pb-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Live Face Verification</h2>
            <p className="text-gray-600">
              Please position your face in front of the camera. Your face must be clearly visible for verification.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-red-600 mr-2" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded-lg overflow-hidden mb-6 aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {videoReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-4 border-green-500 rounded-full opacity-50"></div>
              </div>
            )}
          </div>

          {faceDetectedLocal && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle size={20} className="text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Face detected successfully!</p>
              </div>
            </div>
          )}

          {!faceDetectedLocal && videoReady && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                <p className="text-yellow-800">Waiting for face detection... Make sure your face is visible</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">Verification Info:</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <div>NID Number: {nidNumber}</div>
              <div>Face Status: {faceDetectedLocal ? "✓ Detected" : "⏳ Detecting..."}</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onComplete}
            disabled={!faceDetectedLocal || isLoading}
            className="bg-[#29a9eb] text-white p-4 rounded-md w-full font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Verifying..." : "Complete Verification"}
          </button>
          <button
            onClick={onBack}
            className="bg-gray-300 text-gray-800 p-3 rounded-md w-full font-medium mt-2 transition-colors hover:bg-gray-400"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
