'use client'

import { useState } from 'react'

interface TruecallerButtonProps {
  phoneNumber: string
  onActivateManualOTP?: () => void
  onError?: (error: string) => void
}

export default function TruecallerButton({ phoneNumber, onActivateManualOTP, onError }: TruecallerButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleTruecallerClick = async () => {
    setIsLoading(true)
    try {
      console.log('[v0] Activating Truecaller OTP mode for:', phoneNumber)
      
      // For now, activate manual OTP entry (Truecaller SDK will be enabled once domain is whitelisted)
      if (onActivateManualOTP) {
        onActivateManualOTP()
      }
      
    } catch (error) {
      console.error('[v0] Truecaller error:', error)
      if (onError) onError(error instanceof Error ? error.message : 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleTruecallerClick}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Activating...
        </>
      ) : (
        <>
          <span>✓</span>
          Verify with Truecaller
        </>
      )}
    </button>
  )
}
