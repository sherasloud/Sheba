export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#1FBFFF] to-[#1FB5FF]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        <p className="text-white mt-4 font-medium">Loading...</p>
      </div>
    </div>
  )
}
