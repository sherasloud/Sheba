"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, QrCode, Share2, Download } from "lucide-react"
import jsQR from "jsqr"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function ScanQRPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showQRShare, setShowQRShare] = useState(false)
  const [userName, setUserName] = useState("User")
  const [phoneNumber, setPhoneNumber] = useState("")

  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")

  useEffect(() => {
    // Check verification status immediately without loading state
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")
    const storedPhone = localStorage.getItem("phoneNumber")
    const storedName = localStorage.getItem("userName")

    let verified = false
    let phone = ""
    let name = "User"

    if (userData) {
      const user = JSON.parse(userData)
      verified = user.isVerified || false
      phone = user.phoneNumber || ""
      name = user.fullName || "User"
    }

    if (storedVerified) {
      verified = storedVerified === "true"
    }
    if (storedPhone) {
      phone = storedPhone
    }
    if (storedName) {
      name = storedName
    }

    // Special check for admin user - ALWAYS verified
    if (phone === "01930314459") {
      verified = true
      localStorage.setItem("isVerified", "true")
    }

    setIsVerified(verified)
    setPhoneNumber(phone)
    setUserName(name)

    // If mode is "scan", show scanner immediately
    if (mode === "scan") {
      setShowScanner(true)
    }
    // If mode is "share", show QR share immediately
    else if (mode === "share") {
      setShowQRShare(true)
    }
  }, [mode])

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="QR Code" />
  }

  if (showScanner) {
    return <QRScanner onBack={() => setShowScanner(false)} />
  }

  if (showQRShare) {
    return <QRShare onBack={() => setShowQRShare(false)} userName={userName} phoneNumber={phoneNumber} />
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "#1FBFFF" }}>
      <div className="text-white p-4 flex items-center justify-start">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">QR কোড</div>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl p-6 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-8 shadow-md">
          <QrCode size={48} className="text-[#1FBFFF]" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gray-800">QR কোড অপশন</h2>
        <p className="text-center text-gray-600 mb-10">QR কোড দিয়ে কি করতে চান?</p>

        <div className="w-full space-y-4">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-[#1FBFFF] text-white py-4 px-8 rounded-full w-full flex items-center justify-center text-lg font-medium hover:shadow-lg transition"
          >
            <QrCode size={20} className="mr-3" />
            স্ক্যান করুন
          </button>

          <button
            onClick={() => setShowQRShare(true)}
            className="bg-gradient-to-r from-green-400 to-cyan-400 text-white py-4 px-8 rounded-full w-full flex items-center justify-center text-lg font-medium hover:shadow-lg transition"
          >
            <Share2 size={20} className="mr-3" />
            শেয়ার করুন
          </button>
        </div>
      </div>
    </div>
  )
}

