import { StateData } from '@/lib/indiaMapData'
import { Heart, Building2, TrendingDown, AlertCircle, Droplets, Clock } from 'lucide-react'

interface EnhancedStatePanelProps {
  state: StateData | null
  loading?: boolean
}

const getRiskColor = (level: string) => {
  const colors = {
    'low': 'bg-green-50 border-green-200 text-green-900',
    'medium': 'bg-yellow-50 border-yellow-200 text-yellow-900',
    'high': 'bg-orange-50 border-orange-200 text-orange-900',
    'critical': 'bg-red-100 border-red-300 text-red-900',
  }
  return colors[level as keyof typeof colors] || colors['low']
}

const getRiskBadgeColor = (level: string) => {
  const colors = {
    'low': 'bg-green-200 text-green-900',
    'medium': 'bg-yellow-200 text-yellow-900',
    'high': 'bg-orange-200 text-orange-900',
    'critical': 'bg-red-300 text-red-900',
  }
  return colors[level as keyof typeof colors] || colors['low']
}

export default function EnhancedStatePanel({ state, loading }: EnhancedStatePanelProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-blood-200 border-t-blood-600"></div>
          <p className="text-gray-600">Loading state data...</p>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="text-gray-600">Select a state to view analytics</p>
        </div>
      </div>
    )
  }

  const totalAvailability = Object.values(state.bloodAvailability).reduce((a, b) => a + b, 0)
  const totalRequirement = Object.values(state.bloodRequirement).reduce((a, b) => a + b, 0)
  const shortagePercentage = Math.max(0, ((totalRequirement - totalAvailability) / totalRequirement) * 100)
  const availabilityPercentage = 100 - shortagePercentage

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blood-50 to-blood-100 p-6">
        <h2 className="text-3xl font-bold text-gray-900">{state.name}</h2>
        <p className="mt-2 text-sm text-gray-600">Intelligence Report</p>
      </div>

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* Risk Status */}
        <div className={`rounded-lg border-2 p-4 ${getRiskColor(state.shortageRiskLevel)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Shortage Risk</p>
              <p className="text-sm opacity-90">
                Shortage predicted in {state.shortageRiskDays} days
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${getRiskBadgeColor(state.shortageRiskLevel)}`}>
              {state.shortageRiskLevel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Key Metrics - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Hospitals</p>
                <p className="text-2xl font-bold text-gray-900">{state.hospitals}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-xs text-gray-600">Blood Banks</p>
                <p className="text-2xl font-bold text-gray-900">{state.bloodBanks}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blood-600" />
              <div>
                <p className="text-xs text-gray-600">Active Donors</p>
                <p className="text-2xl font-bold text-gray-900">{state.totalDonors}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{state.expiringUnits}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Availability Overview */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Blood Supply Status</h3>

          <div className="space-y-3">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="font-bold text-green-600">{availabilityPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(availabilityPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Shortage %</span>
                <span className="font-bold text-red-600">{shortagePercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${Math.min(shortagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-600">Total Available</p>
              <p className="text-lg font-bold text-gray-900">{totalAvailability} units</p>
              <p className="text-xs text-gray-600">Total Required</p>
              <p className="text-lg font-bold text-gray-900">{totalRequirement} units</p>
            </div>
          </div>
        </div>

        {/* Blood Group Details */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Blood Type Inventory</h3>
          <div className="space-y-2">
            {Object.keys(state.bloodAvailability).map((bloodGroup) => {
              const availability = state.bloodAvailability[bloodGroup as keyof typeof state.bloodAvailability]
              const requirement = state.bloodRequirement[bloodGroup as keyof typeof state.bloodRequirement]
              const percentage = Math.min((availability / requirement) * 100, 100)

              return (
                <div key={bloodGroup}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{bloodGroup}</span>
                    <span className="text-xs text-gray-600">
                      {availability}/{requirement}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${
                        percentage >= 80
                          ? 'bg-green-500'
                          : percentage >= 50
                            ? 'bg-yellow-500'
                            : percentage >= 30
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Shortage Prediction */}
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <TrendingDown className="mt-1 h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">AI Shortage Prediction</h3>
              <p className="mt-2 text-sm text-gray-700">
                Based on current usage patterns and supply trends, critical blood shortage expected within{' '}
                <span className="font-bold text-red-600">{state.shortageRiskDays} days</span>. Recommend immediate
                distribution optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Requests */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Emergency Requests</h3>
          </div>
          <p className="text-sm text-red-800">
            <span className="font-bold">3</span> active emergency blood requests in progress
          </p>
          <div className="mt-3 space-y-2">
            <div className="rounded bg-white p-2 text-xs">
              <p className="font-semibold text-gray-900">O- Blood (10 units)</p>
              <p className="text-gray-600">Priority: Critical - ETA 2 hours</p>
            </div>
            <div className="rounded bg-white p-2 text-xs">
              <p className="font-semibold text-gray-900">A+ Blood (5 units)</p>
              <p className="text-gray-600">Priority: High - ETA 4 hours</p>
            </div>
            <div className="rounded bg-white p-2 text-xs">
              <p className="font-semibold text-gray-900">B+ Blood (8 units)</p>
              <p className="text-gray-600">Priority: Medium - ETA 6 hours</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <Clock className="mx-auto mb-2 h-5 w-5 text-gray-400" />
          <p className="text-xs text-gray-600">
            Last updated {new Date(state.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
