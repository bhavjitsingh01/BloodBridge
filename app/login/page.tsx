import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blood-50 to-gray-100">
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          <div className="mb-8 flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-blood-600" />
            <span className="text-2xl font-bold text-blood-600">BloodBridge</span>
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-center text-gray-600">Select your role to continue</p>

          <div className="mt-8 space-y-3">
            <Link
              href="/donor"
              className="block rounded-lg bg-blood-600 py-3 text-center font-semibold text-white hover:bg-blood-700"
            >
              Login as Donor
            </Link>
            <Link
              href="/hospital"
              className="block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              Login as Hospital
            </Link>
            <Link
              href="/blood-bank"
              className="block rounded-lg bg-amber-600 py-3 text-center font-semibold text-white hover:bg-amber-700"
            >
              Login as Blood Bank
            </Link>
            <Link
              href="/admin"
              className="block rounded-lg bg-gray-800 py-3 text-center font-semibold text-white hover:bg-gray-900"
            >
              Login as Admin
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-blood-600 hover:text-blood-700">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
