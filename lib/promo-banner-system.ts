// Promotional Banner Management System
export interface CustomPromoBanner {
  id: string
  type: string
  title: string
  subtitle?: string
  description?: string
  image?: string
  link: string
  alt: string
  bgColor?: string
  textColor?: string
  isActive: boolean
  startDate: string // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
  priority: number // Higher number = higher priority
  createdBy: string
  createdAt: string
  isCustom: boolean
}

export const defaultBanners: CustomPromoBanner[] = [
  {
    id: "cashout-9tk",
    type: "cashout",
    title: "Cashout Charge Only 9 Taka",
    image: "/images/new-promo-banner.png",
    link: "/cashout",
    alt: "Cashout charge only 9 taka offer",
    isActive: true, // Keep active as requested
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    priority: 1,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: "sheba-advance-add-money-new",
    type: "add-money", // Keeping this active as the "Send Money" banner based on the request for 3 banners.
    title: "Advance with Sheba App",
    subtitle: "Move forward with digital service",
    description: "Add money to your account easily",
    image: "/images/sheba-advance-add-money-banner.png",
    link: "/add-money",
    alt: "Advance korun Sheba App e - Add Money Banner",
    bgColor: "from-blue-400 to-blue-600",
    textColor: "text-white",
    isActive: true, // Keep active as requested
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    priority: 10,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: "sheba-add-money-cloud",
    type: "add-money",
    title: "Add Money with Sheba App!",
    subtitle: "Add money easily",
    description: "Add money to your account with ease",
    image: "/images/sheba-add-money-cloud-banner.png",
    link: "/add-money",
    alt: "Add Money with Sheba App - Cloud Banner",
    bgColor: "bg-blue-500",
    textColor: "text-white",
    isActive: true, // Keep active as requested
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    priority: 11, // Higher priority to make it appear first if active
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: "add-money-cloud-new-banner", // New banner ID
    type: "add-money",
    title: "Add Money with Sheba App!",
    subtitle: "Add money easily",
    description: "Add money to your account with ease",
    image: "/images/add-money-cloud-banner-new.png", // New image path
    link: "/add-money",
    alt: "Add Money with Sheba App!", // Replaced Bengali alt text with English
    bgColor: "bg-blue-500",
    textColor: "text-white",
    isActive: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    priority: 12, // Highest priority for the new banner
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
    isActive: false, // Deactivated as it's not one of the three requested
    startDate: "2024-04-10",
    endDate: "2024-04-15",
    priority: 5,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isCustom: false,
  },
]

export class AdvancedPromoBannerManager {
  private static STORAGE_KEY = "customPromoBanners"
  private static ACTIVE_BANNER_KEY = "activePromoBanner"

  // Get all banners (default + custom)
  static getAllBanners(): CustomPromoBanner[] {
    const customBanners = this.getCustomBanners()
    return [...defaultBanners, ...customBanners]
  }

