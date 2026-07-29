'use client'

import { useState } from 'react'
import { indiaGadmGeoJson, getAllStatesAndUTs } from '@/lib/indiaGadmGeoJson'
import { indiaStatesData } from '@/lib/indiaMapData'

interface AccurateIndiaMapProps {
  selectedState: string | null
  onStateSelect: (state: string) => void
}

const getRiskLevelColor = (stateName: string): string => {
  const stateData = indiaStatesData[stateName]
  if (!stateData) return '#d1d5db'

  const riskLevel = stateData.shortageRiskLevel
  const colors: Record<string, string> = {
    'low': '#10b981', // Green
    'medium': '#eab308', // Yellow
    'high': '#f97316', // Orange
    'critical': '#dc2626', // Red
  }
  return colors[riskLevel] || '#d1d5db'
}

const projectCoordinates = (coordinates: number[][]): string => {
  const minLon = 68
  const maxLon = 97
  const minLat = 8
  const maxLat = 37
  const width = 1000
  const height = 1200

  return coordinates
    .map(([lon, lat]) => {
      const x = ((lon - minLon) / (maxLon - minLon)) * width
      const y = ((maxLat - lat) / (maxLat - minLat)) * height
      return `${x},${y}`
    })
    .join(' ')
}

export default function AccurateIndiaMap({
  selectedState,
  onStateSelect,
}: AccurateIndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const allStates = getAllStatesAndUTs()
  const width = 1000
  const height = 1200

  return (
    <div className="flex flex-col h-full bg-white">
      {/* SVG Map - GADM Data */}
      <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="inline-block min-w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ minWidth: '100%', minHeight: '100%' }}>
          {/* Filters */}
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
            </filter>
            <filter id="selectionGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={width} height={height} fill="#e0f2fe" />

          {/* Render GADM state polygons */}
          {indiaGadmGeoJson.features.map((feature) => {
            const stateName = feature.properties.name
            const geometry = feature.geometry

            if (geometry.type !== 'Polygon') return null

            const isSelected = selectedState === stateName
            const isHovered = hoveredState === stateName
            const fillColor = getRiskLevelColor(stateName)
            const points = projectCoordinates(geometry.coordinates[0])

            return (
              <g key={stateName}>
                <polygon
                  points={points}
                  fill={fillColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? '2.5' : isHovered ? '2' : '1.5'}
                  opacity={isHovered ? 1 : 0.85}
                  onClick={() => onStateSelect(stateName)}
                  onMouseEnter={() => setHoveredState(stateName)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{
                    cursor: 'pointer',
                    filter: isSelected ? 'url(#selectionGlow) drop-shadow(0 0 5px rgba(220, 38, 38, 0.6))' : 'url(#shadow)',
                    transition: 'all 0.25s ease',
                  }}
                  className="hover:opacity-100"
                />

                {/* State label */}
                {(() => {
                  const coords = geometry.coordinates[0]
                  const avgLon = coords.reduce((sum, c) => sum + c[0], 0) / coords.length
                  const avgLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length

                  const minLon = 68
                  const maxLon = 97
                  const minLat = 8
                  const maxLat = 37

                  const labelX = ((avgLon - minLon) / (maxLon - minLon)) * width
                  const labelY = ((maxLat - avgLat) / (maxLat - minLat)) * height

                  return (
                    <text
                      x={labelX}
                      y={labelY}
                      fontSize="10"
                      fontWeight={isSelected || isHovered ? '700' : '600'}
                      fill="#111827"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                      opacity={isSelected || isHovered ? 1 : 0.65}
                      style={{ transition: 'all 0.25s ease' }}
                    >
                      {stateName}
                    </text>
                  )
                })()}
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(${width - 200}, 15)`}>
            <rect width="185" height="115" fill="rgba(255,255,255,0.95)" stroke="#cbd5e1" strokeWidth="1" rx="4" />
            <text x="92" y="18" fontSize="11" fontWeight="700" textAnchor="middle" fill="#1f2937">
              Blood Supply
            </text>
            {[
              { color: '#10b981', label: 'Healthy' },
              { color: '#eab308', label: 'Moderate' },
              { color: '#f97316', label: 'Low' },
              { color: '#dc2626', label: 'Critical' },
            ].map((item, idx) => (
              <g key={idx} transform={`translate(10, ${30 + idx * 20})`}>
                <rect width="12" height="12" fill={item.color} rx="1" />
                <text x="18" y="10" fontSize="10" fill="#4b5563">
                  {item.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
        </div>
      </div>

      {/* State selection grid */}
      <div className="border-t border-gray-200 bg-white p-3 max-h-32 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-700 mb-2">Select State/Union Territory:</p>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
          {allStates.map(({ name }) => (
            <button
              key={name}
              onClick={() => onStateSelect(name)}
              className={`rounded px-2.5 py-1.5 text-xs font-medium transition-all truncate ${
                selectedState === name
                  ? 'bg-blood-600 text-white shadow-md'
                  : hoveredState === name
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-150'
              }`}
              title={name}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="border-t border-gray-200 bg-blue-50 px-4 py-2">
        <p className="text-xs text-blue-900">
          💡 Using GADM administrative boundaries. Click any state for detailed analytics.
        </p>
      </div>
    </div>
  )
}
