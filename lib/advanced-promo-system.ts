// Advanced Promotional Banner System with Custom Banners & Date Scheduling
export interface CustomPromoBanner {
  id: string
  type: string
  title: string
  subtitle: string
  image: string
  link: string
  alt: string
  bgColor: string
  textColor: string
  isActive: boolean
  startDate: string // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
  priority: number // Higher number = higher priority
  createdBy: string
  createdAt: string
  isCustom: boolean
}

const defaultBanners: CustomPromoBanner[] = [
  {
    id: "cashout-9tk",
    type: "cashout",
    title: "Cashout Charge Only 9 Taka",
    image: "/images/new-promo-banner.png",
    link: "/cashout",
    alt: "Cashout charge only 9 taka offer",
    isActive: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    priority: 1,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: "sheba-advance-blue",
    type: "advance",
    title: "Advance with Sheba App",
    subtitle: "Move forward with digital service",
    image: "/images/sheba-advance-blue-banner.png",
    link: "/send-money",
    alt: "Advance with Sheba App - Digital service banner",
    bgColor: "from-blue-400 to-blue-600",
    textColor: "text-white",
    isActive: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    priority: 3,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: "eid-shopping",
    type: "eid",
    title: "🌙 Eid Mubarak! 🌙",
    subtitle: "Eid Shopping with Sheba App",
    link: "/payment",
    alt: "Eid Shopping with Sheba App",
    bgColor: "from-green-500 to-emerald-600",
    textColor: "text-white",
    isActive: false,
    startDate: "2024-04-10",
    endDate: "2024-04-15",
    priority: 5,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: "sheba-advance-add-money",
    type: "add-money",
    title: "Advance with Sheba App",
    subtitle: "Move forward with digital service",
    image: "/images/sheba-advance-add-money-banner.png",
    link: "/add-money",
    alt: "Advance with Sheba App - Add Money Banner",
    bgColor: "from-blue-400 to-blue-600",
    textColor: "text-white",
    isActive: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    priority: 4,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
]

export class AdvancedPromoBannerManager {
  private static banners: CustomPromoBanner[] = [
    {
      id: "sheba-advance-add-money",
      type: "add-money",
      title: "Advance with Sheba App",
      subtitle: "Move forward with digital service",
      image: "/images/sheba-advance-add-money-banner.png",
      link: "/add-money",
      alt: "Advance with Sheba App - Add Money Banner",
      bgColor: "from-blue-400 to-blue-600",
      textColor: "text-white",
      isActive: true,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      priority: 10,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      isCustom: false,
    },
    {
      id: "send-money-1",
      type: "send-money",
      title: "Send Money Instantly",
      subtitle: "Transfer money to any mobile number",
      image: "/images/sheba-send-money-banner.jpeg",
      link: "/send-money",
      alt: "Send Money Banner",
      bgColor: "from-green-400 to-green-600",
      textColor: "text-white",
      isActive: true,
      startDate: "2023-01-01",
      endDate: "2024-12-31",
      priority: 9,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      isCustom: false,
    },
    {
      id: "send-money-2",
      type: "send-money",
      title: "Send Money Fast & Free",
      subtitle: "Quick money transfer service",
      image: "/images/sheba-send-money-banner-2.jpeg",
      link: "/send-money",
      alt: "Send Money Banner 2",
      bgColor: "from-blue-400 to-blue-600",
      textColor: "text-white",
      isActive: true,
      startDate: "2023-01-01",
      endDate: "2024-12-31",
      priority: 8,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      isCustom: false,
    },
    {
      id: "cashout-banner",
      type: "cashout",
      title: "Cash Out Anywhere",
      subtitle: "Withdraw money from any agent",
      image: "/images/sheba-cashout-banner-new.png",
      link: "/cashout",
      alt: "Cash Out Banner",
      bgColor: "from-orange-400 to-orange-600",
      textColor: "text-white",
      isActive: true,
      startDate: "2023-01-01",
      endDate: "2024-12-31",
      priority: 7,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      isCustom: false,
    },
    {
      id: "international-remittance",
      type: "remittance",
      title: "International Remittance",
      subtitle: "Send money abroad easily",
      image: "/images/sheba-international-banner.png",
      link: "/remittance",
      alt: "International Remittance Banner",
      bgColor: "from-purple-400 to-purple-600",
      textColor: "text-white",
      isActive: true,
      startDate: "2023-01-01",
      endDate: "2024-12-31",
      priority: 6,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      isCustom: false,
    },
  ]

  // Get all banners (default + custom)
  static getAllBanners(): CustomPromoBanner[] {
    return [...defaultBanners, ...this.banners].sort((a, b) => b.priority - a.priority)
  }

  // Get all active banners
  static getActiveBanners(): CustomPromoBanner[] {
    return this.banners
      .filter((banner) => banner.isActive && this.isBannerInDateRange(banner))
      .sort((a, b) => b.priority - a.priority)
  }

  // Get banner by ID
  static getBannerById(id: string): CustomPromoBanner | null {
    return this.banners.find((banner) => banner.id === id) || null
  }

  // Get banners by type
  static getBannersByType(type: string): CustomPromoBanner[] {
    return this.banners
      .filter((banner) => banner.type === type && banner.isActive && this.isBannerInDateRange(banner))
      .sort((a, b) => b.priority - a.priority)
  }

  // Get highest priority active banner
  static getTopBanner(): CustomPromoBanner | null {
    const activeBanners = this.getActiveBanners()
    return activeBanners.length > 0 ? activeBanners[0] : null
  }

  // Check if banner is within date range
  private static isBannerInDateRange(banner: CustomPromoBanner): boolean {
    const now = new Date()
    const startDate = new Date(banner.startDate)
    const endDate = new Date(banner.endDate)
    return now >= startDate && now <= endDate
  }

  // Add new banner
  static addBanner(banner: Omit<CustomPromoBanner, "id" | "createdAt">): CustomPromoBanner {
    const newBanner: CustomPromoBanner = {
      ...banner,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    this.banners.push(newBanner)
    return newBanner
  }

  // Update banner
  static updateBanner(id: string, updates: Partial<CustomPromoBanner>): boolean {
    const index = this.banners.findIndex((banner) => banner.id === id)
    if (index !== -1) {
      this.banners[index] = { ...this.banners[index], ...updates }
      return true
    }
    return false
  }

  // Delete banner
  static deleteBanner(id: string): boolean {
    const index = this.banners.findIndex((banner) => banner.id === id)
    if (index !== -1) {
      this.banners.splice(index, 1)
      return true
    }
    return false
  }

  // Toggle banner active status
  static toggleBanner(id: string): boolean {
    const banner = this.getBannerById(id)
    if (banner) {
      banner.isActive = !banner.isActive
      return true
    }
    return false
  }

  // Get banners for management interface
  static getManagementBanners(): CustomPromoBanner[] {
    return [...this.banners].sort((a, b) => b.priority - a.priority)
  }

  // Check scheduled banners and return current active banner
  static checkScheduledBanners(): CustomPromoBanner | null {
    return this.getTopBanner()
  }

  // Get banner statistics
  static getBannerStats(): {
    total: number
    active: number
    inactive: number
    expired: number
    upcoming: number
  } {
    const now = new Date()
    const stats = {
      total: this.banners.length,
      active: 0,
      inactive: 0,
      expired: 0,
      upcoming: 0,
    }

    this.banners.forEach((banner) => {
      const startDate = new Date(banner.startDate)
      const endDate = new Date(banner.endDate)

      if (!banner.isActive) {
        stats.inactive++
      } else if (now > endDate) {
        stats.expired++
      } else if (now < startDate) {
        stats.upcoming++
      } else {
        stats.active++
      }
    })

    return stats
  }

  // Search banners
  static searchBanners(query: string): CustomPromoBanner[] {
    const lowercaseQuery = query.toLowerCase()
    return this.banners.filter(
      (banner) =>
        banner.title.toLowerCase().includes(lowercaseQuery) ||
        banner.subtitle.toLowerCase().includes(lowercaseQuery) ||
        banner.type.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Get banners by date range
  static getBannersByDateRange(startDate: string, endDate: string): CustomPromoBanner[] {
    const start = new Date(startDate)
    const end = new Date(endDate)

    return this.banners.filter((banner) => {
      const bannerStart = new Date(banner.startDate)
      const bannerEnd = new Date(banner.endDate)
      return bannerStart <= end && bannerEnd >= start
    })
  }

  // Duplicate banner
  static duplicateBanner(id: string): CustomPromoBanner | null {
    const originalBanner = this.getBannerById(id)
    if (!originalBanner) return null

    const duplicatedBanner: CustomPromoBanner = {
      ...originalBanner,
      id: `duplicate-${Date.now()}`,
      title: `${originalBanner.title} (Copy)`,
      createdAt: new Date().toISOString(),
      isCustom: true,
    }

    this.banners.push(duplicatedBanner)
    return duplicatedBanner
  }

  // Bulk operations
  static bulkToggleBanners(ids: string[]): number {
    let toggledCount = 0
    ids.forEach((id) => {
      if (this.toggleBanner(id)) {
        toggledCount++
      }
    })
    return toggledCount
  }

  static bulkDeleteBanners(ids: string[]): number {
    let deletedCount = 0
    ids.forEach((id) => {
      if (this.deleteBanner(id)) {
        deletedCount++
      }
    })
    return deletedCount
  }

  // Export banners
  static exportBanners(): string {
    return JSON.stringify(this.banners, null, 2)
  }

  // Import banners
  static importBanners(jsonData: string): boolean {
    try {
      const importedBanners = JSON.parse(jsonData) as CustomPromoBanner[]
      // Validate the structure
      if (Array.isArray(importedBanners)) {
        this.banners = importedBanners
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to import banners:", error)
      return false
    }
  }

  // Format date for display
  static formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Get days remaining for a banner
  static getDaysRemaining(endDate: string): number {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}
