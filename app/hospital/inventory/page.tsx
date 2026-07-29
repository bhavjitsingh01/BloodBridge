'use client'

import { useState, useMemo } from 'react'
import { Droplet, AlertCircle, Navigation, Zap, Send, Trash2, Edit2, Loader, Plus } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { formatDate } from '@/lib/dateUtils'
import { useState as useStateRef, useEffect } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/hospital', icon: <Droplet className="h-5 w-5" /> },
  { label: 'Inventory', href: '/hospital/inventory', icon: <Zap className="h-5 w-5" />, isActive: true },
  { label: 'Requests', href: '/hospital/requests', icon: <AlertCircle className="h-5 w-5" /> },
  { label: 'Analytics', href: '/hospital/analytics', icon: <Navigation className="h-5 w-5" /> },
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

export default function HospitalInventory() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBloodGroup, setFilterBloodGroup] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ bloodGroup: 'O+', units: 5 })

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
      if (editingId) {
        await apiClient.updateInventory(editingId, formData)
      } else {
        await apiClient.createInventory(formData)
      }
      setShowAddForm(false)
      setEditingId(null)
      setFormData({ bloodGroup: 'O+', units: 5 })
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
    setFormData({ bloodGroup: item.bloodGroup, units: item.available })
    setShowAddForm(true)
  }

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  const totalUnits = filteredInventory.reduce((sum, inv) => sum + (inv.available || 0), 0)
  const criticalItems = filteredInventory.filter((inv) => (inv.available || 0) < 5).length

  const columns = [
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    { key: 'total' as const, label: 'Total Units' },
    {
      key: 'available' as const,
      label: 'Available',
      render: (value: number) => (
        <Badge variant={value < 5 ? 'danger' : value < 10 ? 'warning' : 'success'}>
          {value} units
        </Badge>
      ),
    },
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
        title="Blood Inventory"
        subtitle="Manage and track blood units"
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
      title="Blood Inventory"
      subtitle="Manage and track blood units"
      userRole="Hospital Admin"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {criticalItems > 0 && (
        <Alert
          type="danger"
          title="Low Stock Alert"
          message={`${criticalItems} blood types have less than 5 units available`}
          className="mb-6"
        />
      )}

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
              setFormData({ bloodGroup: 'O+', units: 5 })
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
          <div className="grid gap-4 md:grid-cols-2">
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
            return (
              <div key={bg} className="rounded-lg border border-gray-200 p-4">
                <p className="text-2xl font-bold text-blood-600">{bg}</p>
                <p className="text-sm text-gray-600 mt-2">Available: {available}</p>
                <Badge
                  variant={available === 0 ? 'danger' : available < 5 ? 'warning' : 'success'}
                  className="mt-2"
                >
                  {available === 0 ? 'Critical' : available < 5 ? 'Low' : 'Stable'}
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
