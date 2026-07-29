'use client'

import { Droplets, Clock } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" /> },
  { label: 'Donations', href: '/blood-bank/donations', icon: <Clock className="h-5 w-5" />, isActive: true },
]

export default function BloodBankDonations() {
  return (
    <DashboardLayout
      title="Blood Donations"
      subtitle="Manage incoming donations"
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Donations management page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
