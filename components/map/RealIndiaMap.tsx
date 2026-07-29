'use client'

import { useState } from 'react'
import { indiaGeoJson, getFeatureColor } from '@/lib/indiaGeoJson'
import { indiaStatesData } from '@/lib/indiaMapData'

interface RealIndiaMapProps {
  selectedState: string | null
  onStateSelect: (state: string) => void
}

const getRiskLevelFromState = (stateName: string): string => {
  const stateData = indiaStatesData[stateName]
  return stateData ? stateData.shortageRiskLevel : 'low'
}

export default function RealIndiaMap({
  selectedState,
  onStateSelect,
}: RealIndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  // Map bounds for India
  const minLon = 68
  const maxLon = 97
  const minLat = 8
  const maxLat = 37
  const width = 800
  const height = 1000

  const projectCoordinates = (coordinates: number[][]): string => {
    return coordinates
      .map(([lon, lat]) => {
        const x = ((lon - minLon) / (maxLon - minLon)) * width
        const y = ((maxLat - lat) / (maxLat - minLat)) * height
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* SVG Map Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl" style={{ aspectRatio: '800/1000' }}>
          {/* Background */}
          <rect width={width} height={height} fill="#f0f9ff" />

          {/* Ocean border */}
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {/* Render GeoJSON features */}
          {indiaGeoJson.features.map((feature, idx) => {
            const stateName = feature.properties.name
            const geometry = feature.geometry

            if (geometry.type !== 'Polygon') return null

            const isSelected = selectedState === stateName
            const isHovered = hoveredState === stateName
            const riskLevel = getRiskLevelFromState(stateName)
            const color = getFeatureColor(riskLevel)

            // Calculate polygon points
            const points = projectCoordinates(geometry.coordinates[0])

            return (
              <g key={`${stateName}-${idx}`}>
                {/* State polygon */}
                <polygon
                  points={points}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={isSelected || isHovered ? '2' : '1.5'}
                  opacity={isHovered ? 0.95 : 0.85}
                  onClick={() => onStateSelect(stateName)}
                  onMouseEnter={() => setHoveredState(stateName)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{
                    cursor: 'pointer',
                    filter: isSelected
                      ? 'drop-shadow(0 0 4px rgba(220, 38, 38, 1))'
                      : isHovered
                        ? 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))'
                        : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover:opacity-100"
                />

                {/* State label - calculate centroid for better label placement */}
                {(() => {
                  const coords = geometry.coordinates[0]
                  const avgLon = coords.reduce((sum, c) => sum + c[0], 0) / coords.length
                  const avgLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length
                  const labelX = ((avgLon - minLon) / (maxLon - minLon)) * width
                  const labelY = ((maxLat - avgLat) / (maxLat - minLat)) * height

                  const shortName =
                    stateName.length > 15
                      ? stateName.split(' ').map((w) => w[0]).join('')
                      : stateName.length > 10
                        ? stateName.split(' ')[0].substring(0, 3)
                        : stateName.substring(0, 4)

                  return (
                    <text
                      x={labelX}
                      y={labelY}
                      fontSize="10"
                      fontWeight="600"
                      fill="#1f2937"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                      opacity={isSelected || isHovered ? 1 : 0.6}
                      style={{
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      {shortName}
                    </text>
                  )
                })()}
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(20, ${height - 90})`}>
            <rect width="120" height="80" fill="rgba(255,255,255,0.95)" stroke="#cbd5e1" strokeWidth="1" rx="4" />

            <circle cx="15" cy="10" r="4" fill="#10b981" />
            <text x="25" y="14" fontSize="11" fill="#333" fontWeight="500">
              Sufficient
            </text>

            <circle cx="15" cy="28" r="4" fill="#eab308" />
            <text x="25" y="32" fontSize="11" fill="#333" fontWeight="500">
              Moderate
            </text>

            <circle cx="15" cy="46" r="4" fill="#f97316" />
            <text x="25" y="50" fontSize="11" fill="#333" fontWeight="500">
              Low
            </text>

            <circle cx="15" cy="64" r="4" fill="#dc2626" />
            <text x="25" y="68" fontSize="11" fill="#333" fontWeight="500">
              Critical
            </text>
          </g>
        </svg>
      </div>

      {/* State selection grid */}
      <div className="border-t border-gray-200 bg-white p-3 max-h-24 overflow-y-auto">
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-10">
          {indiaGeoJson.features.map((feature) => {
            const stateName = feature.properties.name
            return (
              <button
                key={stateName}
                onClick={() => onStateSelect(stateName)}
                className={`rounded px-1.5 py-0.5 text-xs font-medium transition-all truncate ${
                  selectedState === stateName
                    ? 'bg-blood-600 text-white shadow-md'
                    : hoveredState === stateName
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={stateName}
              >
                {stateName.length > 5 ? stateName.substring(0, 4) : stateName}
              </button>
            )
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="border-t border-gray-200 bg-blue-50 px-4 py-2">
        <p className="text-xs text-blue-900">
          💡 Click any state to view detailed blood supply analytics. Hover to highlight.
        </p>
      </div>
    </div>
  )
}
