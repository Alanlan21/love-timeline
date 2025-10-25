import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Dancing_Script } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/ToastProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing-script",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Nossa Timeline",
 description: "Uma linha do tempo privada e interativa para registrar os momentos especiais do nosso relacionamento",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
