export default function TollPinLoading() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header Skeleton */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center gap-3">
        <div className="w-6 h-6 bg-white/30 rounded animate-pulse"></div>
        <div className="h-6 w-32 bg-white/30 rounded animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        {/* Payment Details Skeleton */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="h-5 w-40 bg-blue-200 rounded animate-pulse mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 w-48 bg-blue-100 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-blue-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* PIN Input Display Skeleton */}
        <div className="mb-8 py-6 bg-gray-50 rounded-lg text-center">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-lg bg-gray-200 border-2 border-gray-300 animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Keypad Skeleton */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          {[
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ].map((row, idx) => (
            <div key={idx} className="flex gap-3 justify-center">
              {row.map((num) => (
                <div
                  key={num}
                  className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse"
                ></div>
              ))}
            </div>
          ))}
          <div className="flex gap-3 justify-center items-center w-full">
            <div className="w-16"></div>
            <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse"></div>
            <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse"></div>
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-3 mt-8">
          <div className="flex-1 py-3 px-4 bg-gray-300 rounded-lg animate-pulse"></div>
          <div className="flex-1 py-3 px-4 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
