'use client'

import { useState, useEffect, useMemo } from 'react'
import { Activity, Building2, Users, AlertTriangle, TrendingUp, Loader, BarChart3, PieChart, LineChart } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import StatCard from '@/components/StatCard'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <Activity className="h-5 w-5" /> },
  { label: 'Hospitals', href: '/admin/hospitals', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Blood Banks', href: '/admin/blood-banks', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Donors', href: '/admin/donors', icon: <Users className="h-5 w-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <Activity className="h-5 w-5" />, isActive: true },
]

interface Analytics {
  totalHospitals: number
  totalBloodBanks: number
  totalDonors: number
  totalInventory: number
  requestsToday: number
  emergencyRequests: number
  bloodGroupStats: { [key: string]: number }
  inventoryByStatus: { critical: number; low: number; stable: number }
}

export default function AdminAnalytics() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7days')
  const [hospitalData, setHospitalData] = useState<any[]>([])
  const [bloodBankData, setBloodBankData] = useState<any[]>([])
  const [inventoryData, setInventoryData] = useState<any[]>([])
  const [emergencyData, setEmergencyData] = useState<any[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const [hospitals, bloodBanks, donors, inventory, emergencyRequests, predictions] = await Promise.all([
        apiClient.getHospitals({ limit: 100 }).then(res => res.data),
        apiClient.getBloodBanks({ limit: 100 }).then(res => res.data),
        apiClient.getDonors({ limit: 100 }).then(res => res.data),
        apiClient.getInventory({ limit: 100 }).then(res => res.data),
        apiClient.getEmergencyRequests({ limit: 100 }).then(res => res.data),
        apiClient.getPredictions().catch(() => null),
      ])

      setHospitalData(hospitals || [])
      setBloodBankData(bloodBanks || [])
      setEmergencyData(emergencyRequests || [])

      // Map API response to component interface
      const mappedInventory = (inventory || []).map((item: any) => ({
        id: item._id || item.id || '',
        _id: item._id,
        bloodGroup: item.bloodGroup || '',
        total: item.units || 0,
        available: item.units || 0,
        reserved: item.reserved || 0,
        expiring: item.expiring || 0,
        expiryDate: item.expiryDate,
        status: item.status || 'Available'
      }))

      setInventoryData(mappedInventory)

      const totalInventory = mappedInventory.reduce((sum: number, inv: any) => sum + (inv.available || 0), 0)
      const bloodGroupStats = mappedInventory.reduce((acc: any, inv: any) => {
        acc[inv.bloodGroup] = (acc[inv.bloodGroup] || 0) + (inv.available || 0)
        return acc
      }, {})

      const inventoryByStatus = {
        critical: mappedInventory.filter((inv: any) => (inv.available || 0) < 5).length,
        low: mappedInventory.filter((inv: any) => (inv.available || 0) >= 5 && (inv.available || 0) < 15).length,
        stable: mappedInventory.filter((inv: any) => (inv.available || 0) >= 15).length,
      }

      const emergencyCount = (emergencyRequests || []).filter((req: any) => req.status !== 'completed').length
      const requestsToday = (emergencyRequests || []).length

      setAnalytics({
        totalHospitals: hospitals?.length || 0,
        totalBloodBanks: bloodBanks?.length || 0,
        totalDonors: donors?.length || 0,
        totalInventory,
        requestsToday,
        emergencyRequests: emergencyCount,
        bloodGroupStats,
        inventoryByStatus,
      })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const criticalBloodGroups = useMemo(() => {
    if (!analytics) return []
    return Object.entries(analytics.bloodGroupStats)
      .filter(([_, count]) => count < 10)
      .sort(([_, a], [__, b]) => (a as number) - (b as number))
  }, [analytics])

  const hospitalColumns = [
    { key: 'name' as const, label: 'Hospital Name' },
    { key: 'city' as const, label: 'City' },
    {
      key: 'status' as const,
      label: 'Status',
      render: () => <Badge variant="success">Active</Badge>,
    },
  ]

  const bloodBankColumns = [
    { key: 'name' as const, label: 'Blood Bank Name' },
    { key: 'city' as const, label: 'City' },
    {
      key: 'status' as const,
      label: 'Status',
      render: () => <Badge variant="success">Active</Badge>,
    },
  ]

  const inventoryColumns = [
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'available' as const, label: 'Available Units' },
    { key: 'reserved' as const, label: 'Reserved' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'critical' ? 'danger' : value === 'low' ? 'warning' : 'success'}>
          {value}
        </Badge>
      ),
    },
  ]

  const emergencyColumns = [
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'unitsNeeded' as const, label: 'Units Needed' },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (value: string) => (
        <Badge variant={value === 'Emergency' ? 'danger' : 'warning'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'completed' ? 'success' : 'info'}>
          {value}
        </Badge>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardLayout
        title="System Analytics"
        subtitle="City-wide blood supply and demand analytics"
        userRole="System Administrator"
        navItems={navItems}
      >
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blood-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout
        title="System Analytics"
        subtitle="City-wide blood supply and demand analytics"
        userRole="System Administrator"
        navItems={navItems}
      >
        <Alert type="danger" title="Error" message={error || 'Failed to load analytics'} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="System Analytics"
      subtitle="City-wide blood supply and demand analytics"
      userRole="System Administrator"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {analytics.emergencyRequests > 0 && (
        <Alert
          type="danger"
          title="Active Emergency Requests"
          message={`${analytics.emergencyRequests} emergency blood requests are currently active`}
          className="mb-6"
        />
      )}

      {criticalBloodGroups.length > 0 && (
        <Alert
          type="danger"
          title="Critical Blood Shortage"
          message={`Critical shortage detected: ${criticalBloodGroups.map(([bg]) => bg).join(', ')}`}
          className="mb-6"
        />
      )}

      {/* Key Statistics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Connected Hospitals"
          value={analytics.totalHospitals}
          icon={<Building2 className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Blood Banks"
          value={analytics.totalBloodBanks}
          icon={<Building2 className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Registered Donors"
          value={analytics.totalDonors}
          icon={<Users className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          label="Total Blood Units"
          value={analytics.totalInventory}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          label="Emergency Requests"
          value={analytics.emergencyRequests}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
      </div>

      {/* Time Range Filter */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Analytics Time Range</h3>
          <div className="flex gap-2">
            {['7days', '30days', '90days'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blood-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Blood Group Analysis */}
      <Card className="mb-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Blood Inventory by Type</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(analytics.bloodGroupStats).map(([bloodGroup, count]) => {
            const status = count < 5 ? 'critical' : count < 15 ? 'low' : 'stable'
            return (
              <div key={bloodGroup} className="rounded-lg border border-gray-200 p-4">
                <p className="text-2xl font-bold text-blood-600">{bloodGroup}</p>
                <p className="mt-2 text-sm text-gray-600">{count} units available</p>
                <Badge
                  variant={status === 'critical' ? 'danger' : status === 'low' ? 'warning' : 'success'}
                  className="mt-3"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Inventory Status Overview */}
      <Card className="mb-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Inventory Status Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-red-50 p-6 border border-red-200">
            <p className="text-sm text-gray-600">Critical Items</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{analytics.inventoryByStatus.critical}</p>
            <p className="text-xs text-gray-500 mt-2">Less than 5 units</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-6 border border-amber-200">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{analytics.inventoryByStatus.low}</p>
            <p className="text-xs text-gray-500 mt-2">5-15 units</p>
          </div>
          <div className="rounded-lg bg-green-50 p-6 border border-green-200">
            <p className="text-sm text-gray-600">Stable Items</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{analytics.inventoryByStatus.stable}</p>
            <p className="text-xs text-gray-500 mt-2">More than 15 units</p>
          </div>
        </div>
      </Card>

      {/* Tables Grid */}
      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        {/* Hospitals Table */}
        <div>
          <Table
            title={`Connected Hospitals (${hospitalData.length})`}
            columns={hospitalColumns}
            data={hospitalData.slice(0, 5)}
          />
        </div>

        {/* Blood Banks Table */}
        <div>
          <Table
            title={`Blood Banks (${bloodBankData.length})`}
            columns={bloodBankColumns}
            data={bloodBankData.slice(0, 5)}
          />
        </div>
      </div>

      {/* Inventory Details Table */}
      <Card className="mb-8">
        <div className="mb-4">
          <Table
            title={`Inventory Status (${inventoryData.length})`}
            columns={inventoryColumns}
            data={inventoryData.slice(0, 10)}
          />
        </div>
      </Card>

      {/* Emergency Requests Table */}
      <Card>
        <div className="mb-4">
          <Table
            title={`Recent Emergency Requests (${emergencyData.length})`}
            columns={emergencyColumns}
            data={emergencyData.slice(0, 10)}
          />
        </div>
      </Card>
    </DashboardLayout>
  )
}
