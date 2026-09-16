"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Banner {
  id: string
  image: string
  link: string
  alt: string
  priority: number
  isActive: boolean
}

interface SwipeableBannerCarouselProps {
  banners: Banner[]
  autoPlayInterval?: number
  className?: string
}

export default function SwipeableBannerCarousel({
  banners,
  autoPlayInterval = 5000,
  className = "",
}: SwipeableBannerCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: false,
    },
    [Autoplay({ delay: autoPlayInterval, stopOnInteraction: false })],
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return
      emblaApi.scrollTo(index)
    },
    [emblaApi],
  )

  if (banners.length === 0) return null

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}>
      {/* Embla Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0">
              <Link href={banner.link} className="block">
                <img
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.alt}
                  className="w-full h-40 object-cover select-none"
                  draggable={false}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Desktop */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => scrollTo(banners.length - 1)}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
            aria-label="Previous banner"
          >
            <ChevronLeft size={20} className="text-gray-800" />
          </button>
          <button
            onClick={() => scrollTo((selectedIndex + 1) % banners.length)}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
            aria-label="Next banner"
          >
            <ChevronRight size={20} className="text-gray-800" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`transition-all duration-300 rounded-full ${
                index === selectedIndex ? "w-8 h-2 bg-white shadow-lg" : "w-2 h-2 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${((selectedIndex + 1) / banners.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
