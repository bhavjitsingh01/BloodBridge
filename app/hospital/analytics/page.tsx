'use client'

import { useState, useEffect } from 'react'
import { Droplet, Navigation, Zap, AlertCircle, TrendingUp, Loader, PieChart, BarChart3, LineChart } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import StatCard from '@/components/StatCard'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

const navItems = [
  { label: 'Dashboard', href: '/hospital', icon: <Droplet className="h-5 w-5" /> },
  { label: 'Inventory', href: '/hospital/inventory', icon: <Zap className="h-5 w-5" /> },
  { label: 'Requests', href: '/hospital/requests', icon: <AlertCircle className="h-5 w-5" /> },
  { label: 'Analytics', href: '/hospital/analytics', icon: <Navigation className="h-5 w-5" />, isActive: true },
]

export default function HospitalAnalytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('7days')

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [inventoryRes, requestsRes, predictionsRes] = await Promise.all([
        apiClient.getInventory({ limit: 100 }),
        apiClient.getEmergencyRequests({ limit: 100 }),
        apiClient.getPredictions().catch(() => null),
      ])

      // Map API response to component interface
      const mappedInventory = (inventoryRes.data || []).map((item: any) => ({
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

      setInventory(mappedInventory)
      setRequests(requestsRes.data || [])
      setPredictions(predictionsRes)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const totalInventory = inventory.reduce((sum, inv) => sum + (inv.available || 0), 0)
  const totalReserved = inventory.reduce((sum, inv) => sum + (inv.reserved || 0), 0)
  const pendingRequests = requests.filter(req => req.status !== 'completed').length
  const completedRequests = requests.filter(req => req.status === 'completed').length

  const bloodGroupStats = inventory.reduce((acc: any, inv: any) => {
    acc[inv.bloodGroup] = (acc[inv.bloodGroup] || 0) + (inv.available || 0)
    return acc
  }, {})

  const requestsColumns = [
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
        title="Analytics & Insights"
        subtitle="Blood usage patterns and predictions"
        userRole="Hospital Admin"
        navItems={navItems}
      >
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blood-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Analytics & Insights"
      subtitle="Blood usage patterns and predictions"
      userRole="Hospital Admin"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {/* Key Statistics */}
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
          label="Pending Requests"
          value={pendingRequests}
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Completed Requests"
          value={completedRequests}
          icon={<BarChart3 className="h-6 w-6" />}
          color="green"
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

      {/* Blood Inventory by Type */}
      <Card className="mb-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Inventory Analysis by Blood Type</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(bloodGroupStats).map(([bloodGroup, count]) => {
            const status = count < 5 ? 'critical' : count < 15 ? 'low' : 'stable'
            return (
              <div key={bloodGroup} className="rounded-lg border border-gray-200 p-4">
                <p className="text-2xl font-bold text-blood-600">{bloodGroup}</p>
                <p className="mt-2 text-sm text-gray-600">{count} units</p>
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

      {/* Request Statistics */}
      <Card className="mb-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Request Analytics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-6 border border-blue-200">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{requests.length}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-6 border border-amber-200">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{pendingRequests}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-6 border border-green-200">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{completedRequests}</p>
          </div>
        </div>
      </Card>

      {/* Predictions */}
      {predictions && (
        <Card className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">AI Demand Predictions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-gradient-to-br from-blood-50 to-blood-100 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Predicted 7-Day Demand</p>
              <p className="text-2xl font-bold text-blood-600 mt-2">
                {predictions?.sevenDayPrediction || 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Confidence Level</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {predictions?.confidence || 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Requests Table */}
      <Card>
        <Table
          title="Recent Blood Requests"
          columns={requestsColumns}
          data={requests.slice(0, 10)}
        />
      </Card>
    </DashboardLayout>
  )
}
