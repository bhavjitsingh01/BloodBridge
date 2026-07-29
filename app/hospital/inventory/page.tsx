'use client'

import { Droplet, Zap } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/hospital', icon: <Droplet className="h-5 w-5" /> },
  { label: 'Inventory', href: '/hospital/inventory', icon: <Zap className="h-5 w-5" />, isActive: true },
]

export default function HospitalInventory() {
  return (
    <DashboardLayout
      title="Blood Inventory"
      subtitle="Manage and track blood units"
      userRole="Hospital Admin"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Inventory management page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
