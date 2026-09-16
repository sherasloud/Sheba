export default function TollSuccessLoading() {
  return (
    <div className="mobile-content flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#1FBFFF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">লোডিং হচ্ছে...</p>
      </div>
    </div>
  )
}
