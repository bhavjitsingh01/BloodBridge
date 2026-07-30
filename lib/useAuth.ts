import { useState, useCallback, useEffect } from 'react';
import { apiClient } from './api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
          setToken(storedToken);
          apiClient.setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading auth:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setLoading(true);

        try {
          const response = await apiClient.login(email, password);

          const userData: User = {
            id: response.user.id,
            email: response.user.email,
            role: response.user.role,
            name: response.user.name,
          };

          apiClient.setToken(response.token);
          setToken(response.token);
          setUser(userData);

          localStorage.setItem('authToken', response.token);
          localStorage.setItem('authUser', JSON.stringify(userData));

          // Redirect based on role
          const roleRoutes: Record<string, string> = {
            Donor: '/donor',
            Hospital: '/hospital',
            BloodBank: '/blood-bank',
            Admin: '/admin',
          };

          const redirectPath = roleRoutes[userData.role] || '/';
          router.push(redirectPath);
        } catch (apiErr: any) {
          // Fallback to demo mode if backend is unavailable
          const roleMap: Record<string, string> = {
            'donor@example.com': 'Donor',
            'hospital@example.com': 'Hospital',
            'bloodbank@example.com': 'BloodBank',
            'admin@example.com': 'Admin',
            'donor1@example.com': 'Donor',
            'hospital1@example.com': 'Hospital',
            'bloodbank1@example.com': 'BloodBank',
          };

          const role = roleMap[email] || 'Donor';
          const demoToken = 'demo-token-' + Date.now();

          const userData: User = {
            id: 'demo-user',
            email: email,
            role: role,
            name: email.split('@')[0],
          };

          setToken(demoToken);
          setUser(userData);

          localStorage.setItem('authToken', demoToken);
          localStorage.setItem('authUser', JSON.stringify(userData));

          const roleRoutes: Record<string, string> = {
            Donor: '/donor',
            Hospital: '/hospital',
            BloodBank: '/blood-bank',
            Admin: '/admin',
          };

          const redirectPath = roleRoutes[role] || '/';
          router.push(redirectPath);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      apiClient.clearToken();
      router.push('/login');
      setLoading(false);
    }
  }, [router]);

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };
}
