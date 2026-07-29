'use client'

import { Droplet, AlertCircle, Navigation, Zap } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import { mockHospitalData } from '@/lib/mockData'

const navItems = [
  { label: 'Dashboard', href: '/hospital', icon: <Droplet className="h-5 w-5" />, isActive: true },
  { label: 'Inventory', href: '/hospital/inventory', icon: <Zap className="h-5 w-5" /> },
  { label: 'Requests', href: '/hospital/requests', icon: <AlertCircle className="h-5 w-5" /> },
  { label: 'Analytics', href: '/hospital/analytics', icon: <Navigation className="h-5 w-5" /> },
]

export default function HospitalDashboard() {
  const { profile, inventory, bloodRequests, nearbyHospitals, nearbyBloodBanks } = mockHospitalData

  const totalInventory = inventory.reduce((sum, inv) => sum + inv.available, 0)
  const totalReserved = inventory.reduce((sum, inv) => sum + inv.reserved, 0)
  const totalExpiring = inventory.reduce((sum, inv) => sum + inv.expiring, 0)

  const bloodRequestColumns = [
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'units' as const, label: 'Units' },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (value: unknown) => {
        const priority = String(value)
        return (
          <Badge variant={priority === 'Emergency' ? 'danger' : priority === 'High' ? 'warning' : 'info'}>
            {priority}
          </Badge>
        )
      },
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: unknown) => {
        const status = String(value)
        return (
          <Badge variant={status === 'Fulfilled' ? 'success' : status === 'Processing' ? 'warning' : 'info'}>
            {status}
          </Badge>
        )
      },
    },
  ]

  return (
    <DashboardLayout
      title="Hospital Blood Management"
      subtitle={`${profile.name} - Real-time blood inventory and request management`}
      userRole="Hospital Admin"
      navItems={navItems}
    >
      {/* Alerts */}
      {totalExpiring > 0 && (
        <Alert
          type="warning"
          title="Blood Expiring Soon"
          message={`${totalExpiring} units of blood are expiring within the next 5 days`}
          className="mb-6"
        />
      )}

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available Units"
          value={totalInventory}
          icon={<Droplet className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Reserved Units"
          value={totalReserved}
          icon={<AlertCircle className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          label="Units Expiring Soon"
          value={totalExpiring}
          icon={<AlertCircle className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Blood Groups"
          value={inventory.length}
          icon={<Droplet className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Blood Inventory */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Blood Inventory</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {inventory.map((inv) => (
            <div key={inv.id} className="rounded-lg border border-gray-200 p-4">
              <p className="text-2xl font-bold text-blood-600">{inv.bloodGroup}</p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{inv.available}</span> Available
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{inv.reserved}</span> Reserved
                </p>
                {inv.expiring > 0 && (
                  <p className="text-red-600">
                    <span className="font-semibold">{inv.expiring}</span> Expiring
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Blood Requests */}
      <div className="mb-8">
        <Table
          title="Recent Blood Requests"
          columns={bloodRequestColumns}
          data={bloodRequests}
        />
      </div>

      {/* Nearby Hospitals and Blood Banks */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Nearby Hospitals</h2>
          <div className="space-y-3">
            {nearbyHospitals.map((hospital) => (
              <div key={hospital.id} className="rounded-lg border border-gray-200 p-3">
                <p className="font-semibold text-gray-900">{hospital.name}</p>
                <p className="text-sm text-gray-600">{hospital.distance}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Nearby Blood Banks</h2>
          <div className="space-y-3">
            {nearbyBloodBanks.map((bank) => (
              <div key={bank.id} className="rounded-lg border border-gray-200 p-3">
                <p className="font-semibold text-gray-900">{bank.name}</p>
                <p className="text-sm text-gray-600">{bank.distance}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
