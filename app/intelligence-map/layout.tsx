import React from 'react'

export const metadata = {
  title: 'India Intelligence Map - BloodBridge',
  description: 'Interactive map showing blood supply analytics across Indian states',
}

export default function IntelligenceMapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
