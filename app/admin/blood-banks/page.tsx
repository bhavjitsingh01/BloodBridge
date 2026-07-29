'use client'

import { Activity, Building2 } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <Activity className="h-5 w-5" /> },
  { label: 'Blood Banks', href: '/admin/blood-banks', icon: <Building2 className="h-5 w-5" />, isActive: true },
]

export default function AdminBloodBanks() {
  return (
    <DashboardLayout
      title="Blood Bank Management"
      subtitle="Manage and verify blood banks"
      userRole="System Administrator"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Blood bank management page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
