import type { Metadata } from 'next'
import './globals.css'
import { SocketProvider } from '@/lib/SocketProvider'
import { AppProvider } from '@/lib/AppContext'

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
      <body>
        <SocketProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </SocketProvider>
      </body>
    </html>
  )
}
