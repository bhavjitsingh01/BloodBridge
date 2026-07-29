'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import EnhancedStatePanel from '@/components/map/EnhancedStatePanel'
import { getStateData } from '@/lib/indiaMapData'

const AccurateIndiaMap = dynamic(() => import('@/components/map/AccurateIndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-blood-200 border-t-blood-600"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

export default function IntelligenceMapPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedStateData = selectedState ? getStateData(selectedState) : null

  const handleStateSelect = (state: string) => {
    setLoading(true)
    setSelectedState(state)
    // Simulate loading delay
    setTimeout(() => setLoading(false), 300)
  }

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blood-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Heart className="h-8 w-8 text-blood-600" />
            <h1 className="text-2xl font-bold text-gray-900">India Blood Intelligence Map</h1>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-blood-600 px-6 py-2 font-semibold text-white hover:bg-blood-700"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Accurate Geographic Map */}
        <div className="flex-1 overflow-hidden border-r border-gray-200 bg-white">
          <AccurateIndiaMap selectedState={selectedState} onStateSelect={handleStateSelect} />
        </div>

        {/* Right Side - Analytics Panel */}
        <div className="w-full overflow-hidden md:w-96 lg:w-[450px] bg-white">
          <EnhancedStatePanel state={selectedStateData} loading={loading} />
        </div>
      </div>
    </main>
  )
}
