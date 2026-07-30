'use client'

import { useState, useMemo } from 'react'
import { Droplets, Plus, Edit2, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { useApp } from '@/lib/AppContext'
import { useFormState, useValidation, useToast, useTable, useGenerateId } from '@/lib/hooks'

const navItems = [
  { label: 'Dashboard', href: '/blood-bank', icon: <Droplets className="h-5 w-5" />, isActive: true },
  { label: 'Inventory', href: '/blood-bank/inventory', icon: <AlertCircle className="h-5 w-5" /> },
  { label: 'Donations', href: '/blood-bank/donations', icon: <Droplets className="h-5 w-5" /> },
  { label: 'Transfers', href: '/blood-bank/transfers', icon: <Droplets className="h-5 w-5" /> },
]

interface BloodStockFormData {
  bloodGroup: string
  units: string
  collectionDate: string
  expiryDate: string
}

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export default function BloodBankDashboard() {
  const { bloodInventory, addBloodInventory, updateBloodInventory, deleteBloodInventory, bloodRequests, updateBloodRequest } = useApp()
  const { addToast } = useToast()
  const { validate } = useValidation()
  const generateId = useGenerateId()
  const tableState = useTable()

  const [showStockForm, setShowStockForm] = useState(false)
  const [editingStockId, setEditingStockId] = useState<string | null>(null)

  const bloodBankId = 'bank-001'

  const stockForm = useFormState<BloodStockFormData>({
    bloodGroup: 'O+',
    units: '10',
    collectionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  // Get blood bank specific data
  const bankInventory = useMemo(() => {
    return bloodInventory.filter(inv => inv.entityId === bloodBankId && inv.entityType === 'bloodbank')
  }, [bloodInventory, bloodBankId])

  const bankRequests = useMemo(() => {
    return bloodRequests.filter(r => r.status === 'Pending')
  }, [bloodRequests])

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    let filtered = bankInventory

    if (tableState.tableState.search) {
      filtered = filtered.filter(inv =>
        inv.bloodGroup.toLowerCase().includes(tableState.tableState.search.toLowerCase())
      )
    }

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
  }, [bankInventory, tableState.tableState])

  // Submit stock
  const handleSubmitStock = async (e: React.FormEvent) => {
    e.preventDefault()
    stockForm.setIsSubmitting(true)

    const rules = {
      bloodGroup: { required: true },
      units: { required: true, pattern: /^\d+$/ },
      expiryDate: { required: true },
    }

    const errors = validate(stockForm.values, rules)
    if (Object.keys(errors).length > 0) {
      stockForm.setErrors(errors)
      stockForm.setIsSubmitting(false)
      addToast('Please fill all required fields', 'error')
      return
    }

    try {
      if (editingStockId) {
        updateBloodInventory(editingStockId, {
          bloodGroup: stockForm.values.bloodGroup,
          available: parseInt(stockForm.values.units),
          expiryDate: stockForm.values.expiryDate,
        })
        addToast('Blood stock updated successfully', 'success')
        setEditingStockId(null)
      } else {
        addBloodInventory({
          id: generateId('stock'),
          bloodGroup: stockForm.values.bloodGroup,
          total: parseInt(stockForm.values.units),
          available: parseInt(stockForm.values.units),
          reserved: 0,
          expiring: 0,
          expiryDate: stockForm.values.expiryDate,
          entityId: bloodBankId,
          entityType: 'bloodbank',
        })
        addToast('Blood stock added successfully', 'success')
      }

      stockForm.resetForm()
      setShowStockForm(false)
    } finally {
      stockForm.setIsSubmitting(false)
    }
  }

  const handleEditStock = (id: string) => {
    const stock = bankInventory.find(s => s.id === id)
    if (stock) {
      stockForm.setFieldValue('bloodGroup', stock.bloodGroup)
      stockForm.setFieldValue('units', stock.available.toString())
      stockForm.setFieldValue('expiryDate', stock.expiryDate || '')
      setEditingStockId(id)
      setShowStockForm(true)
    }
  }

  const handleDeleteStock = (id: string) => {
    if (confirm('Are you sure you want to delete this stock?')) {
      deleteBloodInventory(id)
      addToast('Blood stock deleted successfully', 'success')
    }
  }

  const handleApproveRequest = (requestId: string) => {
    updateBloodRequest(requestId, { status: 'Fulfilled' })
    addToast('Request approved and fulfilled', 'success')
  }

  const handleRejectRequest = (requestId: string) => {
    updateBloodRequest(requestId, { status: 'Cancelled' })
    addToast('Request rejected', 'success')
  }

  // Stats
  const totalUnits = bankInventory.reduce((sum, inv) => sum + inv.available, 0)
  const criticalCount = bankInventory.filter(inv => inv.available < 5).length
  const totalBloodGroups = bankInventory.length

  return (
    <DashboardLayout
      title="Blood Bank Management"
      subtitle="Manage blood inventory and fulfill requests"
      userRole="Blood Bank Admin"
      navItems={navItems}
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Total Units"
          value={totalUnits}
          icon={<Droplets className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Blood Groups"
          value={totalBloodGroups}
          icon={<AlertCircle className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Critical Stock"
          value={criticalCount}
          icon={<AlertCircle className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          label="Pending Requests"
          value={bankRequests.length}
          icon={<CheckCircle className="h-6 w-6" />}
          color="amber"
        />
      </div>

      {/* Blood Stock Section */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Blood Inventory</h2>
          <Button
            onClick={() => {
              stockForm.resetForm()
              setEditingStockId(null)
              setShowStockForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Blood Stock
          </Button>
        </div>

        {showStockForm && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingStockId ? 'Edit Blood Stock' : 'Add Blood Stock'}
              </h3>
              <button
                onClick={() => {
                  setShowStockForm(false)
                  stockForm.resetForm()
                  setEditingStockId(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={stockForm.values.bloodGroup}
                    onChange={stockForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Units</label>
                  <input
                    type="number"
                    name="units"
                    min="1"
                    value={stockForm.values.units}
                    onChange={stockForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Number of units"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Collection Date</label>
                  <input
                    type="date"
                    name="collectionDate"
                    value={stockForm.values.collectionDate}
                    onChange={stockForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={stockForm.values.expiryDate}
                    onChange={stockForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={stockForm.isSubmitting}
                  className="flex-1"
                >
                  {stockForm.isSubmitting ? 'Saving...' : editingStockId ? 'Update Stock' : 'Add Stock'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowStockForm(false)
                    stockForm.resetForm()
                    setEditingStockId(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Inventory Table */}
        <Card>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by blood group..."
              value={tableState.tableState.search}
              onChange={(e) => tableState.setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Blood Group</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Available</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Reserved</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Expiry Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No inventory
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map(inv => (
                    <tr key={inv.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{inv.bloodGroup}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.available}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.reserved}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{inv.expiryDate}</td>
                      <td className="px-4 py-3">
                        <Badge variant={inv.available < 5 ? 'danger' : inv.available < 10 ? 'warning' : 'success'}>
                          {inv.available < 5 ? 'Critical' : inv.available < 10 ? 'Low' : 'Healthy'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditStock(inv.id)} className="text-blue-600 hover:text-blue-800">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteStock(inv.id)} className="text-red-600 hover:text-red-800">
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

      {/* Pending Requests Section */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Pending Requests</h2>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Blood Group</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Units Needed</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bankRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No pending requests
                    </td>
                  </tr>
                ) : (
                  bankRequests.map(request => (
                    <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{request.bloodGroup}</td>
                      <td className="px-4 py-3 text-gray-600">{request.unitsNeeded}</td>
                      <td className="px-4 py-3">
                        <Badge variant={request.priority === 'Critical' ? 'danger' : request.priority === 'High' ? 'warning' : 'info'}>
                          {request.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="warning">{request.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
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
    </DashboardLayout>
  )
}
