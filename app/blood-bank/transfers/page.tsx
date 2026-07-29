'use client'

import { Droplets, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" /> },
  { label: 'Transfers', href: '/blood-bank/transfers', icon: <AlertCircle className="h-5 w-5" />, isActive: true },
]

export default function BloodBankTransfers() {
  return (
    <DashboardLayout
      title="Blood Transfers"
      subtitle="Track transfers to hospitals"
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Transfers page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
