'use client'

import { useState, useMemo } from 'react'
import { Heart, Bell, MapPin, History, AlertCircle, CheckCircle, Clock, Loader, X, Edit2, Trash2, Plus } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import { useApp } from '@/lib/AppContext'
import { useFormState, useValidation, useToast, useTable, useGenerateId } from '@/lib/hooks'
import { useAuth } from '@/lib/useAuth'

const navItems = [
  { label: 'Dashboard', href: '/hospital', icon: <Heart className="h-5 w-5" />, isActive: true },
  { label: 'Inventory', href: '/hospital/inventory', icon: <AlertCircle className="h-5 w-5" /> },
  { label: 'Requests', href: '/hospital/requests', icon: <AlertCircle className="h-5 w-5" /> },
]

interface BloodRequestFormData {
  bloodGroup: string
  units: string
  priority: string
  notes: string
}

interface InventoryFormData {
  bloodGroup: string
  available: string
  reserved: string
}

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export default function HospitalDashboard() {
  const { user } = useAuth()
  const { bloodRequests, addBloodRequest, updateBloodRequest, deleteBloodRequest, bloodInventory, addBloodInventory, updateBloodInventory } = useApp()
  const { addToast } = useToast()
  const { validate } = useValidation()
  const generateId = useGenerateId()
  const tableState = useTable()

  // Modal states
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null)
  const [showInventoryForm, setShowInventoryForm] = useState(false)
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null)

  // Request form
  const requestForm = useFormState<BloodRequestFormData>({
    bloodGroup: 'O+',
    units: '5',
    priority: 'Normal',
    notes: '',
  })

  // Inventory form
  const inventoryForm = useFormState<InventoryFormData>({
    bloodGroup: 'O+',
    available: '10',
    reserved: '0',
  })

  // Get hospital-specific data
  const hospitalId = 'hospital-001'
  const hospitalRequests = useMemo(() => {
    return bloodRequests.filter(r => r.hospitalId === hospitalId)
  }, [bloodRequests, hospitalId])

  const hospitalInventory = useMemo(() => {
    return bloodInventory.filter(inv => inv.entityId === hospitalId && inv.entityType === 'hospital')
  }, [bloodInventory, hospitalId])

  // Search and filter
  const filteredRequests = useMemo(() => {
    let filtered = hospitalRequests

    if (tableState.tableState.search) {
      filtered = filtered.filter(r =>
        r.bloodGroup.toLowerCase().includes(tableState.tableState.search.toLowerCase()) ||
        r.priority.toLowerCase().includes(tableState.tableState.search.toLowerCase())
      )
    }

    // Sort
    if (tableState.tableState.sortBy) {
      const key = tableState.tableState.sortBy as keyof typeof filtered[0]
      filtered.sort((a, b) => {
        const aVal = a[key]
        const bVal = b[key]
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return tableState.tableState.sortOrder === 'asc' ? cmp : -cmp
      })
    }

    return filtered
  }, [hospitalRequests, tableState.tableState])

  // Submit blood request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    requestForm.setIsSubmitting(true)

    const rules = {
      bloodGroup: { required: true },
      units: { required: true, pattern: /^\d+$/ },
      priority: { required: true },
    }

    const errors = validate(requestForm.values, rules)
    if (Object.keys(errors).length > 0) {
      requestForm.setErrors(errors)
      requestForm.setIsSubmitting(false)
      addToast('Please fill all required fields', 'error')
      return
    }

    try {
      if (editingRequestId) {
        updateBloodRequest(editingRequestId, {
          bloodGroup: requestForm.values.bloodGroup,
          unitsNeeded: parseInt(requestForm.values.units),
          priority: requestForm.values.priority as 'Normal' | 'High' | 'Critical',
          updatedAt: new Date().toISOString(),
        })
        addToast('Blood request updated successfully', 'success')
        setEditingRequestId(null)
      } else {
        addBloodRequest({
          id: generateId('req'),
          hospitalId,
          bloodGroup: requestForm.values.bloodGroup,
          unitsNeeded: parseInt(requestForm.values.units),
          priority: requestForm.values.priority as 'Normal' | 'High' | 'Critical',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        addToast('Blood request created successfully', 'success')
      }

      requestForm.resetForm()
      setShowRequestForm(false)
    } finally {
      requestForm.setIsSubmitting(false)
    }
  }

  // Edit request
  const handleEditRequest = (id: string) => {
    const request = hospitalRequests.find(r => r.id === id)
    if (request) {
      requestForm.setFieldValue('bloodGroup', request.bloodGroup)
      requestForm.setFieldValue('units', request.unitsNeeded.toString())
      requestForm.setFieldValue('priority', request.priority)
      setEditingRequestId(id)
      setShowRequestForm(true)
    }
  }

  // Delete request
  const handleDeleteRequest = (id: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      deleteBloodRequest(id)
      addToast('Blood request deleted successfully', 'success')
    }
  }

  // Update inventory
  const handleUpdateInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    inventoryForm.setIsSubmitting(true)

    try {
      const rules = {
        available: { required: true, pattern: /^\d+$/ },
        reserved: { required: true, pattern: /^\d+$/ },
      }

      const errors = validate(inventoryForm.values, rules)
      if (Object.keys(errors).length > 0) {
        inventoryForm.setErrors(errors)
        inventoryForm.setIsSubmitting(false)
        addToast('Please fill all required fields', 'error')
        return
      }

      if (editingInventoryId) {
        updateBloodInventory(editingInventoryId, {
          available: parseInt(inventoryForm.values.available),
          reserved: parseInt(inventoryForm.values.reserved),
        })
        addToast('Inventory updated successfully', 'success')
        setEditingInventoryId(null)
      }

      inventoryForm.resetForm()
      setShowInventoryForm(false)
    } finally {
      inventoryForm.setIsSubmitting(false)
    }
  }

  // Edit inventory
  const handleEditInventory = (id: string) => {
    const inv = hospitalInventory.find(i => i.id === id)
    if (inv) {
      inventoryForm.setFieldValue('bloodGroup', inv.bloodGroup)
      inventoryForm.setFieldValue('available', inv.available.toString())
      inventoryForm.setFieldValue('reserved', inv.reserved.toString())
      setEditingInventoryId(id)
      setShowInventoryForm(true)
    }
  }

  // Stats
  const totalInventory = hospitalInventory.reduce((sum, inv) => sum + inv.available, 0)
  const totalReserved = hospitalInventory.reduce((sum, inv) => sum + inv.reserved, 0)
  const pendingRequests = hospitalRequests.filter(r => r.status === 'Pending').length

  return (
    <DashboardLayout
      title="Hospital Blood Management"
      subtitle="Manage blood inventory and requests"
      userRole="Hospital Admin"
      navItems={navItems}
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Total Inventory"
          value={totalInventory}
          unit="units"
          icon={<Heart className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Reserved Units"
          value={totalReserved}
          unit="units"
          icon={<AlertCircle className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests}
          icon={<Clock className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Available"
          value={totalInventory - totalReserved}
          unit="units"
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Blood Requests Section */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Blood Requests</h2>
          <Button
            onClick={() => {
              requestForm.resetForm()
              setEditingRequestId(null)
              setShowRequestForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Raise Request
          </Button>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingRequestId ? 'Edit Blood Request' : 'Raise Blood Request'}
              </h3>
              <button
                onClick={() => {
                  setShowRequestForm(false)
                  requestForm.resetForm()
                  setEditingRequestId(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={requestForm.values.bloodGroup}
                  onChange={requestForm.handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blood-600 focus:outline-none"
                >
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                {requestForm.errors.bloodGroup && (
                  <p className="mt-1 text-sm text-red-600">{requestForm.errors.bloodGroup}</p>
                )}
              </div>

              {/* Units */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Units Needed</label>
                <input
                  type="number"
                  name="units"
                  min="1"
                  max="100"
                  value={requestForm.values.units}
                  onChange={requestForm.handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blood-600 focus:outline-none"
                  placeholder="Enter number of units"
                />
                {requestForm.errors.units && (
                  <p className="mt-1 text-sm text-red-600">{requestForm.errors.units}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={requestForm.values.priority}
                  onChange={requestForm.handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blood-600 focus:outline-none"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                {requestForm.errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{requestForm.errors.priority}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={requestForm.values.notes}
                  onChange={requestForm.handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blood-600 focus:outline-none"
                  placeholder="Add any additional notes"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={requestForm.isSubmitting}
                  className="flex-1"
                >
                  {requestForm.isSubmitting ? 'Saving...' : editingRequestId ? 'Update Request' : 'Create Request'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowRequestForm(false)
                    requestForm.resetForm()
                    setEditingRequestId(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Requests Table */}
        <Card>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by blood group or priority..."
              value={tableState.tableState.search}
              onChange={(e) => tableState.setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer" onClick={() => tableState.setSort('bloodGroup')}>
                    Blood Group
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer" onClick={() => tableState.setSort('unitsNeeded')}>
                    Units
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer" onClick={() => tableState.setSort('priority')}>
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer" onClick={() => tableState.setSort('status')}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Created</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(request => (
                    <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{request.bloodGroup}</td>
                      <td className="px-4 py-3 text-gray-600">{request.unitsNeeded}</td>
                      <td className="px-4 py-3">
                        <Badge variant={request.priority === 'Critical' ? 'danger' : request.priority === 'High' ? 'warning' : 'info'}>
                          {request.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={request.status === 'Fulfilled' ? 'success' : request.status === 'Cancelled' ? 'danger' : 'warning'}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRequest(request.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Blood Inventory Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Blood Inventory</h2>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Blood Group</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Total Units</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Available</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Reserved</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitalInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No inventory data
                    </td>
                  </tr>
                ) : (
                  hospitalInventory.map(inv => (
                    <tr key={inv.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{inv.bloodGroup}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.total}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.available}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.reserved}</td>
                      <td className="px-4 py-3">
                        <Badge variant={inv.available < 5 ? 'danger' : inv.available < 10 ? 'warning' : 'success'}>
                          {inv.available < 5 ? 'Critical' : inv.available < 10 ? 'Low' : 'Healthy'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEditInventory(inv.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