  // Get custom banners from localStorage
  static getCustomBanners(): CustomPromoBanner[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Save custom banners to localStorage
  static saveCustomBanners(banners: CustomPromoBanner[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(banners))
  }

  // Add new custom banner
  static addCustomBanner(banner: Omit<CustomPromoBanner, "id" | "createdAt" | "isCustom">): string {
    const customBanners = this.getCustomBanners()
    const newBanner: CustomPromoBanner = {
      ...banner,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isCustom: true,
    }

    customBanners.push(newBanner)
    this.saveCustomBanners(customBanners)

    // If this banner should be active now, activate it
    if (this.isBannerActiveByDate(newBanner)) {
      this.setActiveBanner(newBanner.id)
    }

    return newBanner.id
  }

  // Check if banner should be active based on current date
  static isBannerActiveByDate(banner: CustomPromoBanner): boolean {
    const now = new Date()
    const start = new Date(banner.startDate)
    const end = new Date(banner.endDate)

    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    return banner.isActive && now >= start && now <= end
  }

  // Get currently active banner based on date and priority
  static getActiveBanner(): CustomPromoBanner {
    const allBanners = this.getAllBanners()

    // Filter banners that should be active based on date
    const activeBanners = allBanners.filter((banner) => this.isBannerActiveByDate(banner))

    if (activeBanners.length === 0) {
      // No date-based active banners, return default or first available
      return allBanners.find((b) => b.id === "cashout-9tk") || allBanners[0]
    }

    // Sort by priority (highest first) and return the top one
    activeBanners.sort((a, b) => b.priority - a.priority)
    return activeBanners[0]
  }

  // Set active banner manually (overrides date-based selection)
  static setActiveBanner(bannerId: string): boolean {
    const allBanners = this.getAllBanners()
    const targetBanner = allBanners.find((banner) => banner.id === bannerId)

    if (targetBanner) {
      localStorage.setItem(this.ACTIVE_BANNER_KEY, bannerId)
      localStorage.setItem("manualBannerOverride", "true")
      return true
    }
    return false
  }

  // Check and update active banner based on current date
  static checkScheduledBanners(): CustomPromoBanner {
    const manualOverride = localStorage.getItem("manualBannerOverride")

    if (manualOverride === "true") {
      // Check if manually selected banner is still valid
      const manualBannerId = localStorage.getItem(this.ACTIVE_BANNER_KEY)
      if (manualBannerId) {
        const allBanners = this.getAllBanners()
        const manualBanner = allBanners.find((b) => b.id === manualBannerId)
        if (manualBanner && this.isBannerActiveByDate(manualBanner)) {
          return manualBanner
        } else {
          // Manual banner expired or not active, clear override
          localStorage.removeItem("manualBannerOverride")
        }
      }
    }

    // Get date-based active banner
    const activeBanner = this.getActiveBanner()
    localStorage.setItem(this.ACTIVE_BANNER_KEY, activeBanner.id)
    return activeBanner
  }

  // Delete custom banner
  static deleteCustomBanner(bannerId: string): boolean {
    const customBanners = this.getCustomBanners()
    const filteredBanners = customBanners.filter((banner) => banner.id !== bannerId)

    if (filteredBanners.length !== customBanners.length) {
      this.saveCustomBanners(filteredBanners)
      return true
    }
    return false
  }

  // Get banners expiring soon (within 3 days)
  static getBannersExpiringSoon(): CustomPromoBanner[] {
    const allBanners = this.getAllBanners()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    return allBanners.filter((banner) => {
      const endDate = new Date(banner.endDate)
      return endDate <= threeDaysFromNow && this.isBannerActiveByDate(banner)
    })
  }

  // Get upcoming banners (starting within 7 days)
  static getUpcomingBanners(): CustomPromoBanner[] {
    const allBanners = this.getAllBanners()
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    return allBanners.filter((banner) => {
      const startDate = new Date(banner.startDate)
      return startDate > now && startDate <= sevenDaysFromNow
    })
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

  // Get banner by ID
  static getBannerById(id: string): CustomPromoBanner | null {
    const allBanners = this.getAllBanners()
    return allBanners.find((banner) => banner.id === id) || null
  }

  // Update banner
  static updateBanner(id: string, updates: Partial<CustomPromoBanner>): boolean {
    const allBanners = this.getAllBanners()
    const bannerIndex = allBanners.findIndex((banner) => banner.id === id)

    if (bannerIndex !== -1) {
      const updatedBanner = { ...allBanners[bannerIndex], ...updates }

      // If it's a default banner, we can't modify it directly
      // If it's a custom banner, update it in localStorage
      if (updatedBanner.isCustom) {
        const customBanners = this.getCustomBanners()
        const customIndex = customBanners.findIndex((banner) => banner.id === id)
        if (customIndex !== -1) {
          customBanners[customIndex] = updatedBanner
          this.saveCustomBanners(customBanners)
          return true
        }
      }
    }
    return false
  }

  // Toggle banner status
  static toggleBannerStatus(id: string): boolean {
    const banner = this.getBannerById(id)
    if (banner) {
      return this.updateBanner(id, { isActive: !banner.isActive })
    }
    return false
  }

  // Get banners by type
  static getBannersByType(type: string): CustomPromoBanner[] {
    const allBanners = this.getAllBanners()
    return allBanners.filter((banner) => banner.type === type)
  }

  // Search banners
  static searchBanners(query: string): CustomPromoBanner[] {
    const allBanners = this.getAllBanners()
    const lowercaseQuery = query.toLowerCase()

    return allBanners.filter(
      (banner) =>
        banner.title.toLowerCase().includes(lowercaseQuery) ||
        banner.subtitle?.toLowerCase().includes(lowercaseQuery) ||
        banner.description?.toLowerCase().includes(lowercaseQuery) ||
        banner.type.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Get banner statistics
  static getBannerStats(): {
    total: number
    active: number
    inactive: number
    expired: number
    upcoming: number
  } {
    const allBanners = this.getAllBanners()
    const now = new Date()

    const stats = {
      total: allBanners.length,
      active: 0,
      inactive: 0,
      expired: 0,
      upcoming: 0,
    }

    allBanners.forEach((banner) => {
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
}
