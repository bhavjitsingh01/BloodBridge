'use client'

import { Heart, History } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'

const navItems = [
  { label: 'Dashboard', href: '/donor', icon: <Heart className="h-5 w-5" /> },
  { label: 'History', href: '/donor/history', icon: <History className="h-5 w-5" />, isActive: true },
]

export default function DonorHistory() {
  return (
    <DashboardLayout
      title="Donation History"
      subtitle="Your complete donation record"
      userRole="Blood Donor"
      navItems={navItems}
    >
      <Card>
        <p className="text-gray-600">Donation history page - Coming soon</p>
      </Card>
    </DashboardLayout>
  )
}
