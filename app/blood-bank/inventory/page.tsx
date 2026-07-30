'use client'

import { useState, useEffect, useMemo } from 'react'
import { Droplets, TrendingUp, Clock, AlertCircle, Trash2, Edit2, Loader, Plus, Truck } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { formatDate } from '@/lib/dateUtils'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" /> },
  { label: 'Inventory', href: '/blood-bank/inventory', icon: <TrendingUp className="h-5 w-5" />, isActive: true },
  { label: 'Donations', href: '/blood-bank/donations', icon: <Clock className="h-5 w-5" /> },
  { label: 'Transfers', href: '/blood-bank/transfers', icon: <Truck className="h-5 w-5" /> },
]

interface InventoryItem {
  id: string
  _id?: string
  bloodGroup: string
  total: number
  available: number
  reserved: number
  expiring?: number
  expiryDate?: string
  status: string
}

export default function BloodBankInventory() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBloodGroup, setFilterBloodGroup] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ bloodGroup: 'O+', units: 10, expiryDate: '' })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getInventory({ limit: 100 })
      setInventory(result.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterBloodGroup === 'all' || item.bloodGroup === filterBloodGroup
      return matchesSearch && matchesFilter
    })
  }, [inventory, searchTerm, filterBloodGroup])

  const handleAddOrUpdate = async () => {
    try {
      const hospitalList = await apiClient.getHospitals()
      const hospital = hospitalList[0]
      const hospitalId = hospital?._id || hospital?.id || ''

      const payload = {
        ...formData,
        hospitalId,
        collectionDate: new Date().toISOString().split('T')[0],
      }
      if (editingId) {
        await apiClient.updateInventory(editingId, payload)
      } else {
        await apiClient.createInventory(payload)
      }
      setShowAddForm(false)
      setEditingId(null)
      setFormData({ bloodGroup: 'O+', units: 10, expiryDate: '' })
      await fetchInventory()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save inventory')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await apiClient.deleteInventory(id)
        await fetchInventory()
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete inventory')
      }
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id || item._id || '')
    setFormData({
      bloodGroup: item.bloodGroup,
      units: item.available,
      expiryDate: item.expiryDate || '',
    })
    setShowAddForm(true)
  }

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  const totalUnits = filteredInventory.reduce((sum, inv) => sum + (inv.available || 0), 0)
  const totalReserved = filteredInventory.reduce((sum, inv) => sum + (inv.reserved || 0), 0)
  const criticalItems = filteredInventory.filter((inv) => (inv.available || 0) < 10).length
  const expiringItems = filteredInventory.filter((inv) => (inv.expiring || 0) > 0).length

  const columns = [
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'total' as const, label: 'Total Units' },
    {
      key: 'available' as const,
      label: 'Available',
      render: (value: number) => (
        <Badge variant={value < 10 ? 'danger' : value < 20 ? 'warning' : 'success'}>
          {value} units
        </Badge>
      ),
    },
    { key: 'reserved' as const, label: 'Reserved' },
    {
      key: 'expiring' as const,
      label: 'Expiring Soon',
      render: (value?: number) => (
        <Badge variant={value && value > 0 ? 'danger' : 'success'}>
          {value || 0} units
        </Badge>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'critical' ? 'danger' : value === 'low' ? 'warning' : 'success'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string, row: InventoryItem) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(row)}
            className="flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" /> Edit
          </Button>
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
        title="Blood Bank Inventory"
        subtitle="Manage and track blood inventory"
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
      title="Blood Bank Inventory"
      subtitle="Manage and track blood inventory"
      userRole="Blood Bank Manager"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {expiringItems > 0 && (
        <Alert
          type="danger"
          title="Expiring Blood Alert"
          message={`${expiringItems} blood items are expiring soon. Take immediate action to prevent waste.`}
          className="mb-6"
        />
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <Droplets className="h-8 w-8 text-blood-600" />
            <div>
              <p className="text-sm text-gray-600">Total Available</p>
              <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">Reserved Units</p>
              <p className="text-2xl font-bold text-gray-900">{totalReserved}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Critical Items</p>
              <p className="text-2xl font-bold text-gray-900">{criticalItems}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{expiringItems}</p>
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
                  placeholder="Search blood group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
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
            onClick={() => {
              setEditingId(null)
              setFormData({ bloodGroup: 'O+', units: 10, expiryDate: '' })
              setShowAddForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Inventory
          </Button>
        </div>
      </Card>

      {showAddForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Inventory' : 'Add New Inventory'}
          </h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
              <input
                type="number"
                min="1"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={handleAddOrUpdate}>
              {editingId ? 'Update' : 'Add'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddForm(false)
                setEditingId(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {bloodGroups.map((bg) => {
            const item = filteredInventory.find((i) => i.bloodGroup === bg)
            const available = item?.available || 0
            const reserved = item?.reserved || 0
            const total = available + reserved
            return (
              <div key={bg} className="rounded-lg border border-gray-200 p-4">
                <p className="text-2xl font-bold text-blood-600">{bg}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available</span>
                    <span className="font-semibold text-green-600">{available}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reserved</span>
                    <span className="font-semibold text-gray-900">{reserved}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold text-gray-900">{total}</span>
                  </div>
                </div>
                <Badge
                  variant={available < 10 ? 'danger' : available < 20 ? 'warning' : 'success'}
                  className="mt-2"
                >
                  {available < 10 ? 'Critical' : available < 20 ? 'Low' : 'Stable'}
                </Badge>
              </div>
            )
          })}
        </div>

        <Table
          title="Inventory Details"
          columns={columns}
          data={filteredInventory}
        />
      </Card>
    </DashboardLayout>
  )
}
