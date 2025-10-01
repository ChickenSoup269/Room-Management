import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tính Tiền Trọ",
  description: "App tính tiền trọ phòng đơn giản",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <nav className="p-4 bg-gray-800 text-white">
          <ul className="flex space-x-4">
            <li>
              <Link href="/">Tính Toán</Link>
            </li>
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          </ul>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
