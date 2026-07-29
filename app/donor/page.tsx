'use client'

import { Heart, Bell, MapPin, History, AlertCircle } from 'lucide-react'
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
          value={Math.floor((new Date().getTime() - new Date(profile.lastDonation).getTime()) / (1000 * 60 * 60 * 24))}
          unit="days"
          icon={<Heart className="h-6 w-6" />}
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

      {/* Recent Notifications */}
      <Card className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
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
            <div className="py-8 text-center text-gray-500">
              No notifications at this time
            </div>
          )}
        </div>
      </Card>

      {/* Donation History */}
      <div className="mb-8">
        <Table
          title="Recent Donations"
          columns={donationHistoryColumns}
          data={donationHistory}
        />
      </div>

      {/* Nearby Donation Centers */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Nearby Donation Centers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {nearbyDonationCenters.map((center) => (
            <div key={center.id} className="rounded-lg border border-gray-200 p-4">
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
