'use client';

import Link from 'next/link';
import { Heart, AlertCircle, Loader, Users, Building2, Droplet, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

type UserRole = 'donor' | 'hospital' | 'blood-bank' | 'admin' | null;

const roles = [
  {
    id: 'Donor',
    title: 'Donor',
    icon: <Droplet className="h-8 w-8" />,
    description: 'Save lives by donating blood',
    email: 'donor1@example.com',
    password: 'SecurePass123!',
  },
  {
    id: 'Hospital',
    title: 'Hospital',
    icon: <Building2 className="h-8 w-8" />,
    description: 'Manage blood inventory and requests',
    email: 'hospital1@example.com',
    password: 'SecurePass123!',
  },
  {
    id: 'BloodBank',
    title: 'Blood Bank',
    icon: <Users className="h-8 w-8" />,
    description: 'Coordinate blood supply and distribution',
    email: 'bloodbank1@example.com',
    password: 'SecurePass123!',
  },
  {
    id: 'Admin',
    title: 'Admin',
    icon: <Shield className="h-8 w-8" />,
    description: 'Monitor system and analytics',
    email: 'admin@example.com',
    password: 'AdminPass123!',
  },
];

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    const selectedRoleObj = roles.find(r => r.id === role);
    setSelectedRole(role as UserRole);
    setEmail(selectedRoleObj?.email || '');
    setPassword(selectedRoleObj?.password || '');
    setLocalError(null);
  };

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

  const selectedRoleObj = selectedRole ? roles.find(r => r.id === selectedRole) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blood-50 to-gray-100">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          <div className="mb-8 flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-blood-600" />
            <span className="text-2xl font-bold text-blood-600">BloodBridge</span>
          </div>

          {!selectedRole ? (
            <>
              <h1 className="text-center text-2xl font-bold text-gray-900">Who would you like to login as?</h1>
              <p className="mt-2 text-center text-gray-600">Choose your role to get started</p>

              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="group flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-blood-600 hover:bg-blood-50"
                  >
                    <div className="text-blood-600 group-hover:scale-110 transition-transform">
                      {role.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{role.title}</h3>
                    <p className="text-xs text-center text-gray-600">{role.description}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-2">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  ← Back
                </button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">Login as {selectedRoleObj?.title}</h1>
                  <p className="mt-1 text-sm text-gray-600">{selectedRoleObj?.description}</p>
                </div>
              </div>

              {(error || localError) && (
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error || localError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                <p className="font-semibold mb-2">Demo Credentials:</p>
                <p>Email: {selectedRoleObj?.email}</p>
                <p>Password: {selectedRoleObj?.password}</p>
              </div>
            </>
          )}

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
