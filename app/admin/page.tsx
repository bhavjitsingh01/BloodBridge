'use client'

import { Users, Building2, AlertTriangle, Activity } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import { mockAdminData } from '@/lib/mockData'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <Activity className="h-5 w-5" />, isActive: true },
  { label: 'Hospitals', href: '/admin/hospitals', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Blood Banks', href: '/admin/blood-banks', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Donors', href: '/admin/donors', icon: <Users className="h-5 w-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <Activity className="h-5 w-5" /> },
]

export default function AdminDashboard() {
  const { systemStats, cityBloodAvailability, hospitalsList, emergencyRequests, recentNotifications } = mockAdminData

  const criticalBloodGroups = cityBloodAvailability.filter((b) => b.status === 'Critical').length

  const hospitalsColumns = [
    { key: 'name' as const, label: 'Hospital' },
    { key: 'location' as const, label: 'Location' },
    { key: 'bloodRequests' as const, label: 'Active Requests' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: unknown) => <Badge variant="success">{String(value)}</Badge>,
    },
  ]

  const emergencyRequestsColumns = [
    { key: 'hospital' as const, label: 'Hospital' },
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'units' as const, label: 'Units' },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (value: unknown) => {
        const priority = String(value)
        return (
          <Badge variant={priority === 'Critical' ? 'danger' : 'warning'}>
            {priority}
          </Badge>
        )
      },
    },
  ]

  return (
    <DashboardLayout
      title="System Administration"
      subtitle="Monitor the BloodBridge ecosystem - hospitals, blood banks, donors, and AI predictions"
      userRole="System Administrator"
      navItems={navItems}
    >
      {/* Critical Alerts */}
      {criticalBloodGroups > 0 && (
        <Alert
          type="danger"
          title="Critical Blood Shortage Alert"
          message={`${criticalBloodGroups} blood types have critical shortage levels`}
          className="mb-6"
        />
      )}

      {/* Key Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Connected Hospitals"
          value={systemStats.totalHospitals}
          icon={<Building2 className="h-6 w-6" />}
          color="blood"
          trend={{ value: 2, direction: 'up' }}
        />
        <StatCard
          label="Blood Banks"
          value={systemStats.totalBloodBanks}
          icon={<Building2 className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Registered Donors"
          value={systemStats.totalDonors}
          icon={<Users className="h-6 w-6" />}
          color="amber"
          trend={{ value: 15, direction: 'up' }}
        />
        <StatCard
          label="Total Blood Units"
          value={systemStats.totalInventory}
          icon={<Activity className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* City Blood Availability */}
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">City Blood Availability Status</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cityBloodAvailability.map((blood) => (
            <div key={blood.bloodGroup} className="rounded-lg border border-gray-200 p-4">
              <p className="text-2xl font-bold text-blood-600">{blood.bloodGroup}</p>
              <p className="mt-2 text-gray-600">{blood.units} units</p>
              <div className="mt-3">
                <Badge
                  variant={
                    blood.status === 'Critical'
                      ? 'danger'
                      : blood.status === 'Low'
                        ? 'warning'
                        : 'success'
                  }
                >
                  {blood.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency Requests */}
      <div className="mb-8">
        <Table
          title="Active Emergency Requests"
          columns={emergencyRequestsColumns}
          data={emergencyRequests}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Hospitals Overview */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Connected Hospitals</h2>
          <div className="space-y-3">
            {hospitalsList.map((hospital) => (
              <div key={hospital.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{hospital.name}</p>
                    <p className="text-sm text-gray-600">{hospital.location}</p>
                  </div>
                  <Badge variant="success">{hospital.bloodRequests} requests</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">System Notifications</h2>
          <div className="space-y-3">
            {recentNotifications.map((notif) => (
              <div key={notif.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start gap-3">
                  {notif.type === 'alert' ? (
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  ) : (
                    <Activity className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{notif.message}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
