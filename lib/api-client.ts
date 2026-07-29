const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
    }
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('authToken', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('authToken')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken()
        }
        throw new Error(data.error?.message || 'An error occurred')
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()

// Auth API
export const authAPI = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh-token'),
  getCurrentUser: () => apiClient.get('/auth/me'),
}

// Hospital API
export const hospitalAPI = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get(`/hospitals?page=${page}&limit=${limit}`),
  getById: (id: string) => apiClient.get(`/hospitals/${id}`),
  create: (data: any) => apiClient.post('/hospitals', data),
  update: (id: string, data: any) => apiClient.put(`/hospitals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/hospitals/${id}`),
  getNearby: (lat: number, lng: number, radius = 50) =>
    apiClient.get(`/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
}

// Blood Bank API
export const bloodBankAPI = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get(`/blood-banks?page=${page}&limit=${limit}`),
  getById: (id: string) => apiClient.get(`/blood-banks/${id}`),
  create: (data: any) => apiClient.post('/blood-banks', data),
  update: (id: string, data: any) =>
    apiClient.put(`/blood-banks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/blood-banks/${id}`),
  getNearby: (lat: number, lng: number, radius = 50) =>
    apiClient.get(
      `/blood-banks/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    ),
}

// Donor API
export const donorAPI = {
  getProfile: () => apiClient.get('/donors/profile'),
  updateProfile: (data: any) => apiClient.put('/donors/profile', data),
  getDonationHistory: (page = 1, limit = 10) =>
    apiClient.get(`/donors/donation-history?page=${page}&limit=${limit}`),
  checkEligibility: () => apiClient.get('/donors/eligibility'),
}

// Blood Inventory API
export const inventoryAPI = {
  getByLocation: (locationId: string) =>
    apiClient.get(`/inventory?locationId=${locationId}`),
  update: (data: any) => apiClient.patch('/inventory', data),
  transfer: (data: any) => apiClient.post('/inventory/transfer', data),
  getExpiring: () => apiClient.get('/inventory/expiring'),
  getCritical: () => apiClient.get('/inventory/critical'),
}

// Blood Request API
export const requestAPI = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get(`/requests?page=${page}&limit=${limit}`),
  getById: (id: string) => apiClient.get(`/requests/${id}`),
  create: (data: any) => apiClient.post('/requests', data),
  respond: (id: string, data: any) =>
    apiClient.post(`/requests/${id}/respond`, data),
  cancel: (id: string) => apiClient.post(`/requests/${id}/cancel`),
  getMyRequests: (page = 1, limit = 10) =>
    apiClient.get(`/requests/my-requests?page=${page}&limit=${limit}`),
}

// Emergency Request API
export const emergencyAPI = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get(`/emergency?page=${page}&limit=${limit}`),
  getById: (id: string) => apiClient.get(`/emergency/${id}`),
  create: (data: any) => apiClient.post('/emergency', data),
  respond: (id: string, data: any) =>
    apiClient.post(`/emergency/${id}/respond`, data),
  getMyEmergencies: () => apiClient.get('/emergency/my-emergencies'),
}

// Appointment API
export const appointmentAPI = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get(`/appointments?page=${page}&limit=${limit}`),
  getById: (id: string) => apiClient.get(`/appointments/${id}`),
  create: (data: any) => apiClient.post('/appointments', data),
  update: (id: string, data: any) =>
    apiClient.put(`/appointments/${id}`, data),
  cancel: (id: string) => apiClient.post(`/appointments/${id}/cancel`),
  getMyAppointments: () => apiClient.get('/appointments/my-appointments'),
  getAvailableSlots: (centerId: string, date: string) =>
    apiClient.get(`/appointments/available-slots?centerId=${centerId}&date=${date}`),
}

// Prediction API
export const predictionAPI = {
  getBloodShortagePrediction: () =>
    apiClient.get('/predictions/blood-shortage'),
  getDemandPrediction: (days = 7) =>
    apiClient.get(`/predictions/demand?days=${days}`),
  getExpiryPrediction: () => apiClient.get('/predictions/expiry'),
  getSupplyVsDemand: () => apiClient.get('/predictions/supply-vs-demand'),
  getAllPredictions: () => apiClient.get('/predictions/all'),
}

// Notification API
export const notificationAPI = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get(`/notifications?page=${page}&limit=${limit}`),
  getUnread: () => apiClient.get('/notifications/unread'),
  markAsRead: (id: string) =>
    apiClient.post(`/notifications/${id}/mark-as-read`),
  markAllAsRead: () => apiClient.post('/notifications/mark-all-as-read'),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
}

// Dashboard API
export const dashboardAPI = {
  getDonorDashboard: () => apiClient.get('/dashboard/donor'),
  getHospitalDashboard: () => apiClient.get('/dashboard/hospital'),
  getBloodBankDashboard: () => apiClient.get('/dashboard/blood-bank'),
  getAdminDashboard: () => apiClient.get('/dashboard/admin'),
  getSystemStats: () => apiClient.get('/dashboard/system-stats'),
  getCityBloodAvailability: () =>
    apiClient.get('/dashboard/city-blood-availability'),
}

// Admin API
export const adminAPI = {
  getSystemStats: () => apiClient.get('/admin/system-stats'),
  getAllHospitals: (page = 1, limit = 20) =>
    apiClient.get(`/admin/hospitals?page=${page}&limit=${limit}`),
  getAllBloodBanks: (page = 1, limit = 20) =>
    apiClient.get(`/admin/blood-banks?page=${page}&limit=${limit}`),
  getAllDonors: (page = 1, limit = 20) =>
    apiClient.get(`/admin/donors?page=${page}&limit=${limit}`),
  getEmergencyRequests: (page = 1, limit = 20) =>
    apiClient.get(`/admin/emergency-requests?page=${page}&limit=${limit}`),
  updateUserRole: (userId: string, role: string) =>
    apiClient.patch(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) =>
    apiClient.delete(`/admin/users/${userId}`),
}
