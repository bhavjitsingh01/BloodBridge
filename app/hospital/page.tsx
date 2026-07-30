'use client'

import { useState } from 'react'
import { Droplet, AlertCircle, Navigation, Zap, Send, AlertTriangle, TrendingUp, MapPin, Clock, Loader } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import { useHospitalDashboardData } from '@/lib/useDashboardData'
import { useAuth } from '@/lib/useAuth'

const navItems = [
  { label: 'Dashboard', href: '/hospital', icon: <Droplet className="h-5 w-5" />, isActive: true },
  { label: 'Inventory', href: '/hospital/inventory', icon: <Zap className="h-5 w-5" /> },
  { label: 'Requests', href: '/hospital/requests', icon: <AlertCircle className="h-5 w-5" /> },
  { label: 'Analytics', href: '/hospital/analytics', icon: <Navigation className="h-5 w-5" /> },
]

export default function HospitalDashboard() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useHospitalDashboardData()
  const [requestForm, setRequestForm] = useState({ bloodGroup: 'O+', units: 5, priority: 'Normal' })
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  if (loading) {
    return (
      <DashboardLayout
        title="Hospital Blood Management"
        subtitle="Loading dashboard..."
        userRole="Hospital Admin"
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
        title="Hospital Blood Management"
        subtitle="Error loading dashboard"
        userRole="Hospital Admin"
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
  const emergencyRequests = data?.emergencyRequests || []
  const nearbyBloodBanks = data?.nearbyBloodBanks || []
  const recommendations = data?.recommendations?.recommendations || []

  const totalInventory = inventory.reduce((sum, inv) => sum + (inv.available || 0), 0)
  const totalReserved = inventory.reduce((sum, inv) => sum + (inv.reserved || 0), 0)
  const totalExpiring = inventory.reduce((sum, inv) => sum + (inv.expiring || 0), 0)

  const handleRequestSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { apiClient } = await import('@/lib/api')
      await apiClient.createEmergencyRequest({
        bloodGroup: requestForm.bloodGroup,
        unitsNeeded: requestForm.units,
        priority: requestForm.priority,
        status: 'Pending',
      })
      setSubmitMessage({ type: 'success', text: 'Blood request submitted successfully!' })
      setShowRequestForm(false)
      setRequestForm({ bloodGroup: 'O+', units: 5, priority: 'Normal' })
      setTimeout(() => {
        refetch()
        setSubmitMessage(null)
      }, 1000)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Failed to submit request' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFulfillRequest = async (requestId: string) => {
    try {
      const { apiClient } = await import('@/lib/api')
      await apiClient.updateEmergencyStatus(requestId, 'Fulfilled')
      setSubmitMessage({ type: 'success', text: 'Request fulfilled successfully!' })
      setTimeout(() => {
        refetch()
        setSubmitMessage(null)
      }, 1000)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Failed to fulfill request' })
    }
  }

  const handleAcceptRecommendation = async (recId: string) => {
    try {
      setSubmitMessage({ type: 'success', text: 'Recommendation accepted!' })
      setTimeout(() => {
        setSubmitMessage(null)
      }, 1000)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Failed to accept recommendation' })
    }
  }

  const handleRequestFromBank = async (bankId: string) => {
    try {
      setSubmitMessage({ type: 'success', text: 'Request sent to blood bank!' })
      setTimeout(() => {
        setSubmitMessage(null)
      }, 1000)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Failed to send request' })
    }
  }

  return (
    <DashboardLayout
      title="Hospital Blood Management"
      subtitle={`${user?.name || 'Hospital'} - Real-time blood inventory and request management`}
      userRole="Hospital Admin"
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
      {totalExpiring > 0 && (
        <Alert
          type="danger"
          title="Critical: Blood Shortage Alert"
          message={`O- blood at critical level. ${totalExpiring} units expiring soon. Immediate action required.`}
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
          trend={{ value: 5, direction: 'up' }}
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
          icon={<AlertTriangle className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Blood Groups"
          value={inventory.length}
          icon={<Droplet className="h-6 w-6" />}
          color="green"
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
                  <span className="text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">{inv.available}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reserved</span>
                  <span className="font-semibold text-gray-900">{inv.reserved}</span>
                </div>
                {inv.expiring > 0 && (
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-600">Expiring</span>
                    <span className="font-semibold text-red-600">{inv.expiring}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Raise Blood Request Section */}
      <Card className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">🆘 Raise Blood Request</h2>
          {!showRequestForm && (
            <Button size="sm" onClick={() => setShowRequestForm(true)}>
              + New Request
            </Button>
          )}
        </div>

        {showRequestForm ? (
          <div className="mt-6 space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  value={requestForm.bloodGroup}
                  onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Units Required</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={requestForm.units}
                  onChange={(e) => setRequestForm({ ...requestForm, units: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={requestForm.priority}
                  onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                >
                  <option>Normal</option>
                  <option>High</option>
                  <option>Emergency</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="sm" onClick={handleRequestSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" /> Submit Request
                  </span>
                )}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowRequestForm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-gray-600">Click "New Request" to submit a blood request</p>
        )}
      </Card>

      {/* Emergency Requests Section */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">🚨 Emergency Requests In Progress</h2>
        <div className="space-y-3">
          {emergencyRequests.length === 0 ? (
            <p className="text-gray-600">No emergency requests in progress</p>
          ) : (
            emergencyRequests.map((req: any) => (
              <div key={req._id || req.id} className="rounded-lg border-l-4 border-l-red-600 bg-red-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{req.bloodGroup} Blood Needed</p>
                      <Badge variant="danger">{req.unitsNeeded} units</Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{req.hospital?.name || 'Hospital'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Status: {req.status}</span>
                      </div>
                      <div>
                        <Badge variant="warning">{req.priority}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="danger" onClick={() => handleFulfillRequest(req._id || req.id)}>
                    Fulfill
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* AI Recommendations Section */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">🤖 AI Recommendations</h2>
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-gray-600">No recommendations at this time</p>
          ) : (
            recommendations.map((rec: any, idx: number) => (
              <div
                key={rec.id || idx}
                className={`rounded-lg border-l-4 p-4 ${
                  rec.priority === 'Critical' || rec.urgency === 'critical'
                    ? 'border-l-red-600 bg-red-50'
                    : rec.priority === 'High' || rec.urgency === 'high'
                      ? 'border-l-amber-600 bg-amber-50'
                      : 'border-l-blue-600 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{rec.title || rec.reason}</p>
                      <Badge variant={rec.priority === 'Critical' ? 'danger' : rec.priority === 'High' ? 'warning' : 'info'}>
                        {rec.confidence || 'N/A'}% confident
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{rec.reason || rec.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{rec.action || 'Review recommendation'}</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAcceptRecommendation(rec.id || idx.toString())}>Accept</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Nearby Blood Banks */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">🏦 Nearby Blood Banks</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {nearbyBloodBanks.map((bank) => (
            <div key={bank.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{bank.name}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{bank.distance}</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleRequestFromBank(bank.id)}>Request</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
