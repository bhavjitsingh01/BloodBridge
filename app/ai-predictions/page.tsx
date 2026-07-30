'use client'

import { useState, useMemo } from 'react'
import { Brain, RefreshCw } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Button from '@/components/Button'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { mockAIPredictionData } from '@/lib/mockData'

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const states = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai']
const timeRanges = ['7 Days', '14 Days', '30 Days']

export default function AIPredictionsPage() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7 Days')
  const [refreshing, setRefreshing] = useState(false)

  const { bloodShortagePrediction, demandPrediction, supplyVsDemand } = mockAIPredictionData

  // Filter data based on selections
  const filteredShortageData = useMemo(() => {
    let data = bloodShortagePrediction
    if (selectedBloodGroup) {
      data = data.filter(d => d.name === selectedBloodGroup)
    }
    return data
  }, [selectedBloodGroup, bloodShortagePrediction])

  const filteredDemandData = useMemo(() => {
    let data = demandPrediction.slice(0, timeRange === '7 Days' ? 7 : timeRange === '14 Days' ? 14 : 30)
    return data
  }, [timeRange, demandPrediction])

  const filteredSupplyVsDemandData = useMemo(() => {
    let data = supplyVsDemand.slice(0, timeRange === '7 Days' ? 7 : timeRange === '14 Days' ? 14 : 30)
    return data
  }, [timeRange, supplyVsDemand])

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  // Stats
  const criticalShortages = bloodShortagePrediction.filter(d => d.risk === 'Critical').length
  const avgDemand = Math.round(demandPrediction.reduce((sum, d) => sum + d.demand, 0) / demandPrediction.length)
  const accuracyRate = '92.5%'

  return (
    <DashboardLayout
      title="AI Predictions Dashboard"
      subtitle="Machine learning powered blood supply forecasting"
      userRole="Admin"
      navItems={[
        { label: 'Dashboard', href: '/ai-predictions', icon: <Brain className="h-5 w-5" />, isActive: true },
      ]}
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Critical Shortages"
          value={criticalShortages}
          icon={<Brain className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          label="Average Daily Demand"
          value={avgDemand}
          unit="units"
          icon={<Brain className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Forecast Accuracy"
          value={accuracyRate}
          icon={<Brain className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          label="Next Prediction"
          value="Today"
          icon={<Brain className="h-6 w-6" />}
          color="blue"
        />
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <div className="flex gap-2">
                {timeRanges.map(range => (
                  <Button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    variant={timeRange === range ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  value={selectedBloodGroup || ''}
                  onChange={(e) => setSelectedBloodGroup(e.target.value || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={selectedState || ''}
                  onChange={(e) => setSelectedState(e.target.value || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">All States</option>
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid gap-8 mb-8">
        {/* Blood Shortage Prediction */}
        <Card>
          <h3 className="mb-4 text-lg font-bold text-gray-900">Blood Shortage Prediction</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredShortageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="shortage" fill="#8884d8" name="Shortage Risk (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Demand Prediction */}
        <Card>
          <h3 className="mb-4 text-lg font-bold text-gray-900">Demand Prediction ({timeRange})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredDemandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="demand" stroke="#dc2626" name="Predicted Demand" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expiry Prediction */}
        <Card>
          <h3 className="mb-4 text-lg font-bold text-gray-900">Expiry Prediction ({timeRange})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredDemandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="expiry" stroke="#f97316" name="Expiring Units" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Supply vs Demand */}
        <Card>
          <h3 className="mb-4 text-lg font-bold text-gray-900">Supply vs Demand ({timeRange})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredSupplyVsDemandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="supply" fill="#10b981" name="Supply Available" />
                <Line type="monotone" dataKey="demand" stroke="#dc2626" name="Demand" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <h3 className="mb-4 text-lg font-bold text-gray-900">AI Insights</h3>
        <div className="space-y-3">
          <div className="rounded-lg bg-amber-50 p-3 border-l-4 border-amber-600">
            <p className="font-semibold text-amber-900">⚠️ Supply Alert</p>
            <p className="text-sm text-amber-800">O+ blood group shows {criticalShortages > 0 ? 'critical' : 'low'} supply in next {timeRange.toLowerCase()}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 border-l-4 border-blue-600">
            <p className="font-semibold text-blue-900">📊 Trend Analysis</p>
            <p className="text-sm text-blue-800">Demand is increasing by 5-8% every 3 days. Recommend increasing collections.</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 border-l-4 border-green-600">
            <p className="font-semibold text-green-900">✓ Recommendation</p>
            <p className="text-sm text-green-800">Schedule additional donation camps in high-demand areas this week.</p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  )
}
