'use client'

import { useState, useEffect } from 'react'
import { Heart, Bell, MapPin, History, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import { useDonorDashboardData } from '@/lib/useDashboardData'
import { useAuth } from '@/lib/useAuth'

const navItems = [
  { label: 'Dashboard', href: '/donor', icon: <Heart className="h-5 w-5" />, isActive: true },
  { label: 'Notifications', href: '/donor/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'History', href: '/donor/history', icon: <History className="h-5 w-5" /> },
]

export default function DonorDashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useDonorDashboardData()
  const [daysSinceLastDonation, setDaysSinceLastDonation] = useState(0)

  useEffect(() => {
    if (user?.lastDonation) {
      const lastDonationDate = new Date(user.lastDonation).getTime()
      const currentDate = new Date().getTime()
      const days = Math.floor((currentDate - lastDonationDate) / (1000 * 60 * 60 * 24))
      setDaysSinceLastDonation(days)
    }
  }, [user?.lastDonation])

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
      {/* Profile Alert */}
      {user?.availabilityStatus !== 'Available' && (
        <Alert
          type="warning"
          title="Availability Status"
          message={`Your current status is: ${user?.availabilityStatus}`}
          className="mb-6"
        />
      )}

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Blood Group"
          value={user?.bloodGroup || 'N/A'}
          icon={<Heart className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Days Since Last Donation"
          value={daysSinceLastDonation}
          unit="days"
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

      {/* Availability Status Section */}
      <Card className="mb-8 border-l-4 border-l-blue-500">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-full bg-blue-100 p-3">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Availability Status</h2>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Status:</span>
                <Badge variant={user?.availabilityStatus === 'Available' ? 'success' : 'warning'}>
                  {user?.availabilityStatus || 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{user?.location || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium text-gray-900">{user?.phone || user?.email}</span>
              </div>
            </div>
          </div>
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
