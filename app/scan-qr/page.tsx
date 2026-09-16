"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, QrCode, Share2, Download } from "lucide-react"
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
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center justify-start">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">QR Code</div>
      </div>

      <div className="p-6 flex flex-col items-center flex-1 justify-center">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <QrCode size={48} className="text-[#29a9eb]" />
        </div>

        <h2 className="text-xl font-bold mb-2">QR Code Options</h2>
        <p className="text-center text-gray-600 mb-8">Choose what you want to do with QR codes</p>

        <div className="w-full space-y-4">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-[#29a9eb] text-white py-4 px-8 rounded-lg w-full flex items-center justify-center text-lg font-medium"
          >
            <QrCode size={20} className="mr-3" />
            Scan QR Code
          </button>

          <button
            onClick={() => setShowQRShare(true)}
            className="bg-green-600 text-white py-4 px-8 rounded-lg w-full flex items-center justify-center text-lg font-medium"
          >
            <Share2 size={20} className="mr-3" />
            Share My QR Code
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
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">My QR Code</div>
      </div>

      <div className="p-6 flex flex-col items-center flex-1 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded-lg"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-bold mb-2">{userName}</h3>
          <p className="text-gray-600">{phoneNumber}</p>
          <p className="text-sm text-gray-500 mt-2">Scan this code to send me money</p>
        </div>

        <div className="w-full space-y-3">
          <button
            onClick={shareQR}
            className="bg-green-600 text-white py-3 px-6 rounded-lg w-full flex items-center justify-center font-medium"
          >
            <Share2 size={20} className="mr-2" />
            Share QR Code
          </button>

          <button
            onClick={downloadQR}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg w-full flex items-center justify-center font-medium"
          >
            <Download size={20} className="mr-2" />
            Download QR Code
          </button>
        </div>

        {isAdmin && (
          <Link href="/development-app" className="w-full mt-8">
            <button className="bg-indigo-600 text-white py-3 px-6 rounded-lg w-full flex items-center justify-center font-medium hover:bg-indigo-700 transition">
              🛠️ Development App
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
      const data = imageData.data
      const width = imageData.width
      const height = imageData.height

      const threshold = 120
      const binaryData = new Uint8Array(width * height)

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        binaryData[i / 4] = gray < threshold ? 0 : 1
      }

      const finderPatterns = findFinderPatterns(binaryData, width, height)

      if (finderPatterns.length >= 3) {
        const hasValidStructure = validateQRStructure(finderPatterns, width, height)

        if (hasValidStructure) {
          // Return different QR types for testing
          const qrTypes = ["send_money", "cashout", "payment", "add_money"]
          const randomType = qrTypes[Math.floor(Math.random() * qrTypes.length)]

          return JSON.stringify({
            type: `sheba_${randomType}`,
            service: randomType.replace("_", " "),
            name: "Demo User",
            phone: "01700000000",
            account: `SHEBA01700000000`,
            timestamp: new Date().toISOString(),
            version: "1.0",
          })
        }
      }

      return null
    } catch (error) {
      return null
    }
  }

  const findFinderPatterns = (
    binaryData: Uint8Array,
    width: number,
    height: number,
  ): Array<{ x: number; y: number; size: number }> => {
    const patterns: Array<{ x: number; y: number; size: number }> = []
    const minSize = 21
    const step = 5

    for (let y = 0; y < height - minSize; y += step) {
      for (let x = 0; x < width - minSize; x += step) {
        const patternSize = checkFinderPattern(binaryData, width, height, x, y)
        if (patternSize > 0) {
          patterns.push({ x, y, size: patternSize })
          x += patternSize
        }
      }
    }

    return patterns
  }

  const checkFinderPattern = (
    binaryData: Uint8Array,
    width: number,
    height: number,
    startX: number,
    startY: number,
  ): number => {
    const patternSize = 21
    if (startX + patternSize >= width || startY + patternSize >= height) return 0

    const centerX = startX + Math.floor(patternSize / 2)
    const centerY = startY + Math.floor(patternSize / 2)

    let blackCount = 0
    let whiteCount = 0

    for (let x = startX; x < startX + patternSize; x++) {
      const index = centerY * width + x
      if (index < binaryData.length) {
        if (binaryData[index] === 0) blackCount++
        else whiteCount++
      }
    }

    for (let y = startY; y < startY + patternSize; y++) {
      const index = y * width + centerX
      if (index < binaryData.length) {
        if (binaryData[index] === 0) blackCount++
        else whiteCount++
      }
    }

    const ratio = blackCount / (blackCount + whiteCount)
    if (ratio > 0.4 && ratio < 0.7) {
      return patternSize
    }

    return 0
  }

  const validateQRStructure = (
    patterns: Array<{ x: number; y: number; size: number }>,
    width: number,
    height: number,
  ): boolean => {
    if (patterns.length < 3) return false

    const distances = []
    for (let i = 0; i < patterns.length - 1; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const dx = patterns[i].x - patterns[j].x
        const dy = patterns[i].y - patterns[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        distances.push(distance)
      }
    }

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length
    const minDistance = Math.min(...distances)
    const maxDistance = Math.max(...distances)

    return avgDistance > 100 && avgDistance < Math.min(width, height) / 3 && maxDistance / minDistance < 2
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

  // Single test function for development
  const testScan = () => {
    const qrTypes = ["send_money", "cashout", "payment", "add_money"]
    const randomType = qrTypes[Math.floor(Math.random() * qrTypes.length)]

    const testData = JSON.stringify({
      type: `sheba_${randomType}`,
      service: randomType.replace("_", " "),
      name: "Test User",
      phone: "01700000000",
      account: "SHEBA01700000000",
      timestamp: new Date().toISOString(),
      version: "1.0",
    })
    handleScanResult(testData)
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

          <div className="mt-6 w-full">
            <button onClick={testScan} className="bg-green-600 text-white py-3 px-6 rounded-md w-full">
              Test QR Scan (Demo)
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
