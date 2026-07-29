'use client';

import Link from 'next/link';
import { Heart, AlertCircle, Loader } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blood-50 to-gray-100">
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          <div className="mb-8 flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-blood-600" />
            <span className="text-2xl font-bold text-blood-600">BloodBridge</span>
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-center text-gray-600">Connect to your dashboard</p>

          {(error || localError) && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error || localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blood-500 focus:outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blood-500 focus:outline-none"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blood-600 py-3 font-semibold text-white hover:bg-blood-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo Credentials:
              <br />
              Email: hospital@example.com
              <br />
              Password: SecurePass123!
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-blood-600 hover:text-blood-700">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
