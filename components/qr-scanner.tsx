"use client"

import { useState, useRef, useEffect } from "react"
import { QrCode, X } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan?: (data: string) => void
  isOpen?: boolean
  onClose?: () => void
  onBack?: () => void
}

export function QRScanner({ onScan, isOpen = true, onClose, onBack }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState("")
  const [error, setError] = useState("")
  const closeScanner = onClose ?? onBack

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((track) => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => {
    if (isOpen === false) return

    let scanInterval: ReturnType<typeof setInterval> | undefined
    let cancelled = false

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported")
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsScanning(true)
        setError("")
        scanInterval = setInterval(() => {
          const video = videoRef.current
          const canvas = canvasRef.current
          const context = canvas?.getContext("2d", { willReadFrequently: true })
          if (!video || !canvas || !context || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
          const width = video.videoWidth || 640
          const height = video.videoHeight || 480
          canvas.width = width
          canvas.height = height
          context.drawImage(video, 0, 0, width, height)
          const result = jsQR(context.getImageData(0, 0, width, height).data, width, height, { inversionAttempts: "attemptBoth" })
          if (result?.data) {
            setScanResult(result.data)
            setIsScanning(false)
            if (scanInterval) clearInterval(scanInterval)
            onScan?.(result.data)
            stopCamera()
          }
        }, 150)
      } catch {
        setError("Camera access denied. Please enable camera permission and try again.")
        setIsScanning(false)
      }
    }

    startCamera()
    return () => {
      cancelled = true
      if (scanInterval) clearInterval(scanInterval)
      stopCamera()
    }
  }, [isOpen, onScan])

  const handleClose = () => {
    setIsScanning(false)
    setScanResult("")
    setError("")
    stopCamera()
    closeScanner?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-bold flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            QR Scanner
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Feed */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full aspect-square object-cover"
            autoPlay
            playsInline
          />
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="hidden"
          />
          
          {/* Scanning Frame */}
          <div className="absolute inset-0 border-2 border-sky-500 m-8 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-sm font-medium mb-2">
                {isScanning ? "Scanning live for QR code..." : "Point at a QR code"}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {scanResult && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-4 text-center">
            <p className="font-bold mb-2">QR code detected</p>
            <p className="text-sm mb-4 break-all">{scanResult}</p>
            <button
              onClick={handleClose}
              className="w-full py-2 bg-white text-green-600 rounded-full font-bold hover:bg-gray-100 transition-all"
            >
              Done
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-800 text-white p-4 rounded-lg text-center text-sm">
          <p className="mb-2">Point your camera at any QR code</p>
          <p>The scanner detects it in real time</p>
        </div>
      </div>
    </div>
  )
}
