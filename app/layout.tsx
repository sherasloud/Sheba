import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  orientation: "portrait",
}

export const metadata: Metadata = {
  title: "Sheba - Mobile Money Transfer",
  description: "Fast and secure mobile money transfer application",
  icons: {
    icon: [
      { url: "/images/sheba-cloud-icon.jpeg", sizes: "192x192", type: "image/jpeg" },
      { url: "/images/sheba-cloud-icon.jpeg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [
      { url: "/images/sheba-cloud-icon.jpeg", sizes: "192x192", type: "image/jpeg" },
      { url: "/images/sheba-cloud-icon.jpeg", sizes: "512x512", type: "image/jpeg" },
    ],
    shortcut: "/images/sheba-cloud-icon.jpeg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sheba",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Sheba",
    "application-name": "Sheba",
    "msapplication-TileColor": "#29a9eb",
    "msapplication-config": "none",
    "screen-orientation": "portrait-primary",
  },
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Main layout component for Sheba mobile app
  return (
    <html lang="en" className="bg-white text-gray-900" style={{ orientation: "portrait" }}>
      <head>
        <style>{`
          html, body {
            orientation: portrait-primary !important;
            max-width: 100vw;
            overflow-x: hidden;
          }
          @media (orientation: landscape) {
            html, body {
              transform: rotate(90deg);
              transform-origin: left top;
              width: 100vh;
              height: 100vw;
              position: fixed;
              overflow: hidden;
            }
          }
        `}</style>
      </head>
      <body className={`${inter.className} antialiased bg-white min-h-screen`}>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}