// QR Share Component - Shows user's QR code for receiving money
function QRShare({ onBack, userName, phoneNumber }: { onBack: () => void; userName: string; phoneNumber: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    generateQRCode()
    const adminUsers = ["01709783145", "01930314459"]
    setIsAdmin(adminUsers.includes(phoneNumber))
  }, [phoneNumber])

  const generateQRCode = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 300
    canvas.height = 300

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, 300, 300)

    // Create QR data
    const qrData = {
      type: "sheba_receive_money",
      name: userName,
      phone: phoneNumber,
      account: `SHEBA${phoneNumber}`,
      timestamp: new Date().toISOString(),
      version: "1.0",
    }

    // Simple QR pattern generation
    const data = JSON.stringify(qrData)
    const size = 25 // 25x25 grid
    const cellSize = 300 / size

    // Generate pattern based on data
    ctx.fillStyle = "black"
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = (i * size + j) % data.length
        const charCode = data.charCodeAt(index)

        // Create pattern based on character code
        if (charCode % 2 === 0 || (i < 7 && j < 7) || (i < 7 && j > size - 8) || (i > size - 8 && j < 7)) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize)
        }
      }
    }

    // Add finder patterns (corners)
    const finderSize = 7 * cellSize

    // Top-left finder pattern
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, finderSize, finderSize)
    ctx.fillStyle = "white"
    ctx.fillRect(cellSize, cellSize, finderSize - 2 * cellSize, finderSize - 2 * cellSize)
    ctx.fillStyle = "black"
    ctx.fillRect(2 * cellSize, 2 * cellSize, finderSize - 4 * cellSize, finderSize - 4 * cellSize)

    // Top-right finder pattern
    ctx.fillStyle = "black"
    ctx.fillRect(300 - finderSize, 0, finderSize, finderSize)
    ctx.fillStyle = "white"
    ctx.fillRect(300 - finderSize + cellSize, cellSize, finderSize - 2 * cellSize, finderSize - 2 * cellSize)
    ctx.fillStyle = "black"
    ctx.fillRect(300 - finderSize + 2 * cellSize, 2 * cellSize, finderSize - 4 * cellSize, finderSize - 4 * cellSize)

    // Bottom-left finder pattern
    ctx.fillStyle = "black"
    ctx.fillRect(0, 300 - finderSize, finderSize, finderSize)
    ctx.fillStyle = "white"
    ctx.fillRect(cellSize, 300 - finderSize + cellSize, finderSize - 2 * cellSize, finderSize - 2 * cellSize)
    ctx.fillStyle = "black"
    ctx.fillRect(2 * cellSize, 300 - finderSize + 2 * cellSize, finderSize - 4 * cellSize, finderSize - 4 * cellSize)
  }

  const downloadQR = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `sheba-qr-${phoneNumber}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const shareQR = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `sheba-qr-${phoneNumber}.png`, { type: "image/png" })

          if (navigator.share) {
            await navigator.share({
              title: "My Sheba QR Code",
              text: `Send money to ${userName} using this QR code`,
              files: [file],
            })
          } else {
            // Fallback - copy to clipboard or download
            downloadQR()
          }
        }
      })
    } catch (error) {
      console.error("Share failed:", error)
      downloadQR()
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "#1FBFFF" }}>
      <div className="text-white p-4 flex items-center">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">আপনার QR কোড</div>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl p-6 flex flex-col items-center overflow-y-auto">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-8 mb-8 w-full">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border-2 border-blue-200 rounded-xl"
              style={{ maxWidth: "90%", height: "auto" }}
            />
          </div>
        </div>

        <div className="text-center mb-8 w-full">
          <h3 className="text-2xl font-bold mb-2 text-gray-800">{userName}</h3>
          <p className="text-lg text-[#1FBFFF] font-semibold">{phoneNumber}</p>
          <p className="text-sm text-gray-500 mt-3">এই QR কোড স্ক্যান করে আমাকে টাকা পাঠান</p>
        </div>

        <div className="w-full space-y-3">
          <button
            onClick={shareQR}
            className="bg-[#1FBFFF] text-white py-4 px-6 rounded-full w-full flex items-center justify-center font-semibold text-lg hover:shadow-lg transition"
          >
            <Share2 size={20} className="mr-2" />
            শেয়ার করুন
          </button>

          <button
            onClick={downloadQR}
            className="bg-gray-300 text-gray-700 py-4 px-6 rounded-full w-full flex items-center justify-center font-semibold text-lg hover:bg-gray-400 transition"
          >
            <Download size={20} className="mr-2" />
            ডাউনলোড করুন
          </button>
        </div>

        {isAdmin && (
          <Link href="/development-app" className="w-full mt-8">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-full w-full flex items-center justify-center font-semibold text-lg hover:shadow-lg transition">
              ⚙️ Admin Panel
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

// Universal QR Scanner - Clean interface, handles all transaction types
function QRScanner({ onBack }: { onBack: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const [lastScanTime, setLastScanTime] = useState(0)
  const [detectedType, setDetectedType] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef<boolean>(false)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const constraints = {
        video: {
          facingMode: { ideal: "environment" }, // Try back camera, fallback to any
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false, // Don't request audio
      }

      let stream: MediaStream | null = null
      
      try {
        // Try with ideal constraints first
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        // Fallback: try without ideal facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          })
        } catch (err2) {
          // Last resort: bare minimum
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
        }
      }

      streamRef.current = stream
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playErr) {
          console.error("[v0] Video play error:", playErr)
        }

        // Start scanning after video is ready
        videoRef.current.onloadedmetadata = () => {
          setTimeout(() => {
            scanQRCode()
          }, 1000)
        }
      }
      setHasPermission(true)
      setError("")
    } catch (err: any) {
      console.error("[v0] Camera access error:", err)
      
      // Better error messaging
      let errorMsg = "Camera access is required to scan QR codes. Please allow camera permission."
      
      if (err.name === "NotAllowedError") {
        errorMsg = "📱 Camera permission denied. Enable in your browser settings: Settings > Permissions > Camera"
      } else if (err.name === "NotFoundError") {
        errorMsg = "❌ No camera device found on this device"
      } else if (err.name === "NotReadableError") {
        errorMsg = "⚠️ Camera is in use by another application. Please close it and try again."
      } else if (err.name === "OverconstrainedError") {
        errorMsg = "⚠️ Camera does not support required settings. Using default settings..."
      }
      
      setError(errorMsg)
      setHasPermission(false)
    }
  }

  const stopCamera = () => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || scanningRef.current) return

    scanningRef.current = true
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    const scan = () => {
      if (!scanningRef.current || isProcessing) return

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        const now = Date.now()
        if (now - lastScanTime > 500) {
          const qrResult = detectQRCode(imageData)
          if (qrResult) {
            setLastScanTime(now)
            handleScanResult(qrResult)
            return
          }
          setLastScanTime(now)
        }
      }

      if (scanningRef.current && !isProcessing) {
        requestAnimationFrame(scan)
      }
    }

    scan()
  }

  const detectQRCode = (imageData: ImageData): string | null => {
    try {
      const result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      })
      return result?.data ?? null
    } catch {
      return null
    }
  }

  const handleScanResult = (data: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    scanningRef.current = false
    stopCamera()

    try {
      const parsedData = JSON.parse(data)
      setDetectedType(parsedData.service || "Unknown")

      // Route to different pages based on QR type
      if (parsedData.type?.startsWith("sheba_")) {
        const serviceType = parsedData.type.replace("sheba_", "")
        const params = new URLSearchParams({
          recipient: parsedData.phone,
          name: parsedData.name,
          from: "qr_scan",
          step: "2",
        })

        let targetUrl = ""
        switch (serviceType) {
          case "send_money":
            targetUrl = `/send-money?${params.toString()}`
            break
          case "cashout":
            targetUrl = `/cashout?${params.toString()}`
            break
          case "payment":
            targetUrl = `/payment?${params.toString()}`
            break
          case "add_money":
            targetUrl = `/add-money?${params.toString()}`
            break
          default:
            targetUrl = `/send-money?${params.toString()}`
        }

        window.location.href = targetUrl
      } else {
        alert("Invalid QR code. Please scan a valid Sheba QR code.")
        setIsProcessing(false)
        startCamera()
      }
    } catch (error) {
      alert("Invalid QR code format. Please try again.")
      setIsProcessing(false)
      startCamera()
    }
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={onBack} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Scan QR Code</div>
        </div>

        <div className="p-6 flex flex-col items-center justify-center flex-1">
          <div className="text-center mb-6">
            <QrCode size={64} className="mx-auto mb-4 text-[#29a9eb]" />
            <h2 className="text-xl font-bold mb-2">Camera Permission Required</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={startCamera} className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full">
              Allow Camera Access
            </button>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Scan QR Code</div>
      </div>

      <div className="flex-1 relative">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-64 h-64 border-2 border-white rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>

              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="w-full h-0.5 bg-green-500 animate-pulse"></div>
              </div>
            </div>

            <p className="text-white text-center mt-4 bg-black bg-opacity-50 px-4 py-2 rounded">
              {isProcessing ? `Processing ${detectedType} QR...` : "Scan QR Code"}
            </p>
          </div>
        </div>

        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-center">
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing {detectedType}...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Ready to scan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
