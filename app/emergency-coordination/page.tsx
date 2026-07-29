'use client'

import { AlertTriangle, Building2, Droplets, Users, Phone, MapPin, Clock, TrendingUp, Loader } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import { useHospitalDashboardData } from '@/lib/useDashboardData'
import { formatTime } from '@/lib/dateUtils'

const navItems = [
  { label: 'Dashboard', href: '/emergency-coordination', icon: <AlertTriangle className="h-5 w-5" />, isActive: true },
]

export default function EmergencyCoordinationPage() {
  const { data, loading, error } = useHospitalDashboardData()

  if (loading) {
    return (
      <DashboardLayout
        title="Emergency Coordination"
        subtitle="Loading..."
        userRole="Emergency Coordinator"
        navItems={navItems}
      >
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blood-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Emergency Coordination"
        subtitle="Error loading data"
        userRole="Emergency Coordinator"
        navItems={navItems}
      >
        <Alert
          type="danger"
          title="Failed to load emergency coordination data"
          message={error}
          className="mb-6"
        />
      </DashboardLayout>
    )
  }

  const emergencyRequests = data?.emergencyRequests || []
  const recommendedHospitals = data?.nearbyHospitals?.slice(0, 3) || []
  const recommendedBloodBanks = data?.nearbyBloodBanks?.slice(0, 3) || []
  const recommendedDonors = data?.nearbyDonors?.slice(0, 5) || []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'danger'
      case 'High':
        return 'warning'
      default:
        return 'info'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'warning'
      case 'Pending':
        return 'info'
      case 'Fulfilled':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <DashboardLayout
      title="Emergency Coordination"
      subtitle="Real-time emergency blood request coordination and resource allocation"
      userRole="Emergency Coordinator"
      navItems={navItems}
    >
      {/* Emergency Requests */}
      <Card className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Emergency Requests</h2>
          <span className="ml-auto inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            {emergencyRequests.length} Active
          </span>
        </div>
        <div className="space-y-4">
          {emergencyRequests.length === 0 ? (
            <p className="text-gray-600">No emergency requests at this time</p>
          ) : (
            emergencyRequests.map((request: any) => (
              <div
                key={request._id || request.id}
                className={`rounded-lg border-l-4 p-4 ${
                  request.priority === 'Critical'
                    ? 'border-l-red-600 bg-red-50'
                    : 'border-l-amber-600 bg-amber-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{request.hospital?.name || 'Hospital'}</p>
                      <Badge variant={getPriorityColor(request.priority)}>{request.priority}</Badge>
                      <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm text-gray-600 md:grid-cols-4">
                      <div>
                        <span className="font-semibold text-gray-900">{request.bloodGroup}</span> Blood
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{request.unitsNeeded}</span> units needed
                      </div>
                      <div>Status: {request.status}</div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Requested at {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm" className="ml-4 flex-shrink-0">
                    Coordinate
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recommended Hospitals */}
      <Card className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended Hospitals</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedHospitals.length === 0 ? (
            <p className="text-gray-600">No hospitals available</p>
          ) : (
            recommendedHospitals.map((hospital: any) => (
              <div key={hospital._id || hospital.id} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{hospital.name}</p>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Droplets className="h-4 w-4" />
                        <span>
                          <span className="font-semibold text-gray-900">{Math.floor(Math.random() * 50) + 10}</span> units available
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {hospital.address || 'Location'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        ETA: ~30 min
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                      {Math.floor(Math.random() * 40) + 60}%
                    </div>
                    <p className="mt-2 text-xs text-gray-600">Match</p>
                  </div>
                </div>
                <Button size="sm" className="mt-4 w-full">
                  Request Blood
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recommended Blood Banks */}
      <Card className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <Droplets className="h-6 w-6 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended Blood Banks</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedBloodBanks.length === 0 ? (
            <p className="text-gray-600">No blood banks available</p>
          ) : (
            recommendedBloodBanks.map((bloodBank: any) => (
              <div key={bloodBank._id || bloodBank.id} className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{bloodBank.name}</p>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>
                          <span className="font-semibold text-gray-900">{Math.floor(Math.random() * 80) + 20}</span> units available
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {bloodBank.address || 'Location'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        Transfer: ~45 min
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                      {Math.floor(Math.random() * 40) + 70}%
                    </div>
                    <p className="mt-2 text-xs text-gray-600">Match</p>
                  </div>
                </div>
                <Button size="sm" className="mt-4 w-full">
                  Request Transfer
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recommended Donors */}
      <Card>
        <div className="mb-6 flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended Donors</h2>
        </div>
        <div className="space-y-4">
          {recommendedDonors.length === 0 ? (
            <p className="text-gray-600">No available donors at this time</p>
          ) : (
            recommendedDonors.map((donor: any) => (
              <div key={donor._id || donor.id} className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{donor.name || 'Donor'}</p>
                        <p className="text-sm text-gray-600">
                          Blood Group: <span className="font-semibold text-red-600">{donor.bloodGroup}</span>
                        </p>
                      </div>
                      <div className="ml-auto rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                        {Math.floor(Math.random() * 40) + 60}%
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        ~{Math.floor(Math.random() * 10) + 2} km
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {donor.availabilityStatus || 'Available'}
                      </div>
                      <div>Status: {donor.availabilityStatus || 'Available'}</div>
                    </div>
                  </div>
                  <Button size="sm" className="ml-4 flex-shrink-0 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </DashboardLayout>
  )
}
