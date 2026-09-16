import { VerifiedBadge } from "@/components/verified-badge"

interface UserWithBadgeProps {
  name: string
  isVerified: boolean
  phone?: string
  size?: "sm" | "md" | "lg"
  showPhone?: boolean
  className?: string
}

export function UserWithBadge({
  name,
  isVerified,
  phone,
  size = "md",
  showPhone = false,
  className = "",
}: UserWithBadgeProps) {
  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={textSizeMap[size]}>
        <div className="font-medium">{name}</div>
        {showPhone && phone && <div className="text-gray-500 text-xs">{phone}</div>}
      </div>
      <VerifiedBadge isVerified={isVerified} size={size} />
    </div>
  )
}

export default UserWithBadge
