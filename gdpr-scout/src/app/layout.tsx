import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GDPR Scout — GRC to ISMS',
  description: 'GDPR compliance assessment and data mapping workspace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
          <a href="https://monti.app" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/grctoisms-logo.png" alt="GRC to ISMS" style={{ height: '48px', width: 'auto' }} />
          </a>
        </header>
        {children}
      </body>
    </html>
  )
}
