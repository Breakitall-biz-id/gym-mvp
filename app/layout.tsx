import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitPro Gym Management',
  description: 'Professional gym management system with member check-ins, subscriptions, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-900 text-slate-50`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}