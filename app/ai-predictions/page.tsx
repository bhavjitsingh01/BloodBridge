'use client'

import { Brain, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import { mockAIPredictionData } from '@/lib/mockData'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

const navItems = [
  { label: 'Dashboard', href: '/ai-predictions', icon: <Brain className="h-5 w-5" />, isActive: true },
]

const colors = {
  O_positive: '#dc2626',
  O_negative: '#991b1b',
  A_positive: '#2563eb',
  A_negative: '#1e40af',
  B_positive: '#059669',
  B_negative: '#065f46',
  AB_positive: '#7c3aed',
  AB_negative: '#5b21b6',
}

export default function AIPredictionDashboard() {
  const { bloodShortagePrediction, demandPrediction, expiryPrediction, supplyVsDemand } =
    mockAIPredictionData

  return (
    <DashboardLayout
      title="AI Prediction Dashboard"
      subtitle="Intelligent forecasting for blood supply management"
      userRole="AI Analytics"
      navItems={navItems}
    >
      {/* Blood Shortage Prediction */}
      <Card className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Blood Shortage Prediction</h2>
        </div>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bloodShortagePrediction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bloodGroup" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentUnits" fill="#3b82f6" name="Current Units" />
              <Bar dataKey="minRequired" fill="#ef4444" name="Min Required" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {bloodShortagePrediction.map((item) => (
            <div
              key={item.bloodGroup}
              className={`rounded-lg p-4 ${
                item.riskLevel === 'Critical'
                  ? 'bg-red-50 border border-red-200'
                  : item.riskLevel === 'Moderate'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : item.riskLevel === 'Low'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-green-50 border border-green-200'
              }`}
            >
              <p className="font-semibold text-gray-900">{item.bloodGroup}</p>
              <p className="mt-2 text-sm text-gray-600">Current: {item.currentUnits} units</p>
              <p className="text-sm text-gray-600">Min: {item.minRequired} units</p>
              <p className="mt-2 text-xs font-semibold text-gray-700">
                Shortage in {item.daysUntilShortage} days
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                  item.riskLevel === 'Critical'
                    ? 'bg-red-100 text-red-800'
                    : item.riskLevel === 'Moderate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : item.riskLevel === 'Low'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                }`}
              >
                {item.riskLevel}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Demand Prediction */}
      <Card className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Demand Prediction (7-Day Forecast)</h2>
        </div>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={demandPrediction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="O_positive" stroke={colors.O_positive} name="O+" />
              <Line type="monotone" dataKey="O_negative" stroke={colors.O_negative} name="O-" />
              <Line type="monotone" dataKey="A_positive" stroke={colors.A_positive} name="A+" />
              <Line type="monotone" dataKey="A_negative" stroke={colors.A_negative} name="A-" />
              <Line type="monotone" dataKey="B_positive" stroke={colors.B_positive} name="B+" />
              <Line type="monotone" dataKey="B_negative" stroke={colors.B_negative} name="B-" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Expiry Prediction */}
      <Card className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900">Blood Expiry Prediction</h2>
        </div>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={expiryPrediction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="O_positive"
                stroke="#dc2626"
                name="O+ Expiring"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="A_positive"
                stroke="#2563eb"
                name="A+ Expiring"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="B_positive"
                stroke="#059669"
                name="B+ Expiring"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="AB_positive"
                stroke="#7c3aed"
                name="AB+ Expiring"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Supply vs Demand */}
      <Card>
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Supply vs Demand Analysis</h2>
        </div>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={supplyVsDemand}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bloodGroup" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="supply" fill="#10b981" name="Supply" />
              <Bar dataKey="demand" fill="#f59e0b" name="Demand" />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                name="Balance"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {supplyVsDemand.map((item) => (
            <div key={item.bloodGroup} className="rounded-lg border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{item.bloodGroup}</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Supply:</span>
                  <span className="font-semibold text-green-600">{item.supply}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Demand:</span>
                  <span className="font-semibold text-amber-600">{item.demand}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span
                    className={`font-semibold ${item.balance > 50 ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {item.balance > 0 ? '+' : ''}
                    {item.balance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
