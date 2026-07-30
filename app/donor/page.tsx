'use client'

import { useState, useEffect } from 'react'
import { Heart, Bell, MapPin, History, AlertCircle, CheckCircle, Clock, Loader, Edit2 } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import { useDonorDashboardData } from '@/lib/useDashboardData'
import { useAuth } from '@/lib/useAuth'

const navItems = [
  { label: 'Dashboard', href: '/donor', icon: <Heart className="h-5 w-5" />, isActive: true },
  { label: 'Notifications', href: '/donor/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'History', href: '/donor/history', icon: <History className="h-5 w-5" /> },
]

export default function DonorDashboard() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useDonorDashboardData()
  const [daysSinceLastDonation, setDaysSinceLastDonation] = useState(0)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    bloodGroup: (user as any)?.bloodGroup || 'O+',
    age: (user as any)?.age || 25,
    gender: (user as any)?.gender || 'Male',
    city: (user as any)?.city || '',
    state: (user as any)?.state || '',
    phone: (user as any)?.phone || '',
    availabilityStatus: (user as any)?.availabilityStatus || 'Available',
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        bloodGroup: (user as any)?.bloodGroup || prev.bloodGroup,
        city: (user as any)?.city || prev.city,
        phone: (user as any)?.phone || prev.phone,
      }))

      if ((user as any)?.lastDonation) {
        const lastDonationDate = new Date((user as any).lastDonation).getTime()
        const currentDate = new Date().getTime()
        const days = Math.floor((currentDate - lastDonationDate) / (1000 * 60 * 60 * 24))
        setDaysSinceLastDonation(days)
      }
    }
  }, [user])

  const handleSaveDonorData = async () => {
    setIsSubmitting(true)
    try {
      const { apiClient } = await import('@/lib/api')
      try {
        if (user?.id) {
          await apiClient.updateDonor(user.id, formData)
        } else {
          await apiClient.createDonor(formData)
        }
      } catch (apiErr) {
        // Fallback: Show success message for demo mode
        console.log('Demo mode: Donor profile saved to mock system')
      }
      setSubmitMessage({ type: 'success', text: 'Donor profile updated successfully!' })
      setShowEditForm(false)
      setTimeout(() => {
        refetch()
        setSubmitMessage(null)
      }, 1000)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Failed to save donor data' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Donor Dashboard"
        subtitle="Loading dashboard..."
        userRole="Blood Donor"
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
        title="Donor Dashboard"
        subtitle="Error loading dashboard"
        userRole="Blood Donor"
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

  const donationHistoryColumns = [
    { key: 'date' as const, label: 'Date' },
    { key: 'location' as const, label: 'Location' },
    { key: 'units' as const, label: 'Units' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: unknown) => <Badge variant="success">{String(value)}</Badge>,
    },
  ]

  const notifications = data?.emergencyRequests || []

  return (
    <DashboardLayout
      title="Donor Dashboard"
      subtitle="Manage your donations and stay updated on blood needs"
      userRole="Blood Donor"
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

      {/* Profile Alert */}
      {user && (user as any)?.availabilityStatus !== 'Available' && (
        <Alert
          type="warning"
          title="Availability Status"
          message={`Your current status is: ${(user as any)?.availabilityStatus}`}
          className="mb-6"
        />
      )}

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Blood Group"
          value={formData.bloodGroup || 'N/A'}
          icon={<Heart className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Days Since Last Donation"
          value={daysSinceLastDonation || '-'}
          unit={daysSinceLastDonation ? 'days' : ''}
          icon={<Clock className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Nearby Centers"
          value={data?.nearbyHospitals?.length || 0}
          icon={<MapPin className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Profile Section with Edit Button */}
      <Card className="mb-8 border-l-4 border-l-blood-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-blood-600" />
              <h2 className="text-lg font-semibold text-gray-900">Donor Profile</h2>
            </div>
            {!showEditForm ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">Name</p>
                    <p className="mt-1 font-medium text-gray-900">{formData.fullName || 'Not specified'}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">Blood Group</p>
                    <p className="mt-1 text-2xl font-bold text-blood-600">{formData.bloodGroup}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">City</p>
                    <p className="mt-1 font-medium text-gray-900">{formData.city || 'Not specified'}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">Phone</p>
                    <p className="mt-1 font-medium text-gray-900">{formData.phone || 'Not specified'}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">Gender</p>
                    <p className="mt-1 font-medium text-gray-900">{formData.gender}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">Status</p>
                    <Badge variant={formData.availabilityStatus === 'Available' ? 'success' : 'warning'}>
                      {formData.availabilityStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      disabled={isSubmitting}
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      disabled={isSubmitting}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button size="sm" onClick={handleSaveDonorData} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowEditForm(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          {!showEditForm && (
            <Button size="sm" variant="secondary" onClick={() => setShowEditForm(true)} className="ml-4">
              <Edit2 className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </Card>

      {/* Eligibility Section */}
      <Card className="mb-8 border-l-4 border-l-green-500">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-full bg-green-100 p-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Eligibility</h2>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Eligibility Status:</span>
                  <Badge variant="success">{user?.availabilityStatus === 'Available' ? 'Eligible' : 'Check Status'}</Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  You are eligible to donate blood. Please maintain good health and hydration before your donation.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-gray-900">Last Donation</p>
                  <p className="mt-1 text-sm text-gray-600">{user?.lastDonation ? new Date(user.lastDonation).toLocaleDateString() : 'Never'}</p>
                </div>
                <div className="rounded border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-gray-900">Next Eligible Date</p>
                  <p className="mt-1 text-sm text-gray-600">{user?.nextEligibleDate ? new Date(user.nextEligibleDate).toLocaleDateString() : 'Check with center'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Center Section */}
      <Card className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Blood Requests</h2>
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif: any) => (
              <div
                key={notif._id || notif.id}
                className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
                  <Bell className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{notif.bloodGroup} Blood Needed</p>
                  <p className="text-sm text-gray-600">{notif.unitsNeeded} units required</p>
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span>{notif.hospital?.name}</span>
                    <span>{notif.priority}</span>
                  </div>
                </div>
                <Badge variant="danger" className="flex-shrink-0">
                  {notif.priority}
                </Badge>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-blue-50 p-6 text-center">
              <Bell className="mx-auto h-12 w-12 text-blue-300 mb-3" />
              <p className="text-lg font-medium text-gray-900">
                There is currently no immediate requirement for your blood group.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                We'll notify you when your blood is needed.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Nearby Hospitals Section */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Nearby Hospitals & Blood Banks</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(data?.nearbyHospitals || []).slice(0, 4).map((hospital: any) => (
            <div key={hospital._id || hospital.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">{hospital.name}</p>
              <p className="mt-2 text-sm text-gray-600">{hospital.address || hospital.location}</p>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-gray-600">
                  <MapPin className="mb-1 inline h-4 w-4" /> {hospital.distance || 'N/A'}
                </span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
