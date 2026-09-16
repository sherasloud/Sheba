// Automatic Banner Rotation System - 3 Second Auto-Switch
export class BannerRotationManager {
  private static rotationInterval: NodeJS.Timeout | null = null
  private static currentIndex = 0
  private static isRotationActive = true
  private static rotationSpeed = 3000 // 3 seconds

  // Get all active banners for rotation
  static getRotationBanners(): any[] {
    // Get specifically the add money and send money banners
    const addMoneyBanner = {
      id: "sheba-add-money-cloud",
      image: "/images/sheba-add-money-cloud-banner.png",
      title: "Add Money with Sheba App!",
      description: "Add money to your account with ease",
      link: "/add-money",
      priority: 11,
      isActive: true,
    }

    const sendMoneyBanner1 = {
      id: "send-money-1",
      image: "/images/sheba-send-money-banner.jpeg",
      title: "Send Money Instantly",
      description: "Transfer money to any mobile number",
      link: "/send-money",
      priority: 9,
      isActive: true,
    }

    const sendMoneyBanner2 = {
      id: "send-money-2",
      image: "/images/sheba-send-money-banner-2.jpeg",
      title: "Send Money Fast & Free",
      description: "Quick money transfer service",
      link: "/send-money",
      priority: 8,
      isActive: true,
    }

    // Return banners for rotation with add money banner first
    return [addMoneyBanner, sendMoneyBanner1, sendMoneyBanner2]
  }

  // Get current banner in rotation
  static getCurrentRotationBanner(): any {
    const rotationBanners = this.getRotationBanners()
    if (rotationBanners.length === 0) return null

    // Ensure index is within bounds
    if (this.currentIndex >= rotationBanners.length) {
      this.currentIndex = 0
    }

    return rotationBanners[this.currentIndex]
  }

  // Move to next banner in rotation
  static nextBanner(): any {
    const rotationBanners = this.getRotationBanners()
    if (rotationBanners.length <= 1) return this.getCurrentRotationBanner()

    this.currentIndex = (this.currentIndex + 1) % rotationBanners.length
    return this.getCurrentRotationBanner()
  }

  // Move to previous banner in rotation
  static previousBanner(): any {
    const rotationBanners = this.getRotationBanners()
    if (rotationBanners.length <= 1) return this.getCurrentRotationBanner()

    this.currentIndex = this.currentIndex === 0 ? rotationBanners.length - 1 : this.currentIndex - 1
    return this.getCurrentRotationBanner()
  }

  // Start automatic rotation
  static startRotation(onBannerChange: (banner: any) => void): void {
    this.stopRotation() // Clear any existing rotation

    const rotationBanners = this.getRotationBanners()
    if (rotationBanners.length <= 1) return // No need to rotate single banner

    this.isRotationActive = true
    this.rotationInterval = setInterval(() => {
      if (this.isRotationActive) {
        const nextBanner = this.nextBanner()
        onBannerChange(nextBanner)
      }
    }, this.rotationSpeed)
  }

  // Stop automatic rotation
  static stopRotation(): void {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval)
      this.rotationInterval = null
    }
  }

  // Pause rotation (temporarily)
  static pauseRotation(): void {
    this.isRotationActive = false
  }

  // Resume rotation
  static resumeRotation(): void {
    this.isRotationActive = true
  }

  // Set rotation speed
  static setRotationSpeed(milliseconds: number): void {
    this.rotationSpeed = milliseconds
    // Restart rotation with new speed if currently active
    if (this.rotationInterval) {
      const onBannerChange = () => {} // This will be set by the component
      this.startRotation(onBannerChange)
    }
  }

  // Get rotation info
  static getRotationInfo(): {
    currentIndex: number
    totalBanners: number
    isActive: boolean
    speed: number
  } {
    const rotationBanners = this.getRotationBanners()
    return {
      currentIndex: this.currentIndex,
      totalBanners: rotationBanners.length,
      isActive: this.isRotationActive,
      speed: this.rotationSpeed,
    }
  }

  // Jump to specific banner
  static jumpToBanner(index: number): any {
    const rotationBanners = this.getRotationBanners()
    if (index >= 0 && index < rotationBanners.length) {
      this.currentIndex = index
      return this.getCurrentRotationBanner()
    }
    return this.getCurrentRotationBanner()
  }

  // Reset rotation to first banner
  static resetRotation(): any {
    this.currentIndex = 0
    return this.getCurrentRotationBanner()
  }

  // Get all banner IDs
  static getBannerIds(): string[] {
    const rotationBanners = this.getRotationBanners()
    return rotationBanners.map((banner) => banner.id)
  }

  // Check if rotation is active
  static isRotationRunning(): boolean {
    return this.rotationInterval !== null && this.isRotationActive
  }

  // Get current banner index
  static getCurrentIndex(): number {
    return this.currentIndex
  }

  // Set current index
  static setCurrentIndex(index: number): boolean {
    const rotationBanners = this.getRotationBanners()
    if (index >= 0 && index < rotationBanners.length) {
      this.currentIndex = index
      return true
    }
    return false
  }
}
