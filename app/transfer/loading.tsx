export default function TransferLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#29a9eb]"></div>
      <p className="mt-4 text-gray-600 text-sm">Loading...</p>
    </div>
  )
}
