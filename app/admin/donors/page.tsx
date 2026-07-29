'use client'

import { useState, useEffect, useMemo } from 'react'
import { Activity, Users, Trash2, Edit2, Loader, Plus, Search, Heart, MapPin, Phone } from 'lucide-react'
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
  { label: 'Hospitals', href: '/admin/hospitals', icon: <Users className="h-5 w-5" /> },
  { label: 'Blood Banks', href: '/admin/blood-banks', icon: <Users className="h-5 w-5" /> },
  { label: 'Donors', href: '/admin/donors', icon: <Users className="h-5 w-5" />, isActive: true },
  { label: 'Analytics', href: '/admin/analytics', icon: <Activity className="h-5 w-5" /> },
]

interface Donor {
  id: string
  _id?: string
  name: string
  bloodGroup: string
  city?: string
  phone?: string
  email?: string
  age?: number
  availabilityStatus?: string
  lastDonationDate?: string
  status?: string
}

export default function AdminDonors() {
  const { user } = useAuth()
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBloodGroup, setFilterBloodGroup] = useState('all')
  const [filterAvailability, setFilterAvailability] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'O+',
    city: '',
    phone: '',
    email: '',
    age: ''
  })

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getDonors({ limit: 100 })
      setDonors(result.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load donors')
    } finally {
      setLoading(false)
    }
  }

  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donor.email && donor.email.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesBloodGroup = filterBloodGroup === 'all' || donor.bloodGroup === filterBloodGroup
      const matchesAvailability = filterAvailability === 'all' || donor.availabilityStatus === filterAvailability
      return matchesSearch && matchesBloodGroup && matchesAvailability
    })
  }, [donors, searchTerm, filterBloodGroup, filterAvailability])

  const handleAddOrUpdate = async () => {
    try {
      if (editingId) {
        await apiClient.updateDonor(editingId, formData)
      } else {
        await apiClient.createDonor(formData)
      }
      setShowAddForm(false)
      setEditingId(null)
      setFormData({ name: '', bloodGroup: 'O+', city: '', phone: '', email: '', age: '' })
      await fetchDonors()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save donor')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        await apiClient.deleteDonor(id)
        await fetchDonors()
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete donor')
      }
    }
  }

  const handleEdit = (donor: Donor) => {
    setEditingId(donor.id || donor._id || '')
    setFormData({
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      city: donor.city || '',
      phone: donor.phone || '',
      email: donor.email || '',
      age: donor.age ? String(donor.age) : ''
    })
    setShowAddForm(true)
  }

  const handleToggleAvailability = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available'
      await apiClient.updateDonorAvailability(id, newStatus)
      await fetchDonors()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update availability')
    }
  }

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

  const availableDonors = filteredDonors.filter(d => d.availabilityStatus === 'Available').length
  const unavailableDonors = filteredDonors.filter(d => d.availabilityStatus === 'Unavailable').length

  const columns = [
    { key: 'name' as const, label: 'Donor Name' },
    { key: 'bloodGroup' as const, label: 'Blood Group' },
    {
      key: 'city' as const,
      label: 'City',
      render: (value?: string) => <span>{value || 'N/A'}</span>
    },
    { key: 'phone' as const, label: 'Phone' },
    {
      key: 'availabilityStatus' as const,
      label: 'Availability',
      render: (value?: string) => (
        <Badge variant={value === 'Available' ? 'success' : 'warning'}>
          {value || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string, row: Donor) => (
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant={row.availabilityStatus === 'Available' ? 'secondary' : 'primary'}
            onClick={() => handleToggleAvailability(value || row._id || '', row.availabilityStatus || 'Available')}
            className="flex items-center gap-1 text-xs"
          >
            {row.availabilityStatus === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(row)}
            className="flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
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
        title="Donor Management"
        subtitle="Manage registered donors"
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
      title="Donor Management"
      subtitle="Manage registered donors"
      userRole="System Administrator"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blood-600" />
            <div>
              <p className="text-sm text-gray-600">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900">{filteredDonors.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{availableDonors}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">Unavailable</p>
              <p className="text-2xl font-bold text-gray-900">{unavailableDonors}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Donors</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Availability</label>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingId(null)
              setFormData({ name: '', bloodGroup: 'O+', city: '', phone: '', email: '', age: '' })
              setShowAddForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Donor
          </Button>
        </div>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Donor' : 'Add New Donor'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Donor Name *</label>
              <input
                type="text"
                placeholder="Donor name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                min="18"
                max="65"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
            <div>
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

      {/* Donors Table */}
      <Card>
        <Table
          title="Registered Donors"
          columns={columns}
          data={filteredDonors}
        />
      </Card>
    </DashboardLayout>
  )
}
