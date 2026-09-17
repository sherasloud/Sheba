"use client"

import { useState, useRef } from "react"
import { X, Upload, Camera, Loader2, CheckCircle } from "lucide-react"

interface NIDVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified?: () => void
}

type VerificationStep = "nid" | "facial" | "processing" | "completed"

interface FacialTask {
  id: string
  label: string
  instruction: string
  completed: boolean
}

export function NIDVerificationModal({ isOpen, onClose, onVerified }: NIDVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>("nid")
  const [nidNumber, setNidNumber] = useState("")
  const [nidFront, setNidFront] = useState<File | null>(null)
  const [nidBack, setNidBack] = useState<File | null>(null)
  const [nidFrontPreview, setNidFrontPreview] = useState<string>("")
  const [nidBackPreview, setNidBackPreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front")
  const [userPhone, setUserPhone] = useState("")
  
  // Facial verification states
  const [facialTasks, setFacialTasks] = useState<FacialTask[]>([
    { id: "look_camera", label: "Look at Camera", instruction: "Camera এর দিকে তাকান", completed: false },
    { id: "smile", label: "Smile", instruction: "হাসুন", completed: false },
    { id: "left", label: "Left", instruction: "বাম দিকে তাকান", completed: false },
    { id: "right", label: "Right", instruction: "ডান দিকে তাকান", completed: false },
    { id: "head_up", label: "Head Up", instruction: "মাথা উঁচু করুন", completed: false },
    { id: "blink", label: "Blink", instruction: "চোখ খুলুন-বন্ধ করুন", completed: false },
  ])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [videoReady, setVideoReady] = useState(false)

  // Get user phone on mount
  if (isOpen && !userPhone) {
    const phone = localStorage.getItem("phoneNumber")
    if (phone) setUserPhone(phone)
  }

  if (!isOpen) return null

  // Start camera for facial verification
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setVideoReady(true)
        setError("")
      }
    } catch (err) {
      setError("ক্যামেরা অ্যাক্সেস দিন")
      console.error("[v0] Camera error:", err)
    }
  }

  // Complete current task and move to next
  const completeTask = () => {
    const newTasks = [...facialTasks]
    newTasks[currentTaskIndex].completed = true
    setFacialTasks(newTasks)

    if (currentTaskIndex < facialTasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1)
      console.log("[v0] Task completed, moving to next")
    } else {
      console.log("[v0] All tasks completed!")
    }
  }

  // Check if all tasks are completed
  const allTasksCompleted = facialTasks.every(task => task.completed)

  // Calculate progress percentage
  const progressPercentage = (facialTasks.filter(t => t.completed).length / facialTasks.length) * 100

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const preview = event.target?.result as string
        if (side === "front") {
          setNidFront(file)
          setNidFrontPreview(preview)
        } else {
          setNidBack(file)
          setNidBackPreview(preview)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNIDSubmit = async () => {
    console.log("[v0] NID Submit clicked - nidNumber:", nidNumber, "nidFront:", !!nidFront, "nidBack:", !!nidBack)
    setError("")
    
    // Validate NID number
    if (!nidNumber || nidNumber.trim().length === 0) {
      console.log("[v0] NID number missing")
      setError("Please enter your NID number")
      return
    }

    const nidRegex = /^\d{10,17}$/
    if (!nidRegex.test(nidNumber.trim())) {
      console.log("[v0] Invalid NID format")
      setError("Invalid NID format. NID should be 10-17 digits.")
      return
    }

    if (!nidFront || !nidBack) {
      console.log("[v0] Front or back image missing")
      setError("Please upload both front and back of your NID")
      return
    }

    if (!userPhone) {
      console.log("[v0] User phone not found")
      setError("Please log in again to continue verification")
      return
    }

    console.log("[v0] All validations passed, moving to facial step")
    setIsLoading(true)
    try {
      // Store NID for next step
      localStorage.setItem("pendingNIDNumber", nidNumber.trim())
      
      // Move to facial verification step
      console.log("[v0] Setting step to facial")
      setStep("facial")
    } catch (error) {
      console.error("[v0] Error preparing NID verification:", error)
      setError("Error processing NID. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const captureFace = async () => {
    setError("")
    
    if (!canvasRef.current || !videoRef.current) {
      setError("Camera not ready. Please try again.")
      return
    }

    if (!nidNumber || !userPhone) {
      setError("Missing NID or phone information. Please try again.")
      return
    }

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) {
      setError("Failed to process image. Please try again.")
      return
    }

    ctx.drawImage(videoRef.current, 0, 0, 320, 240)
    setIsLoading(true)
    setStep("processing")
    
    try {
      // Convert canvas to blob and send to backend with NID verification
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          setError("Failed to capture face. Please try again.")
          setStep("facial")
          setIsLoading(false)
          return
        }

        try {
          const formData = new FormData()
          formData.append("faceImage", blob)
          formData.append("nidNumber", nidNumber.trim())
          formData.append("phone", userPhone)

          console.log("[v0] Sending face verification with NID:", nidNumber, "Phone:", userPhone)

          const response = await fetch("/api/verify-nid", {
            method: "POST",
            body: formData,
          })

          const result = await response.json()

          if (response.ok && result.success) {
            console.log("[v0] Verification successful:", result)
            setStep("completed")
            // Clear pending NID
            localStorage.removeItem("pendingNIDNumber")
            // Call onVerified callback
            if (onVerified) {
              setTimeout(onVerified, 1500)
            }
          } else {
            // Check for face mismatch error
            if (result.message && result.message.toLowerCase().includes("face") && result.message.toLowerCase().includes("match")) {
              setError("আপনার মুখ মেলেনি। দয়া করে আবার চেষ্টা করুন এবং সঠিক আলোতে আপনার মুখ দেখান।")
            } else {
              setError(result.message || "মুখের যাচাইকরণ ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।")
            }
            setStep("facial")
          }
        } catch (error) {
          console.error("[v0] Error sending face verification:", error)
          setError("Error verifying face. Please check your connection.")
          setStep("facial")
        } finally {
          setIsLoading(false)
        }
      })
    } catch (error) {
      console.error("[v0] Error capturing face:", error)
      setError("Error processing face verification. Please try again.")
      setStep("facial")
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setStep("nid")
    setNidFront(null)
    setNidBack(null)
    setNidFrontPreview("")
    setNidBackPreview("")
    onClose()
  }

  const handleVerificationComplete = () => {
    handleClose()
    onVerified?.()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">NID Verification</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        {step !== "completed" && (
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between text-sm font-medium">
              <div className={`flex items-center gap-2 ${step === "nid" ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === "nid" ? "bg-blue-600 text-white" : step !== "nid" ? "bg-green-500 text-white" : "bg-gray-300"}`}>
                  {step !== "nid" && step !== "facial" ? "✓" : "1"}
                </div>
                <span>Upload NID</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${step === "nid" ? "bg-gray-300" : "bg-blue-600"}`}></div>
              <div className={`flex items-center gap-2 ${step === "facial" ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === "facial" ? "bg-blue-600 text-white" : step === "processing" || step === "completed" ? "bg-green-500 text-white" : "bg-gray-300"}`}>
                  {step === "processing" || step === "completed" ? "✓" : "2"}
                </div>
                <span>Face Scan</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${step !== "nid" && step !== "facial" ? "bg-blue-600" : "bg-gray-300"}`}></div>
              <div className={`flex items-center gap-2 ${step === "processing" || step === "completed" ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === "processing" || step === "completed" ? "bg-blue-600 text-white" : "bg-gray-300"}`}>
                  3
                </div>
                <span>Process</span>
              </div>
            </div>
          </div>
        )}

        {/* NID Upload Step */}
        {step === "nid" && (
          <div className="p-6 flex flex-col">
            {/* Continue Button - Move to Top */}
            <div className="mb-6 pb-4 border-b-2 border-blue-200">
              {(!nidNumber || !nidFront || !nidBack) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <p className="text-amber-800 text-sm font-medium">
                    {!nidNumber && "• এন্টার করুন NID নম্বর"}
                    {!nidNumber && !nidFront && " • "}
                    {!nidFront && "Upload করুন Front Side"}
                    {(!nidNumber || !nidFront) && !nidBack && " • "}
                    {!nidBack && "Upload করুন Back Side"}
                  </p>
                </div>
              )}
              <button
                onClick={handleNIDSubmit}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                  isLoading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#29a9eb] text-white hover:bg-blue-600 active:scale-95 shadow-lg'
                }`}
              >
                {isLoading ? "Processing..." : "Continue to Face Verification"}
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Upload Your NID</h3>
              <p className="text-gray-600 text-sm">Please enter your NID number and upload clear photos of both sides</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* NID Number Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Your NID Number</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter your 10-17 digit NID number"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={17}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                {nidNumber.length > 0 && `${nidNumber.length}/17 digits`}
              </p>
            </div>

            {/* Front Side */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Front Side</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => {
                  setCurrentSide("front")
                  fileInputRef.current?.click()
                }}
              >
                {nidFrontPreview ? (
                  <img src={nidFrontPreview} alt="NID Front" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-gray-600 text-sm">Click to upload NID front side</p>
                  </div>
                )}
              </div>
            </div>

            {/* Back Side */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Back Side</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => {
                  setCurrentSide("back")
                  fileInputRef.current?.click()
                }}
              >
                {nidBackPreview ? (
                  <img src={nidBackPreview} alt="NID Back" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-gray-600 text-sm">Click to upload NID back side</p>
                  </div>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, currentSide)}
              className="hidden"
            />
          </div>
        )}

        {/* Facial Verification Step - Progressive Task System */}
        {step === "facial" && (
          <div className="p-0 h-[90vh] flex flex-col items-center justify-between bg-white">
            {/* Top Section - Title & Current Task Instruction */}
            <div className="w-full text-center pt-12 pb-6">
              <h1 className="text-6xl font-light text-[#29a9eb] tracking-widest mb-4">
                Facial Verify
              </h1>
              
              {/* Current Task Instruction */}
              <p className="text-2xl font-light text-[#29a9eb] mb-2">
                {facialTasks[currentTaskIndex]?.instruction}
              </p>
              <p className="text-sm text-gray-500">
                Task {currentTaskIndex + 1} of {facialTasks.length}
              </p>
            </div>

            {/* Middle Section - Progressive Circle with Camera Feed */}
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="relative w-96 h-96">
                {/* Outer Progress Ring */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                  {/* Background circle */}
                  <circle
                    cx="200"
                    cy="200"
                    r="190"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  
                  {/* Progress circle - fills as tasks complete */}
                  <circle
                    cx="200"
                    cy="200"
                    r="190"
                    fill="none"
                    stroke="#29a9eb"
                    strokeWidth="3"
                    strokeDasharray={`${(progressPercentage / 100) * 1194} 1194`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                {/* Inner Blue Circle Camera */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-72 h-72">
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

                    {/* Center Progress Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-white text-4xl font-bold">
                          {Math.round(progressPercentage)}%
                        </div>
                        <div className="text-white text-sm mt-1 font-semibold">
                          {facialTasks.filter(t => t.completed).length}/{facialTasks.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Task Actions and Verify Button */}
            <div className="w-full flex flex-col items-center gap-4 px-6 pb-12">
              {!videoReady ? (
                <button
                  onClick={startCamera}
                  className="w-full max-w-xs py-3 bg-[#29a9eb] text-white rounded-full font-semibold hover:bg-[#2191d4] transition-all"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={completeTask}
                  disabled={allTasksCompleted}
                  className="w-full max-w-xs py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Task Done
                </button>
              )}

              <button
                onClick={handleVerificationComplete}
                disabled={!allTasksCompleted || isLoading}
                className={`w-full max-w-xs py-4 rounded-full font-semibold text-lg transition-all shadow-md ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-wait"
                    : !allTasksCompleted
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#29a9eb] text-white hover:bg-[#2191d4] active:scale-95"
                }`}
              >
                {isLoading ? "Verifying..." : "Verify Now"}
              </button>
            </div>

            {/* Error Modal */}
            {error && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                  <h3 className="text-lg font-bold text-red-600 mb-2">Error</h3>
                  <p className="text-gray-700 mb-4">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="w-full bg-[#29a9eb] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#2191d4]"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <div className="p-6 flex flex-col items-center justify-center min-h-96">
            <Loader2 className="animate-spin mb-4 text-[#29a9eb]" size={48} />
            <h3 className="text-lg font-semibold mb-2">Verifying Your Information</h3>
            <p className="text-gray-600 text-sm text-center">Please wait while we process your documents...</p>
          </div>
        )}

        {/* Completed Step */}
        {step === "completed" && (
          <div className="p-6 flex flex-col items-center justify-center min-h-96">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Verification Complete!</h3>
            <p className="text-gray-600 text-sm text-center mb-6">Your account has been successfully verified</p>
            <button
              onClick={handleVerificationComplete}
              className="w-full bg-[#29a9eb] text-white py-3 rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
