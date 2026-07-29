'use client'

import { useState, useEffect } from 'react'
import { Heart, Bell, MapPin, History, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import { mockDonorData } from '@/lib/mockData'

const navItems = [
  { label: 'Dashboard', href: '/donor', icon: <Heart className="h-5 w-5" />, isActive: true },
  { label: 'Notifications', href: '/donor/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'History', href: '/donor/history', icon: <History className="h-5 w-5" /> },
]

export default function DonorDashboard() {
  const { profile, notifications, donationHistory, nearbyDonationCenters } = mockDonorData
  const [daysSinceLastDonation, setDaysSinceLastDonation] = useState(0)

  useEffect(() => {
    const lastDonationDate = new Date(profile.lastDonation).getTime()
    const currentDate = new Date().getTime()
    const days = Math.floor((currentDate - lastDonationDate) / (1000 * 60 * 60 * 24))
    setDaysSinceLastDonation(days)
  }, [profile.lastDonation])

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

  const hasBloodDemand = notifications.some((notif) => notif.title.includes(profile.bloodGroup))

  return (
    <DashboardLayout
      title="Donor Dashboard"
      subtitle="Manage your donations and stay updated on blood needs"
      userRole="Blood Donor"
      navItems={navItems}
    >
      {/* Profile Alert */}
      {profile.availability !== 'Available' && (
        <Alert
          type="warning"
          title="Availability Status"
          message={`Your current status is: ${profile.availability}`}
          className="mb-6"
        />
      )}

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Blood Group"
          value={profile.bloodGroup}
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
          label="Total Donations"
          value={donationHistory.length}
          icon={<History className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          label="Nearby Centers"
          value={nearbyDonationCenters.length}
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
                <Badge variant={profile.availability === 'Available' ? 'success' : 'warning'}>
                  {profile.availability}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{profile.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium text-gray-900">{profile.phone}</span>
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
                  <Badge variant="success">{profile.eligibility}</Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  You are eligible to donate blood. Please maintain good health and hydration before your donation.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-gray-900">Last Donation</p>
                  <p className="mt-1 text-sm text-gray-600">{profile.lastDonation}</p>
                </div>
                <div className="rounded border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-gray-900">Age Group</p>
                  <p className="mt-1 text-sm text-gray-600">18 - 65 years</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Center Section */}
      <Card className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notification Center</h2>
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div
                  className={`flex-shrink-0 rounded-full p-2 ${
                    notif.type === 'urgent' ? 'bg-red-100' : 'bg-blue-100'
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 ${
                      notif.type === 'urgent' ? 'text-red-600' : 'text-blue-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span>{notif.hospital}</span>
                    <span>{notif.distance}</span>
                  </div>
                </div>
                {notif.type === 'urgent' && (
                  <Badge variant="danger" className="flex-shrink-0">
                    Urgent
                  </Badge>
                )}
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

      {/* Donation History Section */}
      <div className="mb-8">
        <Table
          title="Donation History"
          columns={donationHistoryColumns}
          data={donationHistory}
        />
      </div>

      {/* Nearby Donation Centers Section */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Nearby Donation Centers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {nearbyDonationCenters.map((center) => (
            <div key={center.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">{center.name}</p>
              <p className="mt-2 text-sm text-gray-600">{center.address}</p>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-gray-600">
                  <MapPin className="mb-1 inline h-4 w-4" /> {center.distance}
                </span>
                <span className="text-gray-600">{center.hours}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
