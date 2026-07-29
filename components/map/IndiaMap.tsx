'use client'

import { getAllStates, indiaStatesData } from '@/lib/indiaMapData'

interface IndiaMapProps {
  selectedState: string | null
  onStateSelect: (state: string) => void
}

const statePositions: Record<string, { x: number; y: number }> = {
  'Andhra Pradesh': { x: 75, y: 65 },
  'Arunachal Pradesh': { x: 88, y: 20 },
  'Assam': { x: 80, y: 25 },
  'Bihar': { x: 70, y: 35 },
  'Chhattisgarh': { x: 65, y: 50 },
  'Goa': { x: 55, y: 72 },
  'Gujarat': { x: 40, y: 55 },
  'Haryana': { x: 55, y: 25 },
  'Himachal Pradesh': { x: 50, y: 15 },
  'Jharkhand': { x: 72, y: 42 },
  'Karnataka': { x: 60, y: 72 },
  'Kerala': { x: 65, y: 85 },
  'Madhya Pradesh': { x: 58, y: 42 },
  'Maharashtra': { x: 52, y: 58 },
  'Manipur': { x: 92, y: 32 },
  'Meghalaya': { x: 82, y: 30 },
  'Mizoram': { x: 90, y: 42 },
  'Nagaland': { x: 88, y: 28 },
  'Odisha': { x: 73, y: 48 },
  'Punjab': { x: 45, y: 18 },
  'Rajasthan': { x: 48, y: 38 },
  'Sikkim': { x: 85, y: 22 },
  'Tamil Nadu': { x: 68, y: 80 },
  'Telangana': { x: 72, y: 62 },
  'Tripura': { x: 87, y: 35 },
  'Uttar Pradesh': { x: 60, y: 30 },
  'Uttarakhand': { x: 58, y: 22 },
  'West Bengal': { x: 75, y: 38 },
  'Delhi': { x: 56, y: 23 },
  'Jammu and Kashmir': { x: 50, y: 5 },
  'Ladakh': { x: 55, y: 8 },
}

const getRiskColor = (state: string) => {
  const stateData = indiaStatesData[state]
  if (!stateData) return '#e5e7eb'

  const riskLevel = stateData.shortageRiskLevel
  const colors: Record<string, string> = {
    'low': '#10b981',
    'medium': '#f59e0b',
    'high': '#ef4444',
    'critical': '#991b1b',
  }
  return colors[riskLevel] || '#e5e7eb'
}

export default function IndiaMap({ selectedState, onStateSelect }: IndiaMapProps) {
  const states = getAllStates()

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-blue-50 to-white">
      {/* Map Container */}
      <div className="flex-1 overflow-auto p-6">
        <svg viewBox="0 0 100 100" className="w-full" style={{ minWidth: '400px', aspectRatio: '1' }}>
          {/* India Map Background - Simplified representation */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Background */}
          <rect width="100" height="100" fill="#f0f9ff" />

          {/* State Circles */}
          {states.map((state) => {
            const pos = statePositions[state]
            if (!pos) return null

            const isSelected = selectedState === state
            const stateData = indiaStatesData[state]
            const riskColor = getRiskColor(state)

            return (
              <g
                key={state}
                onClick={() => onStateSelect(state)}
                style={{ cursor: 'pointer' }}
                filter="url(#shadow)"
              >
                {/* Animated background circle when selected */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="5"
                    fill={riskColor}
                    opacity="0.2"
                    style={{ animation: 'pulse 2s ease-in-out infinite' }}
                  />
                )}

                {/* Main state circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? '3.5' : '2.8'}
                  fill={riskColor}
                  stroke={isSelected ? '#ffffff' : 'none'}
                  strokeWidth={isSelected ? '0.5' : '0'}
                  className={`transition-all ${!isSelected && 'hover:r-3.5'}`}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' : 'none',
                  }}
                />

                {/* Tooltip on hover */}
                <title>
                  {state} - Risk: {stateData.shortageRiskLevel.toUpperCase()} - {stateData.hospitals} Hospitals
                </title>
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(5, 80)">
            <text x="0" y="0" fontSize="2" fontWeight="bold" fill="#333">
              Risk Levels:
            </text>
            <circle cx="0" cy="4" r="0.8" fill="#10b981" />
            <text x="1.5" y="4.5" fontSize="1.5" fill="#333">
              Low
            </text>

            <circle cx="10" cy="4" r="0.8" fill="#f59e0b" />
            <text x="11.5" y="4.5" fontSize="1.5" fill="#333">
              Medium
            </text>

            <circle cx="22" cy="4" r="0.8" fill="#ef4444" />
            <text x="23.5" y="4.5" fontSize="1.5" fill="#333">
              High
            </text>

            <circle cx="32" cy="4" r="0.8" fill="#991b1b" />
            <text x="33.5" y="4.5" fontSize="1.5" fill="#333">
              Critical
            </text>
          </g>
        </svg>
      </div>

      {/* States List Footer */}
      <div className="border-t border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">All States ({states.length})</p>
        <div className="grid max-h-28 grid-cols-3 gap-2 overflow-y-auto">
          {states.map((state) => (
            <button
              key={state}
              onClick={() => onStateSelect(state)}
              className={`truncate rounded px-2 py-1 text-xs font-medium transition-all ${
                selectedState === state
                  ? 'bg-blood-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={state}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            r: 5;
            opacity: 0.2;
          }
          50% {
            r: 7;
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  )
}
