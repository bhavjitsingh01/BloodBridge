'use client'

import { useState, useMemo } from 'react'
import { AlertCircle, Plus, Clock, CheckCircle, Zap, X, Edit2 } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { useApp } from '@/lib/AppContext'
import { useFormState, useValidation, useToast, useGenerateId } from '@/lib/hooks'

interface EmergencyFormData {
  bloodGroup: string
  unitsNeeded: string
  priority: string
  hospitalId: string
  patientInfo: string
}

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const hospitals = ['City Hospital', 'Apollo Hospital', 'Max Hospital', 'Fortis Hospital']

export default function EmergencyCoordinationPage() {
  const { emergencyRequests, addEmergencyRequest, updateEmergencyRequest } = useApp()
  const { bloodBanks } = useApp()
  const { addToast } = useToast()
  const { validate } = useValidation()
  const generateId = useGenerateId()

  const [showEmergencyForm, setShowEmergencyForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const emergencyForm = useFormState<EmergencyFormData>({
    bloodGroup: 'O+',
    unitsNeeded: '10',
    priority: 'Critical',
    hospitalId: 'hospital-001',
    patientInfo: '',
  })

  // Get pending emergencies
  const pendingEmergencies = useMemo(() => {
    return emergencyRequests.filter(r => r.status === 'Pending').sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [emergencyRequests])

  // Handle emergency creation
  const handleCreateEmergency = async (e: React.FormEvent) => {
    e.preventDefault()
    emergencyForm.setIsSubmitting(true)

    const rules = {
      bloodGroup: { required: true },
      unitsNeeded: { required: true, pattern: /^\d+$/ },
      priority: { required: true },
      patientInfo: { required: true },
    }

    const errors = validate(emergencyForm.values, rules)
    if (Object.keys(errors).length > 0) {
      emergencyForm.setErrors(errors)
      emergencyForm.setIsSubmitting(false)
      addToast('Please fill all required fields', 'error')
      return
    }

    try {
      if (editingId) {
        updateEmergencyRequest(editingId, {
          bloodGroup: emergencyForm.values.bloodGroup,
          unitsNeeded: parseInt(emergencyForm.values.unitsNeeded),
          priority: emergencyForm.values.priority as 'Critical',
        })
        addToast('Emergency request updated', 'success')
        setEditingId(null)
      } else {
        addEmergencyRequest({
          id: generateId('emg'),
          hospitalId: emergencyForm.values.hospitalId,
          bloodGroup: emergencyForm.values.bloodGroup,
          unitsNeeded: parseInt(emergencyForm.values.unitsNeeded),
          priority: 'Critical',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        addToast('Emergency request created', 'success')
      }

      emergencyForm.resetForm()
      setShowEmergencyForm(false)
    } finally {
      emergencyForm.setIsSubmitting(false)
    }
  }

  // Handle resolution
  const handleResolveEmergency = (id: string) => {
    updateEmergencyRequest(id, { status: 'Fulfilled' })
    addToast('Emergency resolved', 'success')
  }

  // Stats
  const activeEmergencies = pendingEmergencies.length
  const avgResolutionTime = '15 mins'

  return (
    <DashboardLayout
      title="Emergency Blood Coordination"
      subtitle="Real-time emergency blood request management"
      userRole="Emergency Coordinator"
      navItems={[
        { label: 'Dashboard', href: '/emergency-coordination', icon: <AlertCircle className="h-5 w-5" />, isActive: true },
      ]}
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Active Emergencies"
          value={activeEmergencies}
          icon={<AlertCircle className="h-6 w-6" />}
          color="red"
          trend={{ value: activeEmergencies > 0 ? 1 : 0, direction: 'down' }}
        />
        <StatCard
          label="Response Time"
          value={avgResolutionTime}
          icon={<Clock className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Blood Banks Available"
          value={bloodBanks.length}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          label="Hospitals Served"
          value={hospitals.length}
          icon={<Zap className="h-6 w-6" />}
          color="amber"
        />
      </div>

      {/* Emergency Form */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Emergency Requests</h2>
          <Button
            onClick={() => {
              emergencyForm.resetForm()
              setEditingId(null)
              setShowEmergencyForm(true)
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Create Emergency Alert
          </Button>
        </div>

        {showEmergencyForm && (
          <Card className="mb-6 border-2 border-red-200 bg-red-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-900">Create Emergency Blood Request</h3>
              <button
                onClick={() => {
                  setShowEmergencyForm(false)
                  emergencyForm.resetForm()
                  setEditingId(null)
                }}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmergency} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group (URGENT)</label>
                  <select
                    name="bloodGroup"
                    value={emergencyForm.values.bloodGroup}
                    onChange={emergencyForm.handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-red-300 px-3 py-2 focus:border-red-600"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Units Needed (STAT)</label>
                  <input
                    type="number"
                    name="unitsNeeded"
                    min="1"
                    value={emergencyForm.values.unitsNeeded}
                    onChange={emergencyForm.handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-red-300 px-3 py-2"
                    placeholder="Units needed"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Hospital</label>
                  <select
                    name="hospitalId"
                    value={emergencyForm.values.hospitalId}
                    onChange={emergencyForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="hospital-001">City Hospital</option>
                    <option value="hospital-002">Apollo Hospital</option>
                    <option value="hospital-003">Max Hospital</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Patient Information</label>
                  <textarea
                    name="patientInfo"
                    value={emergencyForm.values.patientInfo}
                    onChange={emergencyForm.handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Patient details, condition, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={emergencyForm.isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {emergencyForm.isSubmitting ? 'Creating...' : 'Create Emergency Request'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEmergencyForm(false)
                    emergencyForm.resetForm()
                    setEditingId(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Pending Emergencies Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-red-200 bg-red-50">
                  <th className="px-4 py-3 text-left font-bold text-red-900">⚠️ STAT</th>
                  <th className="px-4 py-3 text-left font-bold text-red-900">Blood Group</th>
                  <th className="px-4 py-3 text-left font-bold text-red-900">Units</th>
                  <th className="px-4 py-3 text-left font-bold text-red-900">Created</th>
                  <th className="px-4 py-3 text-left font-bold text-red-900">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-red-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEmergencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No active emergencies
                    </td>
                  </tr>
                ) : (
                  pendingEmergencies.map(req => (
                    <tr key={req.id} className="border-b border-red-100 bg-red-50 hover:bg-red-100">
                      <td className="px-4 py-3 font-bold text-red-600">🚨</td>
                      <td className="px-4 py-3 text-lg font-bold text-red-900">{req.bloodGroup}</td>
                      <td className="px-4 py-3 font-bold text-red-700">{req.unitsNeeded} units</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {new Date(req.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="danger">{req.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleResolveEmergency(req.id)}
                          className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1 text-white hover:bg-green-700 font-medium"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Resolve
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

      {/* Available Resources */}
      <div className="grid grid-cols-2 gap-8">
        {/* Blood Banks */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-gray-900">Available Blood Banks</h3>
          <div className="space-y-2">
            {bloodBanks.slice(0, 5).map(bank => (
              <Card key={bank.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{bank.name}</p>
                    <p className="text-xs text-gray-600">{bank.city}</p>
                  </div>
                  <Badge variant="success">Ready</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Response Teams */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-gray-900">Response Teams</h3>
          <div className="space-y-2">
            {['Team A - Delhi', 'Team B - South Delhi', 'Team C - Gurgaon', 'Team D - Noida', 'Team E - On Standby'].map(team => (
              <Card key={team} className="p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{team}</p>
                  <Badge variant={team.includes('Standby') ? 'warning' : 'success'}>
                    {team.includes('Standby') ? 'Standby' : 'Active'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
