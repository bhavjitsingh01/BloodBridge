'use client'

import { Droplet, Navigation } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/hospital', icon: <Droplet className="h-5 w-5" /> },
  { label: 'Analytics', href: '/hospital/analytics', icon: <Navigation className="h-5 w-5" />, isActive: true },
]

export default function HospitalAnalytics() {
  return (
    <DashboardLayout
      title="Analytics & Insights"
      subtitle="Blood usage patterns and predictions"
      userRole="Hospital Admin"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Analytics page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
