'use client'

import { Activity } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <Activity className="h-5 w-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <Activity className="h-5 w-5" />, isActive: true },
]

export default function AdminAnalytics() {
  return (
    <DashboardLayout
      title="System Analytics"
      subtitle="City-wide blood supply and demand analytics"
      userRole="System Administrator"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">System analytics page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
