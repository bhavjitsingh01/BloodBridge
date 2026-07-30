'use client'

import { useState } from 'react'
import { Droplets, TrendingUp, Clock, AlertCircle, Send, Truck, Heart, Loader } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import { useBloodBankDashboardData } from '@/lib/useDashboardData'
import { useAuth } from '@/lib/useAuth'
import { formatDate } from '@/lib/dateUtils'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" />, isActive: true },
  { label: 'Inventory', href: '/blood-bank/inventory', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Donations', href: '/blood-bank/donations', icon: <Clock className="h-5 w-5" /> },
  { label: 'Transfers', href: '/blood-bank/transfers', icon: <Truck className="h-5 w-5" /> },
]

export default function BloodBankDashboard() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useBloodBankDashboardData()
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { dashboardHandlers } = await import('@/lib/dashboardHandlers')
      await dashboardHandlers.acceptEmergencyRequest(requestId)
      setSubmitMessage({ type: 'success', text: 'Request accepted successfully!' })
      setTimeout(() => {
        refetch()
        setSubmitMessage(null)
      }, 1000)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Failed to accept request' })
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const { dashboardHandlers } = await import('@/lib/dashboardHandlers')
      await dashboardHandlers.deleteEmergencyRequest(requestId)
      setSubmitMessage({ type: 'success', text: 'Request deleted successfully!' })
      setTimeout(() => {
        refetch()
        setSubmitMessage(null)
      }, 1000)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Failed to delete request' })
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Blood Bank Operations"
        subtitle="Loading dashboard..."
        userRole="Blood Bank Manager"
        navItems={navItems}
      >
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blood-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Blood Bank Operations"
        subtitle="Error loading dashboard"
        userRole="Blood Bank Manager"
        navItems={navItems}
      >
        <Alert
          type="danger"
          title="Failed to load dashboard"
          message={error}
          className="mb-6"
        />
      </DashboardLayout>
    )
  }

  const inventory = data?.inventory || []
  const expiryRisks = data?.expiryRisks || {}
  const emergencyRequests = data?.emergencyRequests || []

  const totalInventory = inventory.reduce((sum, inv) => sum + (inv.available || 0), 0)
  const totalReserved = inventory.reduce((sum, inv) => sum + (inv.reserved || 0), 0)
  const criticalItems = inventory.filter((item: any) => item.expiring > 0).length

  return (
    <DashboardLayout
      title="Blood Bank Operations"
      subtitle={`${user?.name || 'Blood Bank'} - Inventory management and blood distribution`}
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      {/* Submit Message Alert */}
      {submitMessage && (
        <Alert
          type={submitMessage.type}
          title={submitMessage.type === 'success' ? 'Success' : 'Error'}
          message={submitMessage.text}
          className="mb-6"
        />
      )}

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
          value={emergencyRequests.filter((r: any) => r.status !== 'completed').length}
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
        {Object.keys(expiryRisks).length > 0 ? (
          <div className="space-y-3">
            {inventory.filter((inv: any) => inv.expiring > 0).map((item: any) => (
              <div
                key={item._id || item.id}
                className="flex items-center justify-between rounded-lg border-l-4 border-l-amber-600 bg-amber-50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-amber-900">{item.bloodGroup} Blood</p>
                    <Badge variant="warning">{item.expiring} units expiring</Badge>
                  </div>
                  <p className="mt-1 text-sm text-amber-800">
                    {item.expiring} units expiring soon
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">🚚 Emergency Requests</h2>
        <div className="space-y-3">
          {emergencyRequests.length > 0 ? (
            emergencyRequests.map((req: any) => (
              <div
                key={req._id || req.id}
                className={`rounded-lg border p-4 ${
                  req.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {req.bloodGroup} Blood → {req.hospital?.name}
                      </p>
                      <Badge
                        variant={
                          req.status === 'completed'
                            ? 'success'
                            : req.status === 'in_progress'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                      <div>
                        <span className="font-semibold text-gray-900">{req.unitsNeeded}</span> units
                      </div>
                      <div>
                        Priority: {req.priority}
                      </div>
                    </div>
                  </div>
                  {req.status !== 'completed' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(req._id || req.id)}>
                        Accept
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteRequest(req._id || req.id)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No pending requests</p>
          )}
        </div>
      </Card>

      {/* Active Donors Section */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">💝 Available Donors</h2>
        {(data?.nearbyDonors || []).length > 0 ? (
          <div className="space-y-3">
            {(data?.nearbyDonors || []).slice(0, 5).map((donor: any) => (
              <div
                key={donor._id || donor.id}
                className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-gray-900">
                      {donor.bloodGroup} Blood Donor
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {donor.name} • Available Status: {donor.availabilityStatus}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Available</Badge>
                  <Button size="sm">Contact</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No available donors at this time</p>
        )}
      </Card>
    </DashboardLayout>
  )
}
