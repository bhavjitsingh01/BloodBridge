'use client'

import { Droplet, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/hospital', icon: <Droplet className="h-5 w-5" /> },
  { label: 'Requests', href: '/hospital/requests', icon: <AlertCircle className="h-5 w-5" />, isActive: true },
]

export default function HospitalRequests() {
  return (
    <DashboardLayout
      title="Blood Requests"
      subtitle="Create and manage blood requests"
      userRole="Hospital Admin"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Blood requests page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
