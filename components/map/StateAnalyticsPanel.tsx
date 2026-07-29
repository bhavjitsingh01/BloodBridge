import { StateData } from '@/lib/indiaMapData'
import { Heart, Building2, TrendingDown, Clock, AlertCircle } from 'lucide-react'

interface StateAnalyticsPanelProps {
  state: StateData | null
  loading?: boolean
}

const getRiskColor = (level: string) => {
  const colors = {
    'low': 'bg-green-50 border-green-200 text-green-900',
    'medium': 'bg-amber-50 border-amber-200 text-amber-900',
    'high': 'bg-red-50 border-red-200 text-red-900',
    'critical': 'bg-red-100 border-red-300 text-red-900',
  }
  return colors[level as keyof typeof colors] || colors['low']
}

const getRiskBadgeColor = (level: string) => {
  const colors = {
    'low': 'bg-green-200 text-green-900',
    'medium': 'bg-amber-200 text-amber-900',
    'high': 'bg-red-200 text-red-900',
    'critical': 'bg-red-300 text-red-900',
  }
  return colors[level as keyof typeof colors] || colors['low']
}

export default function StateAnalyticsPanel({ state, loading }: StateAnalyticsPanelProps) {
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
  const availabilityPercentage = ((totalAvailability / totalRequirement) * 100).toFixed(1)

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blood-50 to-blood-100 p-6">
        <h2 className="text-3xl font-bold text-gray-900">{state.name}</h2>
        <p className="mt-2 text-sm text-gray-600">Last updated: {new Date(state.lastUpdated).toLocaleString()}</p>
      </div>

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* Risk Status */}
        <div className={`rounded-lg border-2 p-4 ${getRiskColor(state.shortageRiskLevel)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Shortage Risk</p>
              <p className="text-sm opacity-90">{state.shortageRiskDays} days until potential shortage</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${getRiskBadgeColor(state.shortageRiskLevel)}`}>
              {state.shortageRiskLevel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Hospitals</p>
                <p className="text-2xl font-bold text-gray-900">{state.hospitals}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Blood Banks</p>
                <p className="text-2xl font-bold text-gray-900">{state.bloodBanks}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-blood-600" />
              <div>
                <p className="text-sm text-gray-600">Active Donors</p>
                <p className="text-2xl font-bold text-gray-900">{state.totalDonors}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{state.expiringUnits}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Availability Overview */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Blood Availability vs Requirement</h3>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall Availability</span>
            <span className="font-bold text-blood-600">{availabilityPercentage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blood-600 to-blood-500 transition-all"
              style={{ width: `${Math.min(parseFloat(availabilityPercentage), 100)}%` }}
            ></div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{totalAvailability}</span> units available |{' '}
            <span className="font-semibold text-gray-900">{totalRequirement}</span> units required
          </p>
        </div>

        {/* Blood Group Details */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Blood Type Details</h3>
          <div className="space-y-3">
            {Object.keys(state.bloodAvailability).map((bloodGroup) => {
              const availability = state.bloodAvailability[bloodGroup as keyof typeof state.bloodAvailability]
              const requirement = state.bloodRequirement[bloodGroup as keyof typeof state.bloodRequirement]
              const percentage = ((availability / requirement) * 100).toFixed(0)

              return (
                <div key={bloodGroup}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{bloodGroup}</span>
                    <span className="text-xs text-gray-600">
                      {availability}/{requirement}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${
                        parseInt(percentage) >= 80
                          ? 'bg-green-500'
                          : parseInt(percentage) >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(parseInt(percentage), 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Last Updated */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <Clock className="mx-auto mb-2 h-5 w-5 text-gray-400" />
          <p className="text-xs text-gray-600">
            Last updated {new Date(state.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}
