'use client'

export default function TollLoading() {
  return (
    <div className="flex flex-col h-screen bg-white items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1FBFFF] rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm font-medium">লোডিং হচ্ছে...</p>
      </div>
    </div>
  )
}
