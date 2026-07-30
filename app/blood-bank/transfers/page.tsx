'use client'

import { useState, useEffect, useMemo } from 'react'
import { Droplets, TrendingUp, Clock, AlertCircle, Trash2, Edit2, Loader, Plus, Truck, CheckCircle, Send } from 'lucide-react'
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
  { label: 'Donations', href: '/blood-bank/donations', icon: <Clock className="h-5 w-5" /> },
  { label: 'Transfers', href: '/blood-bank/transfers', icon: <Truck className="h-5 w-5" />, isActive: true },
]

interface TransferRequest {
  id: string
  _id?: string
  bloodGroup: string
  units: number
  hospital?: { name?: string } | string
  status: string
  createdAt?: string
  priority?: string
  destination?: string
}

export default function BloodBankTransfers() {
  const { user } = useAuth()
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [formData, setFormData] = useState({ bloodGroup: 'O+', units: 5, destination: '' })

  useEffect(() => {
    fetchTransfers()
  }, [])

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getEmergencyRequests({ limit: 100 })
      setTransfers((result.data || []).map((req: any) => ({
        ...req,
        destination: req.hospital?.name || req.hospital || 'Unknown'
      })))
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load transfers')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesSearch = transfer.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(transfer.destination).toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [transfers, searchTerm, filterStatus])

  const handleInitiateTransfer = async () => {
    try {
      await apiClient.createEmergencyRequest({
        bloodGroup: formData.bloodGroup,
        unitsNeeded: formData.units,
        priority: 'High'
      })
      setShowTransferForm(false)
      setFormData({ bloodGroup: 'O+', units: 5, destination: '' })
      await fetchTransfers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transfer')
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.updateEmergencyStatus(id, newStatus)
      await fetchTransfers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update transfer')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this transfer?')) {
      try {
        await apiClient.deleteEmergencyRequest(id)
        await fetchTransfers()
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to cancel transfer')
      }
    }
  }

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  const statusOptions = ['pending', 'in_transit', 'completed', 'cancelled']

  const pendingTransfers = filteredTransfers.filter((t) => t.status === 'pending').length
  const inTransitTransfers = filteredTransfers.filter((t) => t.status === 'in_transit').length
  const completedTransfers = filteredTransfers.filter((t) => t.status === 'completed').length

  const columns = [
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'units' as const, label: 'Units' },
    {
      key: 'destination' as const,
      label: 'Destination',
      render: (value: string) => <span>{value}</span>
    },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (value?: string) => (
        <Badge variant={value === 'Emergency' ? 'danger' : 'info'}>
          {value || 'Normal'}
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
              : value === 'in_transit'
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
      render: (value: string, row: TransferRequest) => (
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
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardLayout
        title="Blood Transfers"
        subtitle="Track transfers to hospitals"
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
      title="Blood Transfers"
      subtitle="Track transfers to hospitals"
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {pendingTransfers > 0 && (
        <Alert
          type="danger"
          title="Pending Transfers"
          message={`${pendingTransfers} blood transfers are pending shipment`}
          className="mb-6"
        />
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTransfers}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{inTransitTransfers}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedTransfers}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blood-600" />
            <div>
              <p className="text-sm text-gray-600">Total Transfers</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransfers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search blood group or destination..."
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
            </div>
          </div>
          <Button
            onClick={() => setShowTransferForm(!showTransferForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Transfer
          </Button>
        </div>
      </Card>

      {showTransferForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Initiate Blood Transfer</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Units to Transfer</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination Hospital</label>
              <input
                type="text"
                placeholder="Hospital name"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={handleInitiateTransfer}>
              <Send className="mr-2 h-4 w-4" /> Initiate Transfer
            </Button>
            <Button variant="secondary" onClick={() => setShowTransferForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <Table
          title="Transfer Requests"
          columns={columns}
          data={filteredTransfers}
        />
      </div>
    </DashboardLayout>
  )
}
