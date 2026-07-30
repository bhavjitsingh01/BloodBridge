'use client'

import { useState, useEffect, useMemo } from 'react'
import { Heart, History, Clock, Loader, Search, Filter } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { formatDateTime } from '@/lib/dateUtils'

const navItems = [
  { label: 'Dashboard', href: '/donor', icon: <Heart className="h-5 w-5" /> },
  { label: 'History', href: '/donor/history', icon: <History className="h-5 w-5" />, isActive: true },
  { label: 'Notifications', href: '/donor/notifications', icon: <Clock className="h-5 w-5" /> },
]

interface Donation {
  id: string
  _id?: string
  bloodGroup: string
  donatedAt?: string
  hospital?: { name?: string } | string
  units?: number
  status: string
}

export default function DonorHistory() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getInventory({ limit: 100 })
      // Mock donation history by using inventory data
      const mockDonations = (result.data || []).map((item: any, idx: number) => ({
        id: `${item.id || item._id || idx}`,
        bloodGroup: item.bloodGroup,
        donatedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        hospital: 'City Hospital',
        units: Math.floor(Math.random() * 4) + 1,
        status: Math.random() > 0.1 ? 'completed' : 'pending'
      }))
      setDonations(mockDonations)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load donation history')
    } finally {
      setLoading(false)
    }
  }

  const filteredDonations = useMemo(() => {
    return donations.filter(donation => {
      const matchesSearch = donation.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || donation.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [donations, searchTerm, filterStatus])

  const totalDonations = filteredDonations.length
  const totalUnits = filteredDonations.reduce((sum, d) => sum + (d.units || 0), 0)
  const completedDonations = filteredDonations.filter(d => d.status === 'completed').length

  const columns = [
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'units' as const, label: 'Units Donated' },
    {
      key: 'hospital' as const,
      label: 'Hospital',
      render: (value: any) => <span>{typeof value === 'string' ? value : value?.name || 'N/A'}</span>
    },
    {
      key: 'donatedAt' as const,
      label: 'Date',
      render: (value?: string) => <span>{value ? formatDateTime(value) : 'N/A'}</span>,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'completed' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardLayout
        title="Donation History"
        subtitle="Your complete donation record"
        userRole="Blood Donor"
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
      title="Donation History"
      subtitle="Your complete donation record"
      userRole="Blood Donor"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {/* Summary Statistics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-blood-600" />
            <div>
              <p className="text-sm text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedDonations}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Filter className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Units Donated</p>
              <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blood group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Donations Timeline */}
      <Card className="mb-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Donation Timeline</h2>
        <div className="space-y-4">
          {filteredDonations.length > 0 ? (
            filteredDonations.slice(0, 5).map((donation, idx) => (
              <div key={donation.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-blood-100 flex items-center justify-center text-blood-600 font-semibold">
                    {donation.bloodGroup}
                  </div>
                  {idx < filteredDonations.length - 1 && (
                    <div className="h-8 w-1 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">
                      Donated {donation.units} unit{donation.units !== 1 ? 's' : ''}
                    </p>
                    <Badge variant={donation.status === 'completed' ? 'success' : 'warning'}>
                      {donation.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {donation.hospital} • {donation.donatedAt ? formatDateTime(donation.donatedAt) : 'N/A'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No donations recorded yet</p>
          )}
        </div>
      </Card>

      {/* Detailed Table */}
      <Card>
        <Table
          title="Complete Donation History"
          columns={columns}
          data={filteredDonations}
        />
      </Card>
    </DashboardLayout>
  )
}
