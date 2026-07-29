'use client'

import { Droplets, TrendingUp, Clock, AlertCircle, Send, Truck, Heart } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import { mockBloodBankData } from '@/lib/mockData'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" />, isActive: true },
  { label: 'Inventory', href: '/blood-bank/inventory', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Donations', href: '/blood-bank/donations', icon: <Clock className="h-5 w-5" /> },
  { label: 'Transfers', href: '/blood-bank/transfers', icon: <Truck className="h-5 w-5" /> },
]

export default function BloodBankDashboard() {
  const { profile, inventory, incomingDonations, outgoingTransfers, expiringBlood } = mockBloodBankData

  const totalInventory = inventory.reduce((sum, inv) => sum + inv.available, 0)
  const totalReserved = inventory.reduce((sum, inv) => sum + inv.reserved, 0)
  const criticalItems = expiringBlood.filter((item) => item.daysLeft <= 3).length

  return (
    <DashboardLayout
      title="Blood Bank Operations"
      subtitle={`${profile.name} - Inventory management and blood distribution`}
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      {/* Critical Alert */}
      {criticalItems > 0 && (
        <Alert
          type="danger"
          title="Alert: Blood Expiring Soon"
          message={`${criticalItems} blood types are expiring within 3 days. Take immediate action.`}
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
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          label="Reserved Units"
          value={totalReserved}
          icon={<AlertCircle className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          label="Pending Transfers"
          value={outgoingTransfers.filter((t) => t.status !== 'Delivered').length}
          icon={<Truck className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Expiring Soon"
          value={criticalItems}
          icon={<AlertCircle className="h-6 w-6" />}
          color="red"
        />
      </div>

      {/* Inventory Section */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">📦 Blood Inventory</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {inventory.map((inv) => (
            <div key={inv.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p className="text-2xl font-bold text-blood-600">{inv.bloodGroup}</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold text-gray-900">{inv.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">{inv.available}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reserved</span>
                  <span className="font-semibold text-gray-900">{inv.reserved}</span>
                </div>
                {inv.expiringIn <= 3 && (
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-red-600">Expiring</span>
                    <span className="font-semibold text-red-600">{inv.expiringIn} days</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Expiring Blood Section */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">⚠️ Expiring Blood</h2>
        {expiringBlood.length > 0 ? (
          <div className="space-y-3">
            {expiringBlood.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border-l-4 border-l-amber-600 bg-amber-50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-amber-900">{item.bloodGroup} Blood</p>
                    <Badge variant="warning">{item.daysLeft} days left</Badge>
                  </div>
                  <p className="mt-1 text-sm text-amber-800">
                    {item.units} units • Expires on {item.expiringDate}
                  </p>
                </div>
                <Button size="sm" variant="danger">
                  Prioritize
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No blood expiring soon</p>
        )}
      </Card>

      {/* Transfer Requests Section */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">🚚 Transfer Requests</h2>
        <div className="space-y-3">
          {outgoingTransfers.length > 0 ? (
            outgoingTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className={`rounded-lg border p-4 ${
                  transfer.status === 'Delivered'
                    ? 'border-green-200 bg-green-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {transfer.bloodGroup} Blood → {transfer.hospitalName}
                      </p>
                      <Badge
                        variant={
                          transfer.status === 'Delivered'
                            ? 'success'
                            : transfer.status === 'Dispatched'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                      <div>
                        <span className="font-semibold text-gray-900">{transfer.units}</span> units
                      </div>
                      <div>
                        Dispatched: {new Date(transfer.dispatchedAt).toLocaleDateString()}
                      </div>
                      {transfer.status === 'Delivered' && transfer.deliveredAt && (
                        <div>Delivered: {new Date(transfer.deliveredAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  {transfer.status !== 'Delivered' && (
                    <Button size="sm">Track</Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No pending transfers</p>
          )}
        </div>
      </Card>

      {/* Incoming Donations Section */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">💝 Incoming Donations</h2>
        {incomingDonations.length > 0 ? (
          <div className="space-y-3">
            {incomingDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-gray-900">
                      {donation.bloodGroup} Blood Donation
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {donation.units} unit(s) • {donation.date} at {donation.time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{donation.status}</Badge>
                  <Button size="sm">Confirm</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No incoming donations scheduled</p>
        )}
      </Card>
    </DashboardLayout>
  )
}
