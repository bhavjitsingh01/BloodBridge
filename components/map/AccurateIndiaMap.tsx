'use client'

import { useState } from 'react'
import { indiaGeoJsonData, getAllStatesAndUTs, getFeatureByName } from '@/lib/indiaGeoJsonData'
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
  // Map bounds for India
  const minLon = 68
  const maxLon = 97
  const minLat = 8
  const maxLat = 37
  const width = 1200
  const height = 1400

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
  const width = 1200
  const height = 1400

  return (
    <div className="flex flex-col h-full bg-white">
      {/* SVG Map */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-4xl" style={{ aspectRatio: '12/14' }}>
          {/* Background */}
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
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

          {/* Grid background for reference */}
          <g stroke="#f3f4f6" strokeWidth="1" opacity="0.3">
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`v${i}`} x1={(width / 6) * i} y1="0" x2={(width / 6) * i} y2={height} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={(height / 7) * i} x2={width} y2={(height / 7) * i} />
            ))}
          </g>

          {/* Render all state polygons */}
          {indiaGeoJsonData.features.map((feature) => {
            const stateName = feature.properties.name
            const geometry = feature.geometry

            if (geometry.type !== 'Polygon') return null

            const isSelected = selectedState === stateName
            const isHovered = hoveredState === stateName
            const fillColor = getRiskLevelColor(stateName)

            const points = projectCoordinates(geometry.coordinates[0])

            return (
              <g key={stateName}>
                {/* State polygon */}
                <polygon
                  points={points}
                  fill={fillColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? '3' : isHovered ? '2.5' : '2'}
                  opacity={isHovered ? 1 : 0.8}
                  onClick={() => onStateSelect(stateName)}
                  onMouseEnter={() => setHoveredState(stateName)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{
                    cursor: 'pointer',
                    filter: isSelected ? 'url(#selectionGlow) drop-shadow(0 0 6px rgba(220, 38, 38, 0.7))' : 'url(#shadow)',
                    transition: 'all 0.3s ease',
                  }}
                  className="hover:opacity-100"
                />

                {/* Full state name label */}
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

                  // Font size based on state area
                  const stateArea = coords.length * 0.01
                  const fontSize = Math.max(9, Math.min(13, stateArea))

                  return (
                    <text
                      x={labelX}
                      y={labelY}
                      fontSize={fontSize}
                      fontWeight={isSelected || isHovered ? '700' : '600'}
                      fill="#111827"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                      opacity={isSelected || isHovered ? 1 : 0.7}
                      style={{
                        transition: 'all 0.3s ease',
                        textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                      }}
                    >
                      {stateName}
                    </text>
                  )
                })()}
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(${width - 240}, 20)`}>
            <rect width="220" height="140" fill="rgba(255,255,255,0.97)" stroke="#e5e7eb" strokeWidth="1.5" rx="6" />

            <text x="110" y="22" fontSize="13" fontWeight="700" textAnchor="middle" fill="#111827">
              Blood Supply Status
            </text>

            {[
              { color: '#10b981', label: 'Healthy' },
              { color: '#eab308', label: 'Moderate' },
              { color: '#f97316', label: 'Low' },
              { color: '#dc2626', label: 'Critical' },
            ].map((item, idx) => (
              <g key={idx} transform={`translate(0, ${40 + idx * 22})`}>
                <rect x="15" y="0" width="16" height="16" fill={item.color} rx="2" />
                <text x="40" y="12" fontSize="12" fill="#374151">
                  {item.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* State selection grid - scrollable */}
      <div className="border-t border-gray-200 bg-white p-3 max-h-28 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-700 mb-2">Select State/Union Territory:</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {allStates.map((state) => (
            <button
              key={state}
              onClick={() => onStateSelect(state)}
              className={`rounded px-2 py-1.5 text-xs font-medium transition-all truncate ${
                selectedState === state
                  ? 'bg-blood-600 text-white shadow-md'
                  : hoveredState === state
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={state}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="border-t border-gray-200 bg-blue-50 px-4 py-2">
        <p className="text-xs text-blue-900">
          💡 Click any state or union territory to view detailed blood supply analytics
        </p>
      </div>
    </div>
  )
}
