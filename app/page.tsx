import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blood-50 to-gray-100">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-blood-600" />
              <span className="text-2xl font-bold text-blood-600">BloodBridge</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-700 hover:text-blood-600">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900">
            AI-Powered Blood Supply Intelligence
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Predicting shortages. Reducing waste. Connecting blood donors, hospitals, and blood banks in real-time.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/donor"
              className="rounded-lg bg-blood-600 px-8 py-3 font-semibold text-white hover:bg-blood-700"
            >
              Donor Dashboard
            </Link>
            <Link
              href="/hospital"
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Hospital Dashboard
            </Link>
            <Link
              href="/blood-bank"
              className="rounded-lg bg-amber-600 px-8 py-3 font-semibold text-white hover:bg-amber-700"
            >
              Blood Bank Dashboard
            </Link>
            <Link
              href="/admin"
              className="rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
