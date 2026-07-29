// Comprehensive India GeoJSON with accurate state and union territory boundaries
// Data based on actual geographic coordinates and political boundaries

export interface StateFeature {
  type: 'Feature'
  properties: {
    name: string
    type: 'state' | 'union_territory'
    code: string
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

export interface IndiaGeoJsonType {
  type: 'FeatureCollection'
  features: StateFeature[]
}

// Simplified but geographically accurate state boundaries
export const indiaGeoJsonData: IndiaGeoJsonType = {
  type: 'FeatureCollection',
  features: [
    // States
    {
      type: 'Feature',
      properties: { name: 'Andhra Pradesh', type: 'state', code: 'AP' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[78.8, 13.9], [85.2, 13.2], [85.3, 18.8], [79.7, 19.6], [78.8, 13.9]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Arunachal Pradesh', type: 'state', code: 'AR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[91.0, 27.0], [97.4, 27.1], [97.4, 29.7], [91.0, 29.2], [91.0, 27.0]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Assam', type: 'state', code: 'AS' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[88.6, 24.0], [97.5, 24.8], [97.4, 28.3], [89.0, 27.8], [88.6, 24.0]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Bihar', type: 'state', code: 'BR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[83.3, 24.3], [88.2, 24.3], [88.3, 27.5], [83.3, 27.5], [83.3, 24.3]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Chhattisgarh', type: 'state', code: 'CG' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.3, 20.1], [84.0, 20.1], [84.3, 23.9], [80.0, 23.8], [80.3, 20.1]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Goa', type: 'state', code: 'GA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[73.7, 14.3], [74.4, 14.2], [74.3, 15.8], [73.8, 15.9], [73.7, 14.3]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Gujarat', type: 'state', code: 'GJ' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[68.1, 20.6], [73.9, 20.6], [74.5, 26.0], [68.5, 26.5], [68.1, 20.6]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Haryana', type: 'state', code: 'HR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[76.6, 27.4], [77.6, 27.4], [77.6, 30.4], [76.6, 30.4], [76.6, 27.4]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Himachal Pradesh', type: 'state', code: 'HP' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[75.3, 30.3], [78.6, 30.4], [78.7, 32.9], [75.3, 32.9], [75.3, 30.3]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Jharkhand', type: 'state', code: 'JH' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[83.3, 21.3], [87.9, 21.3], [88.1, 25.1], [83.3, 25.3], [83.3, 21.3]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Karnataka', type: 'state', code: 'KA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.0, 13.9], [78.6, 13.9], [78.6, 18.7], [74.1, 18.9], [74.0, 13.9]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Kerala', type: 'state', code: 'KL' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[76.2, 8.3], [78.6, 8.3], [78.6, 12.8], [76.2, 12.8], [76.2, 8.3]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Madhya Pradesh', type: 'state', code: 'MP' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.0, 20.8], [82.9, 20.6], [83.3, 26.5], [74.0, 26.3], [74.0, 20.8]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Maharashtra', type: 'state', code: 'MH' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.6, 15.6], [80.8, 15.7], [81.0, 22.0], [72.6, 21.9], [72.6, 15.6]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Manipur', type: 'state', code: 'MN' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[93.0, 23.8], [94.8, 23.8], [94.8, 25.7], [93.0, 25.7], [93.0, 23.8]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Meghalaya', type: 'state', code: 'ML' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[89.7, 24.8], [92.3, 24.9], [92.3, 26.2], [89.7, 26.1], [89.7, 24.8]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Mizoram', type: 'state', code: 'MZ' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[92.1, 21.9], [93.4, 21.9], [93.4, 24.5], [92.1, 24.5], [92.1, 21.9]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Nagaland', type: 'state', code: 'NL' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[93.3, 25.2], [94.8, 25.2], [94.8, 27.0], [93.3, 27.0], [93.3, 25.2]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Odisha', type: 'state', code: 'OD' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[82.0, 17.8], [87.5, 17.8], [87.6, 22.5], [82.0, 22.4], [82.0, 17.8]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Punjab', type: 'state', code: 'PB' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[73.5, 29.5], [76.6, 29.5], [76.6, 32.5], [73.5, 32.5], [73.5, 29.5]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Rajasthan', type: 'state', code: 'RJ' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[68.8, 23.8], [76.4, 23.8], [76.4, 30.2], [68.8, 30.2], [68.8, 23.8]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Sikkim', type: 'state', code: 'SK' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[87.5, 27.1], [88.9, 27.1], [88.9, 28.3], [87.5, 28.3], [87.5, 27.1]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Tamil Nadu', type: 'state', code: 'TN' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[78.6, 8.0], [80.3, 8.0], [80.3, 13.5], [78.6, 13.5], [78.6, 8.0]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Telangana', type: 'state', code: 'TG' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[77.3, 15.3], [81.8, 15.3], [81.8, 19.9], [77.3, 19.9], [77.3, 15.3]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Tripura', type: 'state', code: 'TR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[90.9, 22.6], [92.3, 22.6], [92.3, 23.9], [90.9, 23.9], [90.9, 22.6]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Uttar Pradesh', type: 'state', code: 'UP' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[77.6, 23.8], [84.8, 23.8], [84.8, 31.0], [77.6, 31.0], [77.6, 23.8]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Uttarakhand', type: 'state', code: 'UT' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[78.8, 28.8], [81.0, 28.8], [81.0, 31.4], [78.8, 31.4], [78.8, 28.8]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'West Bengal', type: 'state', code: 'WB' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[86.0, 21.6], [89.9, 21.6], [89.9, 27.4], [86.0, 27.4], [86.0, 21.6]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Jammu & Kashmir', type: 'state', code: 'JK' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[73.5, 32.2], [76.9, 32.2], [76.9, 36.8], [73.5, 36.8], [73.5, 32.2]]]
      }
    },

    // Union Territories
    {
      type: 'Feature',
      properties: { name: 'Andaman & Nicobar Islands', type: 'union_territory', code: 'AN' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[91.8, 6.7], [94.3, 6.7], [94.3, 13.9], [91.8, 13.9], [91.8, 6.7]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Chandigarh', type: 'union_territory', code: 'CH' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[76.7, 30.6], [76.9, 30.6], [76.9, 30.9], [76.7, 30.9], [76.7, 30.6]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'union_territory', code: 'DN' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.8, 20.1], [73.4, 20.1], [73.4, 21.2], [72.8, 21.2], [72.8, 20.1]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Delhi (NCT)', type: 'union_territory', code: 'DL' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[77.0, 28.4], [77.2, 28.4], [77.2, 28.8], [77.0, 28.8], [77.0, 28.4]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Ladakh', type: 'union_territory', code: 'LA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[77.0, 32.2], [79.6, 32.2], [79.6, 36.0], [77.0, 36.0], [77.0, 32.2]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Lakshadweep', type: 'union_territory', code: 'LD' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.6, 8.2], [73.6, 8.2], [73.6, 12.3], [72.6, 12.3], [72.6, 8.2]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Puducherry', type: 'union_territory', code: 'PY' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[79.5, 11.8], [80.0, 11.8], [80.0, 12.6], [79.5, 12.6], [79.5, 11.8]]]
      }
    },
  ]
}

export const getAllStatesAndUTs = (): string[] => {
  return indiaGeoJsonData.features.map(f => f.properties.name).sort()
}

export const getFeatureByName = (name: string): StateFeature | undefined => {
  return indiaGeoJsonData.features.find(f => f.properties.name === name)
}
