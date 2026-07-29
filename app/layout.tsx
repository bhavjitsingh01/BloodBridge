import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BloodBridge - AI-Powered Blood Supply Network',
  description: 'Intelligent blood management, prediction, and coordination platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
