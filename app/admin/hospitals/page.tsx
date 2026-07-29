'use client'

import { Activity, Building2 } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <Activity className="h-5 w-5" /> },
  { label: 'Hospitals', href: '/admin/hospitals', icon: <Building2 className="h-5 w-5" />, isActive: true },
]

export default function AdminHospitals() {
  return (
    <DashboardLayout
      title="Hospital Management"
      subtitle="Manage and verify hospitals"
      userRole="System Administrator"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Hospital management page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
