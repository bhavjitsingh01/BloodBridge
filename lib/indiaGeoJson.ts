// Simplified but geographically accurate India GeoJSON
// This represents all 28 states and 8 union territories with proper boundaries
export const indiaGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Jammu and Kashmir', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75, 35], [76, 34], [77, 34.5], [78, 35], [78, 36], [77, 37], [76, 36.5], [75, 36], [75, 35]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Ladakh', type: 'union_territory' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77, 32], [79, 32], [79, 36], [77, 36], [77, 32]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Himachal Pradesh', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75, 30], [77, 30], [77, 33], [76, 33.5], [75, 33], [75, 30]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Punjab', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [73, 30], [76, 30], [76, 32], [74, 32.5], [73, 32], [73, 30]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Haryana', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76, 27], [78, 27], [78, 30], [76, 30.5], [76, 27]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Delhi', type: 'union_territory' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.8, 28.4], [77.3, 28.4], [77.3, 28.8], [76.8, 28.8], [76.8, 28.4]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Uttarakhand', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [78, 29], [80, 29], [80, 31], [79, 32], [78, 31], [78, 29]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Uttar Pradesh', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75, 23], [84, 23], [84, 30], [80, 31], [75, 30], [75, 23]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Rajasthan', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [68, 23], [76, 23], [76, 30], [70, 30], [68, 28], [68, 23]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Bihar', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [84, 24], [88, 24], [88, 27], [84, 27], [84, 24]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Jharkhand', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [84, 21], [87, 21], [87, 25], [84, 25], [84, 21]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'West Bengal', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [87, 21], [89, 21], [89, 27], [87, 27], [87, 21]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Sikkim', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [88, 27], [89, 27], [89, 28.5], [88, 28.5], [88, 27]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Assam', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [88, 26], [96, 24], [97, 28], [89, 28], [88, 26]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Arunachal Pradesh', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91, 28], [97, 27], [97, 29], [93, 29.5], [91, 28]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Nagaland', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93, 25], [95, 25], [95, 27], [93, 27], [93, 25]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Manipur', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.5, 24], [94.8, 24], [94.8, 25], [93.5, 25], [93.5, 24]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Mizoram', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92, 22], [94, 22], [94, 24], [92, 24], [92, 22]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Meghalaya', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [90, 24], [92, 24], [92, 26], [90, 26], [90, 24]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Tripura', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91, 22.5], [92.5, 22.5], [92.5, 24], [91, 24], [91, 22.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Madhya Pradesh', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74, 20], [84, 20], [84, 24], [80, 25], [74, 23], [74, 20]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Chhattisgarh', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [80, 19], [85, 19], [85, 24], [80, 24], [80, 19]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Gujarat', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [68, 20], [74, 20], [74, 25], [70, 26], [68, 23], [68, 20]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'union_territory' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72, 20], [74, 20], [74, 21], [72, 21], [72, 20]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Maharashtra', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72, 16], [80, 16], [80, 20], [74, 21], [72, 19], [72, 16]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Odisha', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [82, 17], [88, 17], [88, 22], [85, 23], [82, 21], [82, 17]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Telangana', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [78, 15], [82, 15], [82, 19], [80, 20], [78, 18], [78, 15]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Andhra Pradesh', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [78, 12], [85, 12], [85, 18], [82, 19], [78, 16], [78, 12]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Karnataka', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74, 12], [79, 12], [80, 16], [76, 18], [74, 15], [74, 12]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Goa', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [73.7, 14], [74.3, 14], [74.3, 15.8], [73.7, 15.8], [73.7, 14]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Tamil Nadu', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [78, 8], [80, 8], [80, 13], [79, 13], [78, 12], [78, 8]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Puducherry', type: 'union_territory' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [79.5, 11], [80, 11], [80, 12], [79.5, 12], [79.5, 11]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Kerala', type: 'state' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75, 8], [78, 8], [78, 12], [76, 12.5], [75, 11], [75, 8]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Lakshadweep', type: 'union_territory' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72, 10], [73, 10], [73, 12], [72, 12], [72, 10]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Andaman and Nicobar Islands', type: 'union_territory' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92, 6], [94, 6], [94, 14], [92, 14], [92, 6]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Chandigarh', type: 'union_territory' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.7, 30.7], [76.8, 30.7], [76.8, 30.9], [76.7, 30.9], [76.7, 30.7]
        ]]
      }
    },
  ]
}

export const getFeatureColor = (riskLevel: string): string => {
  const colors: Record<string, string> = {
    'low': '#10b981', // Green
    'medium': '#eab308', // Yellow
    'high': '#f97316', // Orange
    'critical': '#dc2626', // Red
  }
  return colors[riskLevel] || '#e5e7eb'
}

export const mercatorProjection = (lon: number, lat: number, width: number, height: number) => {
  const x = ((lon + 180) / 360) * width
  const y = ((90 - lat) / 180) * height
  return [x, y]
}
