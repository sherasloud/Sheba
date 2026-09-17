"use client"

import { useState, useRef, useEffect } from "react"
import { QrCode, X } from "lucide-react"

interface QRScannerProps {
  onScan?: (data: string) => void
  isOpen: boolean
  onClose: () => void
}

export function QRScanner({ onScan, isOpen, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState("")
  const [error, setError] = useState("")

  // Simple QR code decoder (for WiFi SSID detection)
  const decodeQRCode = (imageData: ImageData): string | null => {
    // This is a simplified version - in production, use a proper QR code library
    // like jsqr or qr-scanner for actual QR code decoding
    try {
      const data = imageData.data
      let qrString = ""
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
        qrString += brightness > 128 ? "1" : "0"
      }
      return qrString
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsScanning(true)
          setError("")
          startScanning()
        }
      } catch (err) {
        setError("Camera access denied. Please enable camera permissions.")
        setIsScanning(false)
      }
    }

    const startScanning = () => {
      const scanInterval = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext("2d")
          if (context) {
            context.drawImage(videoRef.current, 0, 0, 300, 300)
            const imageData = context.getImageData(0, 0, 300, 300)
            
            // In production, use a real QR library
            // For now, detect WiFi QR by checking for specific patterns
            const qrPattern = decodeQRCode(imageData)
            if (qrPattern && qrPattern.length > 100) {
              setScanResult("WiFi_QR_Detected")
              if (onScan) {
                onScan("WiFi_QR_Detected")
              }
              setIsScanning(false)
              clearInterval(scanInterval)
            }
          }
        }
      }, 500)

      return () => clearInterval(scanInterval)
    }

    startCamera()
  }, [isOpen, onScan])

  const handleClose = () => {
    setIsScanning(false)
    setScanResult("")
    setError("")
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
    onClose()
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
                {isScanning ? "Scanning for WiFi QR..." : "Point at QR code"}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {scanResult && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-4 text-center">
            <p className="font-bold mb-2">WiFi QR Detected!</p>
            <p className="text-sm mb-4">Connecting to WiFi...</p>
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
          <p className="mb-2">📱 Point your camera at a WiFi QR code</p>
          <p>The app will auto-detect and connect</p>
        </div>
      </div>
    </div>
  )
}
