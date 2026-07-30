'use client'

import Link from 'next/link'
import { Heart, TrendingUp, Users, Zap, Brain, ArrowRight, Menu, X, AlertCircle, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import SectionHeader from '@/components/landing/SectionHeader'
import FeatureCard from '@/components/landing/FeatureCard'
import RoleCard from '@/components/landing/RoleCard'
import StatBadge from '@/components/landing/StatBadge'
import StepCard from '@/components/landing/StepCard'
import { landingData } from '@/lib/landingData'
import { mockAIPredictionData } from '@/lib/mockData'
import { getStateData } from '@/lib/indiaMapData'
import './landing.css'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

const AccurateIndiaMap = dynamic(() => import('@/components/map/AccurateIndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-blood-200 border-t-blood-600"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

const EnhancedStatePanel = dynamic(() => import('@/components/map/EnhancedStatePanel'), {
  ssr: false,
})

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [mapLoading, setMapLoading] = useState(false)
  const { bloodShortagePrediction, demandPrediction, supplyVsDemand } = mockAIPredictionData

  const handleStateSelect = (state: string) => {
    setMapLoading(true)
    setSelectedState(state)
    setTimeout(() => setMapLoading(false), 300)
  }

  return (
    <main className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blood-600" />
            <span className="text-2xl font-bold text-blood-600">BloodBridge</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-gray-700 hover:text-blood-600">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blood-600">
              How It Works
            </a>
            <a href="#roles" className="text-gray-700 hover:text-blood-600">
              Roles
            </a>
            <Link
              href="/emergency-coordination"
              className="flex items-center gap-2 text-gray-700 hover:text-blood-600"
            >
              <AlertCircle className="h-4 w-4" />
              Emergency
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-blood-600 px-6 py-2 font-semibold text-white hover:bg-blood-700"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-700 hover:text-blood-600">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blood-600">
                How It Works
              </a>
              <a href="#roles" className="text-gray-700 hover:text-blood-600">
                Roles
              </a>
              <Link
                href="/emergency-coordination"
                className="flex items-center gap-2 text-gray-700 hover:text-blood-600"
              >
                <AlertCircle className="h-4 w-4" />
                Emergency Dashboard
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-blood-600 px-6 py-2 font-semibold text-white hover:bg-blood-700"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blood-50 via-white to-blue-50 pt-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blood-100 blur-3xl opacity-20" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-100 blur-3xl opacity-20" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="animate-fade-in-up text-5xl font-bold text-gray-900 md:text-7xl">
              <span className="gradient-text">{landingData.hero.headline}</span>
            </h1>
            <p className="animate-fade-in-up mt-6 text-xl text-gray-600 md:text-2xl" style={{ animationDelay: '0.1s' }}>
              {landingData.hero.subheadline}
            </p>
            <p className="animate-fade-in-up mx-auto mt-4 max-w-2xl text-lg text-gray-600" style={{ animationDelay: '0.2s' }}>
              {landingData.hero.description}
            </p>

            <div className="animate-fade-in-up mt-10 flex flex-col justify-center gap-4 sm:flex-row" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-lg bg-blood-600 px-8 py-4 font-semibold text-white transition-all hover:bg-blood-700 hover:shadow-lg"
              >
                {landingData.hero.cta}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="rounded-lg border-2 border-blood-600 px-8 py-4 font-semibold text-blood-600 transition-all hover:bg-blood-50">
                {landingData.hero.secondaryCta}
              </button>
            </div>

            {/* Stats Preview */}
            <div className="animate-fade-in mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
              {landingData.stats.map((stat, idx) => (
                <StatBadge key={idx} number={stat.number} label={stat.label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="The Challenge"
            subtitle="Traditional blood management systems are reactive, inefficient, and cost lives"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {landingData.problems.map((problem, idx) => (
              <div key={idx} className="animate-fade-in-up rounded-lg border border-red-200 bg-red-50 p-6" style={{ animationDelay: `${idx * 0.1}s` }}>
                <h3 className="text-lg font-bold text-red-900">{problem.title}</h3>
                <p className="mt-2 text-red-700">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="Our Solution"
            subtitle="BloodBridge transforms blood management from reactive to predictive"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {landingData.solutions.map((solution, idx) => (
              <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <FeatureCard
                  icon={<span className="text-3xl">{solution.icon}</span>}
                  title={solution.title}
                  description={solution.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="gradient-bg px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="Powered by AI"
            subtitle="Machine learning algorithms that understand blood supply dynamics"
          />

          <div className="space-y-8">
            {landingData.aiFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="animate-fade-in-up flex flex-col gap-8 rounded-lg border border-gray-200 bg-white p-8 md:flex-row md:items-center"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-blood-100 text-blood-600">
                  <Brain className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
                <div className="rounded-lg bg-blood-50 px-6 py-4 text-right">
                  <p className="text-sm text-gray-600">Impact</p>
                  <p className="text-2xl font-bold text-blood-600">{feature.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Predictions Section */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="Live AI Predictions"
            subtitle="Real-time forecasting powered by machine learning algorithms"
          />

          {/* Blood Shortage Prediction */}
          <div className="mb-8 animate-fade-in-up rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Blood Shortage Prediction</h3>
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
          </div>

          {/* Demand Prediction */}
          <div className="mb-8 animate-fade-in-up rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">7-Day Demand Forecast</h3>
            </div>
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandPrediction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="O_positive" stroke="#dc2626" name="O+" strokeWidth={2} />
                  <Line type="monotone" dataKey="A_positive" stroke="#2563eb" name="A+" strokeWidth={2} />
                  <Line type="monotone" dataKey="B_positive" stroke="#059669" name="B+" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supply vs Demand */}
          <div className="animate-fade-in-up rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Supply vs Demand Analysis</h3>
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
                  <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Balance" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Map Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="Blood Intelligence Map"
            subtitle="Real-time geographical tracking of blood supply across India"
          />

          <div className="animate-fade-in-up rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Map Container */}
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50" style={{ minHeight: '600px' }}>
                <AccurateIndiaMap selectedState={selectedState} onStateSelect={handleStateSelect} />
              </div>

              {/* State Info Panel */}
              <div className="w-full rounded-lg border border-gray-200 bg-white p-6 lg:w-96">
                {selectedState ? (() => {
                  const stateData = getStateData(selectedState)
                  if (!stateData) {
                    return (
                      <div className="flex h-full flex-col items-center justify-center">
                        <Heart className="mb-4 h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">No data available for this state</p>
                      </div>
                    )
                  }
                  const totalUnits = Object.values(stateData.bloodAvailability).reduce((a: number, b: number) => a + b, 0)
                  const totalRequired = Object.values(stateData.bloodRequirement).reduce((a: number, b: number) => a + b, 0)
                  const healthPercentage = Math.round((totalUnits / (totalRequired || 1)) * 100)

                  return (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedState}</h3>
                      <p className="mt-2 text-sm text-gray-600">Blood Supply Status</p>
                      <div className="mt-6 space-y-4">
                        <div className="rounded-lg border border-gray-200 p-4">
                          <p className="text-sm text-gray-600">Total Available Units</p>
                          <p className="mt-1 text-2xl font-bold text-blood-600">{totalUnits.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                          <p className="text-sm text-gray-600">Hospitals</p>
                          <p className="mt-1 text-lg font-semibold text-blue-600">{stateData.hospitals}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                          <p className="text-sm text-gray-600">Blood Banks</p>
                          <p className="mt-1 text-lg font-semibold text-green-600">{stateData.bloodBanks}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                          <p className="text-sm text-gray-600">Risk Level</p>
                          <p className={`mt-1 text-lg font-semibold capitalize ${stateData.shortageRiskLevel === 'critical' ? 'text-red-700' : stateData.shortageRiskLevel === 'high' ? 'text-red-600' : stateData.shortageRiskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                            {stateData.shortageRiskLevel}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                          <p className="text-sm text-gray-600">Inventory Health</p>
                          <p className="mt-1 text-lg font-semibold text-green-600">{Math.max(0, Math.min(100, healthPercentage))}% Optimal</p>
                        </div>
                      </div>
                    </div>
                  )
                })() : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <Heart className="mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Select a state on the map to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="How BloodBridge Works"
            subtitle="A seamless workflow that connects data, AI, and action"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {landingData.howItWorks.map((step, idx) => (
              <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <StepCard
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                />
              </div>
            ))}
          </div>

          {/* Flow Visualization */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blood-600 text-white font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <ArrowRight className="hidden text-blood-600 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* User Roles Section */}
      <section id="roles" className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="Built for Everyone"
            subtitle="Tailored experiences for each stakeholder in the blood supply ecosystem"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {landingData.roles.map((role, idx) => (
              <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <RoleCard
                  icon={<span className="text-3xl">{role.icon}</span>}
                  title={role.title}
                  description={role.description}
                  features={role.features}
                  color={role.color}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Ready to Transform Blood Supply Management?
          </h2>
          <p className="mt-6 text-lg text-gray-700">
            Join hospitals, blood banks, and donors saving lives with AI-powered blood supply intelligence.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-lg bg-blood-600 px-8 py-4 font-semibold text-white transition-all hover:bg-blood-700 hover:shadow-lg"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="rounded-lg border-2 border-blood-600 px-8 py-4 font-semibold text-blood-600 transition-all hover:bg-blood-50">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="h-8 w-8 text-blood-600" />
                <span className="text-2xl font-bold text-blood-600">{landingData.footer.company}</span>
              </div>
              <p className="mt-4 text-gray-400">{landingData.footer.tagline}</p>
            </div>

            <div>
              <h3 className="font-bold">Product</h3>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#roles" className="hover:text-white">Roles</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold">Company</h3>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold">Legal</h3>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {landingData.footer.year} {landingData.footer.company}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
