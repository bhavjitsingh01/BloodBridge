'use client'

import { Heart, Bell } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/donor', icon: <Heart className="h-5 w-5" /> },
  { label: 'Notifications', href: '/donor/notifications', icon: <Bell className="h-5 w-5" />, isActive: true },
]

export default function DonorNotifications() {
  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Blood donation requests and important updates"
      userRole="Blood Donor"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Notifications page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
