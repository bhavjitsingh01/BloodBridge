'use client'

import { AlertTriangle, Building2, Droplets, Users, Phone, MapPin, Clock, TrendingUp } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { mockEmergencyCoordinationData } from '@/lib/mockData'
import { formatTime } from '@/lib/dateUtils'

const navItems = [
  { label: 'Dashboard', href: '/emergency-coordination', icon: <AlertTriangle className="h-5 w-5" />, isActive: true },
]

export default function EmergencyCoordinationPage() {
  const { emergencyRequests, recommendedHospitals, recommendedBloodBanks, recommendedDonors } =
    mockEmergencyCoordinationData

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
          {emergencyRequests.map((request) => (
            <div
              key={request.id}
              className={`rounded-lg border-l-4 p-4 ${
                request.priority === 'Critical'
                  ? 'border-l-red-600 bg-red-50'
                  : 'border-l-amber-600 bg-amber-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">{request.hospital}</p>
                    <Badge variant={getPriorityColor(request.priority)}>{request.priority}</Badge>
                    <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
                  </div>
                  <div className="mt-2 grid gap-2 text-sm text-gray-600 md:grid-cols-4">
                    <div>
                      <span className="font-semibold text-gray-900">{request.bloodGroup}</span> Blood
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{request.units}</span> units needed
                    </div>
                    <div>Patient: {request.patientName}, {request.patientAge} yrs</div>
                    <div>Condition: {request.condition}</div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Requested at {formatTime(request.createdAt)}
                  </div>
                </div>
                <Button size="sm" className="ml-4 flex-shrink-0">
                  Coordinate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Hospitals */}
      <Card className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended Hospitals</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedHospitals.map((hospital) => (
            <div key={hospital.id} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{hospital.name}</p>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Droplets className="h-4 w-4" />
                      <span>
                        <span className="font-semibold text-gray-900">{hospital.available}</span> units of{' '}
                        <span className="font-semibold text-red-600">{hospital.bloodGroup}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {hospital.distance}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      ETA: {hospital.eta}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                    {hospital.matchScore}%
                  </div>
                  <p className="mt-2 text-xs text-gray-600">Match</p>
                </div>
              </div>
              <Button size="sm" className="mt-4 w-full">
                Request Blood
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Blood Banks */}
      <Card className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <Droplets className="h-6 w-6 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended Blood Banks</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedBloodBanks.map((bloodBank) => (
            <div key={bloodBank.id} className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{bloodBank.name}</p>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        <span className="font-semibold text-gray-900">{bloodBank.available}</span> units of{' '}
                        <span className="font-semibold text-red-600">{bloodBank.bloodGroup}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {bloodBank.distance}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      Transfer: {bloodBank.transferTime}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    {bloodBank.matchScore}%
                  </div>
                  <p className="mt-2 text-xs text-gray-600">Match</p>
                </div>
              </div>
              <Button size="sm" className="mt-4 w-full">
                Request Transfer
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Donors */}
      <Card>
        <div className="mb-6 flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended Donors</h2>
        </div>
        <div className="space-y-4">
          {recommendedDonors.map((donor) => (
            <div key={donor.id} className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{donor.name}</p>
                      <p className="text-sm text-gray-600">
                        Blood Group: <span className="font-semibold text-red-600">{donor.bloodGroup}</span>
                      </p>
                    </div>
                    <div className="ml-auto rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                      {donor.matchScore}%
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {donor.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {donor.availability}
                    </div>
                    <div>Last Donation: {donor.lastDonation}</div>
                    <div>Donations: {donor.donationCount}</div>
                  </div>
                </div>
                <Button size="sm" className="ml-4 flex-shrink-0 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
