import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-8 w-1/2 mx-auto" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}
