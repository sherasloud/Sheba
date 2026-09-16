// Performance optimization utilities

/**
 * Debounce function to limit how often a function is called
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit the rate at which a function is called
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Lazy load images that are not in the viewport
 */
export function lazyLoadImages() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return

  const images = document.querySelectorAll("img[data-src]")
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src || ""
        img.removeAttribute("data-src")
        observer.unobserve(img)
      }
    })
  })

  images.forEach((img) => observer.observe(img))
}

/**
 * Preload critical resources
 */
export function preloadResources(resources: string[]) {
  if (typeof window === "undefined") return

  resources.forEach((resource) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = resource
    link.as = resource.endsWith(".js")
      ? "script"
      : resource.endsWith(".css")
        ? "style"
        : resource.endsWith(".jpg") || resource.endsWith(".png") || resource.endsWith(".webp")
          ? "image"
          : "fetch"
    document.head.appendChild(link)
  })
}
