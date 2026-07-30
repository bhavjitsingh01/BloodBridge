'use client'

import { useState, useEffect, useMemo } from 'react'
import { Droplets, Clock, TrendingUp, AlertCircle, Plus, Edit2, Trash2, Loader, CheckCircle, Calendar } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { formatDateTime } from '@/lib/dateUtils'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" /> },
  { label: 'Inventory', href: '/blood-bank/inventory', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Donations', href: '/blood-bank/donations', icon: <Clock className="h-5 w-5" />, isActive: true },
  { label: 'Transfers', href: '/blood-bank/transfers', icon: <AlertCircle className="h-5 w-5" /> },
]

interface DonationSchedule {
  id: string
  _id?: string
  donorName: string
  bloodGroup: string
  scheduledDate: string
  status: string
  units?: number
  donorId?: string
}

export default function BloodBankDonations() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<DonationSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterBloodGroup, setFilterBloodGroup] = useState('all')
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [formData, setFormData] = useState({
    donorName: '',
    bloodGroup: 'O+',
    scheduledDate: '',
    units: 1
  })

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getDonors({ limit: 100 })
      // Mock donation schedule from donors data
      const schedules = (result.data || []).map((donor: any, idx: number) => ({
        id: `${donor.id || donor._id || idx}`,
        donorName: donor.name || `Donor ${idx + 1}`,
        bloodGroup: donor.bloodGroup || 'O+',
        scheduledDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.3 ? 'pending' : Math.random() > 0.5 ? 'completed' : 'cancelled',
        units: Math.floor(Math.random() * 3) + 1,
        donorId: donor.id || donor._id
      }))
      setDonations(schedules)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load donations')
    } finally {
      setLoading(false)
    }
  }

  const filteredDonations = useMemo(() => {
    return donations.filter(donation => {
      const matchesStatus = filterStatus === 'all' || donation.status === filterStatus
      const matchesBloodGroup = filterBloodGroup === 'all' || donation.bloodGroup === filterBloodGroup
      return matchesStatus && matchesBloodGroup
    })
  }, [donations, filterStatus, filterBloodGroup])

  const handleScheduleDonation = async () => {
    try {
      // In a real scenario, this would create a donation schedule in the database
      const newDonation: DonationSchedule = {
        id: `${Date.now()}`,
        donorName: formData.donorName,
        bloodGroup: formData.bloodGroup,
        scheduledDate: formData.scheduledDate,
        status: 'pending',
        units: formData.units
      }
      setDonations([...donations, newDonation])
      setShowScheduleForm(false)
      setFormData({ donorName: '', bloodGroup: 'O+', scheduledDate: '', units: 1 })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule donation')
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setDonations(donations.map(d =>
        d.id === id ? { ...d, status: newStatus } : d
      ))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this donation schedule?')) {
      try {
        setDonations(donations.filter(d => d.id !== id))
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete schedule')
      }
    }
  }

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  const statusOptions = ['pending', 'completed', 'cancelled']

  const pendingCount = filteredDonations.filter(d => d.status === 'pending').length
  const completedCount = filteredDonations.filter(d => d.status === 'completed').length
  const totalUnitsScheduled = filteredDonations.reduce((sum, d) => sum + (d.units || 0), 0)

  const columns = [
    { key: 'donorName' as const, label: 'Donor Name' },
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'units' as const, label: 'Units' },
    {
      key: 'scheduledDate' as const,
      label: 'Scheduled Date',
      render: (value?: string) => <span>{value ? formatDateTime(value) : 'N/A'}</span>,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value === 'completed'
              ? 'success'
              : value === 'pending'
                ? 'warning'
                : 'danger'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string, row: DonationSchedule) => (
        <div className="flex gap-1 flex-wrap">
          {row.status !== 'completed' && (
            <select
              value={row.status}
              onChange={(e) => handleUpdateStatus(value, e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(value)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardLayout
        title="Blood Donations"
        subtitle="Manage incoming donations"
        userRole="Blood Bank Manager"
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
      title="Blood Donations"
      subtitle="Manage incoming donations"
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {pendingCount > 0 && (
        <Alert
          type="danger"
          title="Pending Donations"
          message={`${pendingCount} donation appointments are pending`}
          className="mb-6"
        />
      )}

      {/* Summary Statistics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Droplets className="h-8 w-8 text-blood-600" />
            <div>
              <p className="text-sm text-gray-600">Total Units Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{totalUnitsScheduled}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">Total Schedules</p>
              <p className="text-2xl font-bold text-gray-900">{filteredDonations.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Blood Group</label>
                <select
                  value={filterBloodGroup}
                  onChange={(e) => setFilterBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="all">All Blood Groups</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Schedule Donation
          </Button>
        </div>
      </Card>

      {/* Schedule Form */}
      {showScheduleForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Donation</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Donor Name</label>
              <input
                type="text"
                placeholder="Donor name"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={handleScheduleDonation}>
              <Plus className="mr-2 h-4 w-4" /> Schedule
            </Button>
            <Button variant="secondary" onClick={() => setShowScheduleForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Donations Table */}
      <Card>
        <Table
          title="Donation Schedule"
          columns={columns}
          data={filteredDonations}
        />
      </Card>
    </DashboardLayout>
  )
}
