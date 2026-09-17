import { CheckCircle } from "lucide-react"

interface VerifiedBadgeProps {
  isVerified: boolean
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function VerifiedBadge({ isVerified, size = "md", showText = false }: VerifiedBadgeProps) {
  if (!isVerified) return null

  const sizeMap = {
    sm: { icon: 12, wrapper: "w-4 h-4" },
    md: { icon: 16, wrapper: "w-5 h-5" },
    lg: { icon: 20, wrapper: "w-6 h-6" },
  }

  const styles = sizeMap[size]

  return (
    <div className="inline-flex items-center gap-1">
      <div className={`${styles.wrapper} text-blue-500 flex-shrink-0`} title="Verified Account">
        <CheckCircle size={styles.icon} fill="currentColor" />
      </div>
      {showText && <span className="text-xs text-blue-600 font-medium">Verified</span>}
    </div>
  )
}

export default VerifiedBadge
