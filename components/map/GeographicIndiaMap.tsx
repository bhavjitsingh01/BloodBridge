'use client'

import { useState } from 'react'
import { getAllStatePaths, getStatePath, getShortStateName, indiaStatePaths } from '@/lib/indiaMapSvg'
import { indiaStatesData } from '@/lib/indiaMapData'

interface GeographicIndiaMapProps {
  selectedState: string | null
  onStateSelect: (state: string) => void
}

const getColorForRiskLevel = (riskLevel: string): string => {
  const colors: Record<string, string> = {
    'low': '#10b981', // Green
    'medium': '#eab308', // Yellow
    'high': '#f97316', // Orange
    'critical': '#dc2626', // Red
  }
  return colors[riskLevel] || '#e5e7eb'
}

const getRiskLevelFromState = (stateName: string): string => {
  const stateData = indiaStatesData[stateName]
  return stateData ? stateData.shortageRiskLevel : 'low'
}

export default function GeographicIndiaMap({
  selectedState,
  onStateSelect,
}: GeographicIndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const states = getAllStatePaths()

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Map Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full max-w-4xl" style={{ aspectRatio: '1' }}>
          {/* Background */}
          <rect width="100" height="100" fill="#f0f9ff" />

          {/* Border of India */}
          <path
            d="M 38 20 L 88 15 L 92 65 L 70 92 L 40 95 L 35 70 L 28 40 Z"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="0.5"
            opacity="0.5"
          />

          {/* State paths */}
          {states.map((stateName) => {
            const pathData = getStatePath(stateName)
            if (!pathData) return null

            const isSelected = selectedState === stateName
            const isHovered = hoveredState === stateName
            const riskLevel = getRiskLevelFromState(stateName)
            const color = getColorForRiskLevel(riskLevel)

            return (
              <g key={stateName}>
                {/* State fill */}
                <path
                  d={pathData.path}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={isSelected || isHovered ? '0.8' : '0.5'}
                  opacity={isHovered ? 0.9 : 0.8}
                  onClick={() => onStateSelect(stateName)}
                  onMouseEnter={() => setHoveredState(stateName)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{
                    cursor: 'pointer',
                    filter: isSelected
                      ? 'drop-shadow(0 0 3px rgba(220, 38, 38, 0.8))'
                      : isHovered
                        ? 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))'
                        : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover:opacity-100"
                />

                {/* State label */}
                <text
                  x={pathData.cx}
                  y={pathData.cy}
                  fontSize="2.5"
                  fontWeight="600"
                  fill="#1f2937"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                  opacity={isSelected || isHovered ? 1 : 0.7}
                  style={{
                    transition: 'all 0.2s ease',
                  }}
                >
                  {getShortStateName(stateName)}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(5, 80)">
            <rect width="30" height="18" fill="rgba(255,255,255,0.9)" stroke="#cbd5e1" strokeWidth="0.3" rx="0.5" />

            <circle cx="7" cy="85" r="1" fill="#10b981" />
            <text x="10" y="85.5" fontSize="1.8" fill="#333">
              Sufficient
            </text>

            <circle cx="7" cy="89" r="1" fill="#eab308" />
            <text x="10" y="89.5" fontSize="1.8" fill="#333">
              Moderate
            </text>

            <circle cx="7" cy="93" r="1" fill="#f97316" />
            <text x="10" y="93.5" fontSize="1.8" fill="#333">
              Low
            </text>

            <circle cx="7" cy="97" r="1" fill="#dc2626" />
            <text x="10" y="97.5" fontSize="1.8" fill="#333">
              Critical
            </text>
          </g>
        </svg>
      </div>

      {/* Instructions */}
      <div className="border-t border-gray-200 bg-blue-50 px-4 py-3">
        <p className="text-xs text-blue-900">
          💡 <strong>Click any state</strong> to view detailed blood supply analytics. Hover to highlight.
        </p>
      </div>

      {/* States Grid */}
      <div className="border-t border-gray-200 bg-white p-3 max-h-24 overflow-y-auto">
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-10">
          {states.map((state) => (
            <button
              key={state}
              onClick={() => onStateSelect(state)}
              className={`rounded px-1.5 py-0.5 text-xs font-medium transition-all ${
                selectedState === state
                  ? 'bg-blood-600 text-white shadow-md'
                  : hoveredState === state
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={state}
            >
              {getShortStateName(state)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
