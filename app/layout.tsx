import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import BottomNavigation from "@/components/bottom-navigation"
import { RealtimeTransferNotification } from "@/components/realtime-transfer-notification"
import Script from "next/script"

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
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          id="btoa-polyfill"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof window==="undefined")return;try{var o=window.btoa,a=window.atob;window.btoa=function(t){if(null==t)return"";var e=String(t);if(""===e)return"";try{return o(e)}catch(t){try{return o(unescape(encodeURIComponent(e)))}catch(t){try{for(var n=new TextEncoder,r=n.encode(e),i="",c=0;c<r.length;c++)i+=String.fromCharCode(r[c]);return o(i)}catch(t){return""}}}},window.atob=function(t){if(null==t)return"";var e=String(t);if(""===e)return"";try{return a(e)}catch(t){try{return decodeURIComponent(escape(a(e)))}catch(t){return""}}},window.addEventListener("error",(function(t){if(t.message&&(t.message.includes("btoa")||t.message.includes("atob")||t.message.includes("Latin1")||t.message.includes("InvalidCharacterError")||t.message.includes("invalid characters")))return t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation(),!1}),!0),window.addEventListener("unhandledrejection",(function(t){if(t.reason&&t.reason.message&&(t.reason.message.includes("btoa")||t.reason.message.includes("atob")||t.reason.message.includes("Latin1")||t.reason.message.includes("InvalidCharacterError")||t.reason.message.includes("invalid characters")))return t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation(),!1}),!0)}catch(t){}})();`,
          }}
        />
        <Script src="/btoa-emergency-fix.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <RealtimeTransferNotification />
        {children}
        <BottomNavigation />
      </body>
    </html>
  )
}
