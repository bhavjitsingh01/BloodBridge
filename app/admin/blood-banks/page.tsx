'use client'

import { useState, useEffect, useMemo } from 'react'
import { Activity, Building2, Users, Trash2, Edit2, Loader, Plus, Search, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <Activity className="h-5 w-5" /> },
  { label: 'Hospitals', href: '/admin/hospitals', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Blood Banks', href: '/admin/blood-banks', icon: <Building2 className="h-5 w-5" />, isActive: true },
  { label: 'Donors', href: '/admin/donors', icon: <Users className="h-5 w-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <Activity className="h-5 w-5" /> },
]

interface BloodBank {
  id: string
  _id?: string
  name: string
  city?: string
  address?: string
  phone?: string
  email?: string
  status?: string
  location?: string
}

export default function AdminBloodBanks() {
  const { user } = useAuth()
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    fetchBloodBanks()
  }, [])

  const fetchBloodBanks = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getBloodBanks({ limit: 100 })
      setBloodBanks(result.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load blood banks')
    } finally {
      setLoading(false)
    }
  }

  const filteredBloodBanks = useMemo(() => {
    return bloodBanks.filter(bank => {
      const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bank.city && bank.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bank.address && bank.address.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesSearch
    })
  }, [bloodBanks, searchTerm])

  const handleAddOrUpdate = async () => {
    try {
      if (editingId) {
        await apiClient.updateBloodBank(editingId, formData)
      } else {
        await apiClient.createBloodBank(formData)
      }
      setShowAddForm(false)
      setEditingId(null)
      setFormData({ name: '', city: '', address: '', phone: '', email: '' })
      await fetchBloodBanks()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save blood bank')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blood bank?')) {
      try {
        await apiClient.deleteBloodBank(id)
        await fetchBloodBanks()
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete blood bank')
      }
    }
  }

  const handleEdit = (bank: BloodBank) => {
    setEditingId(bank.id || bank._id || '')
    setFormData({
      name: bank.name,
      city: bank.city || '',
      address: bank.address || bank.location || '',
      phone: bank.phone || '',
      email: bank.email || ''
    })
    setShowAddForm(true)
  }

  const columns = [
    { key: 'name' as const, label: 'Blood Bank Name' },
    {
      key: 'city' as const,
      label: 'City',
      render: (value?: string) => <span>{value || 'N/A'}</span>
    },
    {
      key: 'address' as const,
      label: 'Address',
      render: (value?: string) => <span className="text-sm text-gray-600">{value || 'N/A'}</span>
    },
    {
      key: 'phone' as const,
      label: 'Phone',
      render: (value?: string) => <span>{value || 'N/A'}</span>
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value?: string) => (
        <Badge variant={value === 'active' ? 'success' : 'warning'}>
          {value || 'Active'}
        </Badge>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string, row: BloodBank) => (
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
        title="Blood Bank Management"
        subtitle="Manage and verify blood banks"
        userRole="System Administrator"
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
      title="Blood Bank Management"
      subtitle="Manage and verify blood banks"
      userRole="System Administrator"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {/* Summary Card */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Blood Banks</p>
              <p className="text-2xl font-bold text-gray-900">{filteredBloodBanks.length}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingId(null)
              setFormData({ name: '', city: '', address: '', phone: '', email: '' })
              setShowAddForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Blood Bank
          </Button>
        </div>
      </Card>

      {/* Search */}
      <Card className="mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Blood Banks</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
        </div>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Blood Bank' : 'Add New Blood Bank'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Bank Name *</label>
              <input
                type="text"
                placeholder="Blood bank name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

      {/* Blood Banks Table */}
      <Card>
        <Table
          title="Registered Blood Banks"
          columns={columns}
          data={filteredBloodBanks}
        />
      </Card>
    </DashboardLayout>
  )
}
