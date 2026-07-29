'use client'

import { Droplets, TrendingUp } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" /> },
  { label: 'Inventory', href: '/blood-bank/inventory', icon: <TrendingUp className="h-5 w-5" />, isActive: true },
]

export default function BloodBankInventory() {
  return (
    <DashboardLayout
      title="Blood Inventory"
      subtitle="Detailed inventory management"
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Inventory management page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
