'use client'

import { Droplets, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import { mockBloodBankData } from '@/lib/mockData'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" />, isActive: true },
  { label: 'Inventory', href: '/blood-bank/inventory', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Donations', href: '/blood-bank/donations', icon: <Clock className="h-5 w-5" /> },
  { label: 'Transfers', href: '/blood-bank/transfers', icon: <AlertCircle className="h-5 w-5" /> },
]

export default function BloodBankDashboard() {
  const { profile, inventory, incomingDonations, outgoingTransfers, expiringBlood } = mockBloodBankData

  const totalInventory = inventory.reduce((sum, inv) => sum + inv.available, 0)
  const criticalItems = expiringBlood.filter((item) => item.daysLeft <= 3).length

  const outgoingTransfersColumns = [
    { key: 'hospitalName' as const, label: 'Hospital' },
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'units' as const, label: 'Units' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: unknown) => {
        const status = String(value)
        return (
          <Badge variant={status === 'Delivered' ? 'success' : 'info'}>
            {status}
          </Badge>
        )
      },
    },
  ]

  return (
    <DashboardLayout
      title="Blood Bank Operations"
      subtitle={`${profile.name} - Inventory management and blood distribution`}
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      {/* Alerts */}
      {criticalItems > 0 && (
        <Alert
          type="danger"
          title="Critical: Blood Expiring Soon"
          message={`${criticalItems} blood types are expiring within 3 days`}
          className="mb-6"
        />
      )}

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Available Units"
          value={totalInventory}
          icon={<Droplets className="h-6 w-6" />}
          color="blood"
          trend={{ value: 5, direction: 'up' }}
        />
        <StatCard
          label="Incoming Donations"
          value={incomingDonations.length}
          icon={<Clock className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Outgoing Transfers"
          value={outgoingTransfers.length}
          icon={<TrendingUp className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          label="Blood Expiring Soon"
          value={criticalItems}
          icon={<AlertCircle className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Blood Inventory */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Blood Inventory by Type</h2>
        <div className="space-y-3">
          {inventory.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-semibold text-gray-900">{inv.bloodGroup}</p>
                <p className="text-sm text-gray-600">Total: {inv.total} units</p>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="font-semibold text-gray-900">{inv.available}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Reserved</p>
                  <p className="font-semibold text-gray-900">{inv.reserved}</p>
                </div>
                {inv.expiringIn <= 3 && (
                  <div className="text-right">
                    <p className="text-sm text-red-600">Expiring In</p>
                    <p className="font-semibold text-red-600">{inv.expiringIn} days</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Incoming Donations */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Incoming Donations</h2>
        <div className="space-y-3">
          {incomingDonations.length > 0 ? (
            incomingDonations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {donation.bloodGroup} • {donation.units} Unit
                  </p>
                  <p className="text-sm text-gray-600">
                    {donation.date} at {donation.time}
                  </p>
                </div>
                <Badge variant="info">{donation.status}</Badge>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">No incoming donations scheduled</div>
          )}
        </div>
      </Card>

      {/* Outgoing Transfers */}
      <div className="mb-8">
        <Table
          title="Recent Transfers to Hospitals"
          columns={outgoingTransfersColumns}
          data={outgoingTransfers}
        />
      </div>

      {/* Expiring Blood Alert */}
      {expiringBlood.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Blood Expiring Soon</h2>
          <div className="space-y-3">
            {expiringBlood.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div>
                  <p className="font-semibold text-amber-900">{item.bloodGroup}</p>
                  <p className="text-sm text-amber-800">{item.units} units expiring on {item.expiringDate}</p>
                </div>
                <Badge variant="warning">{item.daysLeft} days left</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}
