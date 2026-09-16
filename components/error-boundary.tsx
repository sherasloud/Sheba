"use client"

import React from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">কিছু একটা সমস্যা হয়েছে</h2>
            <p className="text-gray-600 mb-6 text-sm">
              দুঃখিত, একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#3498DB] text-white rounded-full font-medium"
              >
                <RefreshCw size={18} />
                আবার চেষ্টা করুন
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 text-gray-700 rounded-full font-medium"
              >
                <Home size={18} />
                হোম পেজে যান
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors gracefully
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((err: Error | unknown) => {
    if (err instanceof Error) {
      setError(err)
      console.error("[v0] Error handled:", err)
    } else {
      setError(new Error(String(err)))
      console.error("[v0] Unknown error handled:", err)
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}

// Safe data loader that won't crash on missing data
export function safeLoadData<T>(
  loader: () => T | null | undefined,
  defaultValue: T
): T {
  try {
    const result = loader()
    return result ?? defaultValue
  } catch (error) {
    console.error("[v0] Safe load error:", error)
    return defaultValue
  }
}
