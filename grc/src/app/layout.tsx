import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/ui/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Your GRC — GRC to ISMS',
  description: 'ISO 27001 and ISO 42001 compliance workspace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 shrink-0 z-10 relative">
          <a href="https://monti.app" className="flex items-center gap-2">
            <img
              src="/grctoisms-logo.png"
              alt="GRC to ISMS"
              style={{ height: '36px', width: 'auto' }}
            />
          </a>
          <div className="ml-4 h-5 w-px bg-gray-200" />
          <span className="ml-4 text-sm font-medium text-gray-500">Your GRC</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              Work in progress
            </span>
          </div>
        </header>

        {/* Body: sidebar + page content */}
        <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
