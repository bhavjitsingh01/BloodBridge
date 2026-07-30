'use client'

import { useState, useEffect, useMemo } from 'react'
import { Droplet, AlertCircle, Navigation, Zap, Send, Trash2, Edit2, Loader, Plus, Clock } from 'lucide-react'
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
  { label: 'Dashboard', href: '/hospital', icon: <Droplet className="h-5 w-5" /> },
  { label: 'Inventory', href: '/hospital/inventory', icon: <Zap className="h-5 w-5" /> },
  { label: 'Requests', href: '/hospital/requests', icon: <AlertCircle className="h-5 w-5" />, isActive: true },
  { label: 'Analytics', href: '/hospital/analytics', icon: <Navigation className="h-5 w-5" /> },
]

interface EmergencyRequest {
  id: string
  _id?: string
  bloodGroup: string
  unitsNeeded: number
  priority: string
  status: string
  createdAt?: string
  hospital?: { name: string }
}

export default function HospitalRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<EmergencyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ bloodGroup: 'O+', units: 5, priority: 'Normal' })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getEmergencyRequests({ limit: 100 })
      setRequests(result.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus
      const matchesPriority = filterPriority === 'all' || req.priority === filterPriority
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [requests, searchTerm, filterStatus, filterPriority])

  const handleSubmitRequest = async () => {
    try {
      await apiClient.createEmergencyRequest(formData)
      setShowAddForm(false)
      setFormData({ bloodGroup: 'O+', units: 5, priority: 'Normal' })
      await fetchRequests()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create request')
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.updateEmergencyStatus(id, newStatus)
      await fetchRequests()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await apiClient.deleteEmergencyRequest(id)
        await fetchRequests()
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete request')
      }
    }
  }

  const activeRequests = filteredRequests.filter((r) => r.status !== 'completed').length
  const criticalRequests = filteredRequests.filter((r) => r.priority === 'Emergency').length

  const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled']
  const priorityOptions = ['Normal', 'High', 'Emergency']
  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

  const columns = [
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'unitsNeeded' as const, label: 'Units Needed' },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (value: string) => (
        <Badge
          variant={value === 'Emergency' ? 'danger' : value === 'High' ? 'warning' : 'info'}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value === 'completed'
              ? 'success'
              : value === 'in_progress'
                ? 'warning'
                : value === 'cancelled'
                  ? 'danger'
                  : 'info'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt' as const,
      label: 'Created',
      render: (value?: string) => <span>{value ? formatDateTime(value) : 'N/A'}</span>,
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string, row: EmergencyRequest) => (
        <div className="flex gap-1 flex-wrap">
          {row.status !== 'completed' && row.status !== 'cancelled' && (
            <select
              value={row.status}
              onChange={(e) => handleUpdateStatus(value || row._id || '', e.target.value)}
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
            onClick={() => handleDelete(value || row._id || '')}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardLayout
        title="Blood Requests"
        subtitle="Create and manage blood requests"
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
      title="Blood Requests"
      subtitle="Create and manage blood requests"
      userRole="Hospital Admin"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {criticalRequests > 0 && (
        <Alert
          type="danger"
          title="Emergency Requests Alert"
          message={`${criticalRequests} emergency blood requests require immediate attention`}
          className="mb-6"
        />
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-blood-600" />
            <div>
              <p className="text-sm text-gray-600">Active Requests</p>
              <p className="text-2xl font-bold text-gray-900">{activeRequests}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">Critical Requests</p>
              <p className="text-2xl font-bold text-gray-900">{criticalRequests}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Send className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search blood group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="all">All Priorities</option>
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </div>
      </Card>

      {showAddForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Blood Request</h3>
          <div className="grid gap-4 md:grid-cols-3">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Units Needed</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={handleSubmitRequest}>
              <Send className="mr-2 h-4 w-4" /> Submit Request
            </Button>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <Table
          title="Blood Requests"
          columns={columns}
          data={filteredRequests}
        />
      </div>
    </DashboardLayout>
  )
}
