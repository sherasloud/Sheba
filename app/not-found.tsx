"use client"

import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="text-[#29a9eb] text-7xl font-bold mb-2">404</div>
          <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
          <p className="text-gray-600 mt-2">The page you are looking for could not be found or has been removed.</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            This may be a temporary issue. Please try again or return to the home page.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#29a9eb] text-white py-3 px-4 rounded-lg font-medium transition-colors hover:bg-[#1e8fd0] active:bg-[#1a7db8]"
          >
            <Home size={18} />
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors hover:bg-gray-200 active:bg-gray-300"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
