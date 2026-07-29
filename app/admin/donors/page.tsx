'use client'

import { Activity, Users } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <Activity className="h-5 w-5" /> },
  { label: 'Donors', href: '/admin/donors', icon: <Users className="h-5 w-5" />, isActive: true },
]

export default function AdminDonors() {
  return (
    <DashboardLayout
      title="Donor Management"
      subtitle="Manage registered donors"
      userRole="System Administrator"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Donor management page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
